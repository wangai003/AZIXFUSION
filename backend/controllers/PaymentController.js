const PaymentService = require('../services/PaymentService');
const StellarService = require('../services/StellarService');
const ErrorRecoveryService = require('../services/ErrorRecoveryService');
const MonitoringService = require('../services/MonitoringService');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');

class PaymentController {
    /**
     * Get current exchange rates
     */
    async getExchangeRates(req, res) {
        try {
            const rates = await PaymentService.fetchExchangeRates();
            res.json({
                success: true,
                rates,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch exchange rates'
            });
        }
    }

    /**
     * Lock rates for payment intent
     */
    async lockRates(req, res) {
        try {
            const { selectedCurrency } = req.body;

            if (!selectedCurrency) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected currency is required'
                });
            }

            const lockedRates = PaymentService.lockRates(selectedCurrency);

            res.json({
                success: true,
                lockedRates,
                expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
            });
        } catch (error) {
            console.error('Error locking rates:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to lock rates'
            });
        }
    }

    /**
     * Initiate MoonPay payment
     */
    async initiateMoonPayPayment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const {
                orderData,
                lockedRates,
                walletAddress,
                selectedCurrency
            } = req.body;

            const userId = req.user?.id || req.body.userId; // From auth middleware

            // Validate locked rates
            if (!PaymentService.validateLockedRates(lockedRates)) {
                return res.status(400).json({
                    success: false,
                    message: 'Rate validation failed. Please refresh and try again.'
                });
            }

            // Calculate converted amount
            const orderTotalAkofa = orderData.total + (orderData.shipping || 0) + (orderData.taxes || 0);
            const convertedAmount = PaymentService.convertAmount(
                orderTotalAkofa,
                'AKOFA',
                selectedCurrency,
                lockedRates
            );

            // Create payment intent order
            const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const paymentIntentOrder = {
                ...orderData,
                user: userId,
                paymentIntentId,
                lockedRates,
                selectedCurrency,
                convertedAmount,
                paymentStatus: 'pending',
                paymentGateway: 'moonpay',
                auditLog: [{
                    action: 'payment_initiated',
                    timestamp: new Date(),
                    details: { convertedAmount, selectedCurrency }
                }]
            };

            const savedOrder = await Order.create(paymentIntentOrder);

            // Create MoonPay payment
            const moonpayData = {
                amount: convertedAmount,
                currency: selectedCurrency,
                walletAddress: walletAddress || process.env.DEFAULT_WALLET_ADDRESS,
                userEmail: req.user?.email || orderData.userEmail,
                paymentIntentId
            };

            const moonpayResponse = await PaymentService.createMoonPayPayment(moonpayData);

            // Update order with MoonPay transaction ID
            await Order.updateById(savedOrder._id, {
                moonpayTransactionId: moonpayResponse.transactionId,
                auditLog: [
                    ...savedOrder.auditLog,
                    {
                        action: 'moonpay_transaction_created',
                        timestamp: new Date(),
                        details: { transactionId: moonpayResponse.transactionId }
                    }
                ]
            });

            res.json({
                success: true,
                paymentUrl: moonpayResponse.paymentUrl,
                paymentIntentId,
                orderId: savedOrder._id
            });

        } catch (error) {
            console.error('Error initiating MoonPay payment:', error);

            // Log failure for audit
            if (req.body.orderData) {
                // Could save failed attempt to database here
            }

            res.status(500).json({
                success: false,
                message: 'Failed to initiate payment. Please try again.'
            });
        }
    }

    /**
     * Handle MoonPay webhook
     */
    async handleMoonPayWebhook(req, res) {
        try {
            const signature = req.headers['moonpay-signature'];
            const payload = req.body;

            // Verify webhook signature
            if (!PaymentService.verifyWebhookSignature(payload, signature)) {
                console.error('Invalid webhook signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }

            const { externalId, status, transactionId } = payload;

            // Find order by payment intent ID
            const order = await Order.findOne({ paymentIntentId: externalId });
            if (!order) {
                console.error('Order not found for payment intent:', externalId);
                return res.status(404).json({ error: 'Order not found' });
            }

            // Update order status based on MoonPay status
            let newStatus = 'pending';
            let orderStatus = order.status || 'pending';

            if (status === 'completed') {
                newStatus = 'paid';
                orderStatus = 'confirmed'; // Mark order as confirmed/complete
                MonitoringService.recordPayment('paid', order.convertedAmount, order.selectedCurrency);
            } else if (status === 'failed') {
                newStatus = 'failed';
                orderStatus = 'cancelled';
                MonitoringService.recordPayment('failed', order.convertedAmount, order.selectedCurrency);
            }

            MonitoringService.recordWebhook('processed');

            const auditEntry = {
                action: 'webhook_received',
                timestamp: new Date(),
                details: { moonpayStatus: status, transactionId }
            };

            // Update order with payment and order status
            await Order.updateById(order._id, {
                paymentStatus: newStatus,
                status: orderStatus,
                moonpayStatus: status,
                auditLog: [...(order.auditLog || []), auditEntry]
            });

            // Trigger complete order fulfillment if payment completed
            if (newStatus === 'paid' && orderStatus === 'confirmed') {
                try {
                    await this.fulfillOrder(order);

                    // Send notifications with error recovery
                    const NotificationService = require('../services/NotificationService');

                    await ErrorRecoveryService.handleNotificationError(
                        `payment_success_${externalId}`,
                        () => NotificationService.sendPaymentStatusNotification(order.user, externalId, 'paid')
                    );

                    await ErrorRecoveryService.handleNotificationError(
                        `order_confirmed_${order._id}`,
                        () => NotificationService.sendOrderStatusNotification(order.user, order._id, 'confirmed', 'moonpay')
                    );

                } catch (fulfillmentError) {
                    console.error('Order fulfillment failed, queuing for retry:', fulfillmentError);

                    // Queue fulfillment for retry
                    await ErrorRecoveryService.handleFulfillmentError(
                        order._id,
                        () => this.fulfillOrder(order)
                    );
                }
            }

            res.json({ success: true });

        } catch (error) {
            console.error('Webhook processing error:', error);
            MonitoringService.recordWebhook('failed');
            MonitoringService.addAlert('webhook_error', `Webhook processing failed: ${error.message}`, 'error');
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    /**
     * Complete order fulfillment after successful payment
     */
    async fulfillOrder(order) {
        try {
            console.log('Fulfilling order:', order._id);

            // Import required services
            const Cart = require('../models/Cart');
            const User = require('../models/User');
            const Product = require('../models/Product');
            const { sendOrderConfirmationEmail } = require('../utils/Emails');

            // 1. Clear user's cart
            if (order.user) {
                await Cart.updateMany(
                    { user: order.user },
                    { $set: { items: [] } }
                );
                console.log('Cart cleared for user:', order.user);
            }

            // 2. Update product inventory (if applicable)
            if (order.item && Array.isArray(order.item)) {
                for (const cartItem of order.item) {
                    if (cartItem.product && cartItem.quantity) {
                        // Decrease product stock
                        await Product.updateById(cartItem.product._id || cartItem.product, {
                            $inc: { stock: -cartItem.quantity }
                        });
                    }
                }
                console.log('Inventory updated for order:', order._id);
            }

            // 3. Send order confirmation email
            try {
                const user = await User.findById(order.user);
                if (user && user.email) {
                    await sendOrderConfirmationEmail(user.email, order);
                    console.log('Confirmation email sent to:', user.email);
                }
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
                // Don't fail the whole process for email errors
            }

            // 4. Log successful fulfillment
            await Order.updateById(order._id, {
                auditLog: [
                    ...(order.auditLog || []),
                    {
                        action: 'order_fulfilled',
                        timestamp: new Date(),
                        details: { fulfillmentCompleted: true }
                    }
                ]
            });

            console.log('Order fulfillment completed for:', order._id);

        } catch (error) {
            console.error('Order fulfillment failed:', error);

            // Mark order as fulfillment failed but payment successful
            await Order.updateById(order._id, {
                status: 'payment_completed_fulfillment_failed',
                auditLog: [
                    ...(order.auditLog || []),
                    {
                        action: 'fulfillment_failed',
                        timestamp: new Date(),
                        details: { error: error.message }
                    }
                ]
            });

            // Could trigger alerts for manual intervention here
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(req, res) {
        try {
            const { paymentIntentId } = req.params;

            const order = await Order.findOne({ paymentIntentId });
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            res.json({
                success: true,
                status: order.paymentStatus,
                orderId: order._id,
                moonpayStatus: order.moonpayStatus
            });

        } catch (error) {
            console.error('Error getting payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment status'
            });
        }
    }

    /**
     * Check Stellar wallet balance
     */
    async checkStellarBalance(req, res) {
        try {
            const { publicKey, assetCode, issuer } = req.params;

            if (!publicKey) {
                return res.status(400).json({
                    success: false,
                    message: 'Public key is required'
                });
            }

            if (!StellarService.isValidPublicKey(publicKey)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Stellar public key format'
                });
            }

            const balance = await StellarService.checkBalance(publicKey, assetCode, issuer);

            res.json({
                success: true,
                balance,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error checking Stellar balance:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to check Stellar balance'
            });
        }
    }

    /**
     * Get Stellar account details
     */
    async getStellarAccount(req, res) {
        try {
            const { publicKey } = req.params;

            if (!publicKey) {
                return res.status(400).json({
                    success: false,
                    message: 'Public key is required'
                });
            }

            if (!StellarService.isValidPublicKey(publicKey)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Stellar public key format'
                });
            }

            const account = await StellarService.getAccountDetails(publicKey);

            res.json({
                success: true,
                account,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error getting Stellar account:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get Stellar account details'
            });
        }
    }

    /**
     * Initiate Stellar payment
     */
    async initiateStellarPayment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const {
                orderData,
                fromPublicKey,
                toPublicKey,
                amount,
                assetCode,
                issuer,
                memo
            } = req.body;

            const userId = req.user?.id || req.body.userId;

            // Validate keys
            if (!StellarService.isValidPublicKey(fromPublicKey) || !StellarService.isValidPublicKey(toPublicKey)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Stellar public key format'
                });
            }

            // Check sender balance
            const balance = await StellarService.checkBalance(fromPublicKey, assetCode, issuer);
            if (balance.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient balance for payment'
                });
            }

            // Create payment intent ID
            const paymentIntentId = `stellar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Create order record
            const stellarOrder = {
                ...orderData,
                user: userId,
                paymentIntentId,
                fromPublicKey,
                toPublicKey,
                amount,
                assetCode: assetCode || StellarService.assetCode,
                issuer: issuer || StellarService.assetIssuer,
                paymentStatus: 'pending',
                paymentGateway: 'stellar',
                memo,
                auditLog: [{
                    action: 'stellar_payment_initiated',
                    timestamp: new Date(),
                    details: { fromPublicKey, toPublicKey, amount, assetCode, issuer }
                }]
            };

            const savedOrder = await Order.create(stellarOrder);

            res.json({
                success: true,
                paymentIntentId,
                orderId: savedOrder._id,
                fromPublicKey,
                toPublicKey,
                amount,
                assetCode: assetCode || StellarService.assetCode,
                issuer: issuer || StellarService.assetIssuer,
                network: StellarService.isTestnet ? 'testnet' : 'mainnet'
            });

        } catch (error) {
            console.error('Error initiating Stellar payment:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to initiate Stellar payment. Please try again.'
            });
        }
    }

    /**
     * Submit signed Stellar transaction
     */
    async submitStellarTransaction(req, res) {
        try {
            const { paymentIntentId, signedTransactionXdr } = req.body;

            if (!paymentIntentId || !signedTransactionXdr) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment intent ID and signed transaction XDR are required'
                });
            }

            // Find order
            const order = await Order.findOne({ paymentIntentId });
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment intent not found'
                });
            }

            if (order.paymentStatus !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Payment already processed'
                });
            }

            // Submit transaction with error recovery
            const result = await ErrorRecoveryService.handlePaymentError(
                `stellar_submit_${paymentIntentId}`,
                async () => {
                    return await StellarService.submitTransaction(signedTransactionXdr);
                },
                { paymentIntentId, signedTransactionXdr }
            );

            // Update order status
            let newStatus = 'pending';
            let orderStatus = order.status || 'pending';

            if (result.successful) {
                newStatus = 'paid';
                orderStatus = 'confirmed';
                MonitoringService.recordPayment('paid', order.amount, order.assetCode);
            } else {
                newStatus = 'failed';
                orderStatus = 'cancelled';
                MonitoringService.recordPayment('failed', order.amount, order.assetCode);
            }

            const auditEntry = {
                action: 'stellar_transaction_submitted',
                timestamp: new Date(),
                details: {
                    transactionHash: result.hash,
                    successful: result.successful,
                    ledger: result.ledger,
                    fee: result.fee
                }
            };

            await Order.updateById(order._id, {
                paymentStatus: newStatus,
                status: orderStatus,
                stellarTransactionHash: result.hash,
                stellarLedger: result.ledger,
                stellarFee: result.fee,
                auditLog: [...(order.auditLog || []), auditEntry]
            });

            // Trigger order fulfillment if payment successful
            if (newStatus === 'paid' && orderStatus === 'confirmed') {
                try {
                    await this.fulfillOrder(order);
                } catch (fulfillmentError) {
                    console.error('Order fulfillment failed, queuing for retry:', fulfillmentError);
                    await ErrorRecoveryService.handleFulfillmentError(
                        order._id,
                        () => this.fulfillOrder(order)
                    );
                }
            }

            res.json({
                success: true,
                transactionHash: result.hash,
                successful: result.successful,
                ledger: result.ledger,
                fee: result.fee,
                orderId: order._id
            });

        } catch (error) {
            console.error('Error submitting Stellar transaction:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to submit Stellar transaction'
            });
        }
    }

    /**
     * Verify Stellar transaction
     */
    async verifyStellarTransaction(req, res) {
        try {
            const { transactionHash } = req.params;

            if (!transactionHash) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction hash is required'
                });
            }

            const verification = await StellarService.verifyTransaction(transactionHash);

            res.json({
                success: true,
                verification,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error verifying Stellar transaction:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to verify Stellar transaction'
            });
        }
    }

    /**
     * Get Stellar transaction history
     */
    async getStellarTransactionHistory(req, res) {
        try {
            const { publicKey } = req.params;
            const { limit, cursor } = req.query;

            if (!publicKey) {
                return res.status(400).json({
                    success: false,
                    message: 'Public key is required'
                });
            }

            if (!StellarService.isValidPublicKey(publicKey)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Stellar public key format'
                });
            }

            const history = await StellarService.getTransactionHistory(
                publicKey,
                limit ? parseInt(limit) : 20,
                cursor
            );

            res.json({
                success: true,
                history,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error getting Stellar transaction history:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get Stellar transaction history'
            });
        }
    }

    /**
     * Get Stellar network status
     */
    async getStellarNetworkStatus(req, res) {
        try {
            const status = await StellarService.getNetworkStatus();

            res.json({
                success: true,
                status,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error getting Stellar network status:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get Stellar network status'
            });
        }
    }

    /**
     * Handle payment for AKOFA (future gateway placeholder)
     */
    async initiateAkofaPayment(req, res) {
        // Placeholder for future AKOFA payment gateway
        res.status(501).json({
            success: false,
            message: 'AKOFA payment gateway not yet implemented'
        });
    }
}

module.exports = new PaymentController();