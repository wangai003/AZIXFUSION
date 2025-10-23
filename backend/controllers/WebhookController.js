const PaymentController = require('./PaymentController');

class WebhookController {
    /**
     * Handle MoonPay webhook with enhanced logging and monitoring
     */
    async handleMoonPayWebhook(req, res) {
        const startTime = Date.now();
        const requestId = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log(`[${requestId}] MoonPay webhook received`, {
            headers: req.headers,
            body: req.body,
            timestamp: new Date().toISOString()
        });

        try {
            // Call the main payment controller
            await PaymentController.handleMoonPayWebhook(req, res);

            const processingTime = Date.now() - startTime;
            console.log(`[${requestId}] MoonPay webhook processed successfully in ${processingTime}ms`);

        } catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`[${requestId}] MoonPay webhook processing failed after ${processingTime}ms:`, error);

            // Log detailed error information
            console.error(`[${requestId}] Error details:`, {
                message: error.message,
                stack: error.stack,
                headers: req.headers,
                body: req.body
            });

            // Return error response if not already sent
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Webhook processing failed',
                    requestId
                });
            }
        }
    }

    /**
     * Health check endpoint for webhook monitoring
     */
    async webhookHealthCheck(req, res) {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            webhookEndpoints: {
                moonpay: '/payments/webhook/moonpay',
                moonpayTest: '/payments/webhook/moonpay/test'
            },
            environment: process.env.NODE_ENV || 'development'
        };

        // Check if required services are available
        try {
            // You could add database connectivity checks here
            health.database = 'connected';
        } catch (error) {
            health.database = 'disconnected';
            health.status = 'degraded';
        }

        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    }

    /**
     * Get webhook logs (for debugging - should be protected in production)
     */
    async getWebhookLogs(req, res) {
        // In production, this should be secured and possibly stored in a database
        // For now, return a simple response
        res.json({
            message: 'Webhook logs endpoint - implement logging storage for production',
            availableLogs: [],
            note: 'Implement persistent logging for production use'
        });
    }

    /**
     * Test webhook endpoint for development
     */
    async testWebhook(req, res) {
        const testPayload = {
            externalId: 'test_pi_123456',
            status: 'completed',
            transactionId: 'test_tx_789',
            amount: 100,
            currency: 'USDC'
        };

        console.log('Test webhook payload:', testPayload);

        // Simulate webhook processing
        try {
            // Create a mock request object
            const mockReq = {
                headers: {
                    'moonpay-signature': 'test_signature'
                },
                body: testPayload
            };

            // Call the actual webhook handler
            await this.handleMoonPayWebhook(mockReq, res);
        } catch (error) {
            res.status(500).json({
                error: 'Test webhook failed',
                details: error.message
            });
        }
    }
}

module.exports = new WebhookController();