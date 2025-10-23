const express = require('express');
const { body } = require('express-validator');
const PaymentController = require('../controllers/PaymentController');
const WebhookController = require('../controllers/WebhookController');
const ErrorRecoveryService = require('../services/ErrorRecoveryService');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting for payment endpoints
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 payment requests per windowMs
    message: {
        success: false,
        message: 'Too many payment requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Get exchange rates (public endpoint with rate limiting)
router.get('/rates', rateLimiter, PaymentController.getExchangeRates);

// Lock rates for payment (requires authentication)
router.post('/rates/lock',
    rateLimiter,
    [
        body('selectedCurrency').isIn(['USDC', 'USDT', 'BTC', 'AKOFA']).withMessage('Invalid currency')
    ],
    PaymentController.lockRates
);

// MoonPay payment initiation (strict rate limiting and validation)
router.post('/moonpay/initiate',
    paymentLimiter,
    [
        body('orderData').isObject().withMessage('Order data is required'),
        body('orderData.total').isNumeric().withMessage('Order total must be numeric'),
        body('lockedRates').isObject().withMessage('Locked rates are required'),
        body('selectedCurrency').isIn(['USDC', 'USDT', 'BTC']).withMessage('Invalid currency for MoonPay'),
        body('walletAddress').optional().isString().withMessage('Invalid wallet address')
    ],
    PaymentController.initiateMoonPayPayment
);

// Stellar wallet balance check
router.get('/stellar/balance/:publicKey/:assetCode?/:issuer?',
    rateLimiter,
    PaymentController.checkStellarBalance
);

// Stellar account details
router.get('/stellar/account/:publicKey',
    rateLimiter,
    PaymentController.getStellarAccount
);

// Stellar payment initiation
router.post('/stellar/initiate',
    paymentLimiter,
    [
        body('orderData').isObject().withMessage('Order data is required'),
        body('fromPublicKey').isString().isLength({ min: 56, max: 56 }).withMessage('Valid from public key is required'),
        body('toPublicKey').isString().isLength({ min: 56, max: 56 }).withMessage('Valid to public key is required'),
        body('amount').isNumeric().withMessage('Amount must be numeric'),
        body('assetCode').optional().isString().withMessage('Asset code must be string'),
        body('issuer').optional().isString().withMessage('Issuer must be string'),
        body('memo').optional().isString().withMessage('Memo must be string')
    ],
    PaymentController.initiateStellarPayment
);

// Submit signed Stellar transaction
router.post('/stellar/submit',
    paymentLimiter,
    [
        body('paymentIntentId').isString().withMessage('Payment intent ID is required'),
        body('signedTransactionXdr').isString().withMessage('Signed transaction XDR is required')
    ],
    PaymentController.submitStellarTransaction
);

// Verify Stellar transaction
router.get('/stellar/verify/:transactionHash',
    rateLimiter,
    PaymentController.verifyStellarTransaction
);

// Stellar transaction history
router.get('/stellar/history/:publicKey',
    rateLimiter,
    PaymentController.getStellarTransactionHistory
);

// Stellar network status
router.get('/stellar/network',
    rateLimiter,
    PaymentController.getStellarNetworkStatus
);

// AKOFA payment initiation (placeholder for future implementation)
router.post('/akofa/initiate',
    paymentLimiter,
    [
        body('orderData').isObject().withMessage('Order data is required'),
        body('selectedCurrency').equals('AKOFA').withMessage('Currency must be AKOFA')
    ],
    PaymentController.initiateAkofaPayment
);

// MoonPay webhook (no rate limiting, but signature verification)
// IMPORTANT: This endpoint must be publicly accessible for MoonPay to send webhooks
// Configure this URL in your MoonPay dashboard: https://dashboard.moonpay.com/webhooks
router.post('/webhook/moonpay',
    express.raw({ type: 'application/json' }), // Raw body for signature verification
    WebhookController.handleMoonPayWebhook
);

// Alternative webhook endpoint for testing (with JSON parsing for easier debugging)
router.post('/webhook/moonpay/test',
    express.json(), // Parse JSON for testing
    WebhookController.handleMoonPayWebhook
);

// Webhook health check and monitoring
router.get('/webhook/health', WebhookController.webhookHealthCheck);

// Webhook logs (for debugging - protect in production)
router.get('/webhook/logs', WebhookController.getWebhookLogs);

// Test webhook endpoint
router.post('/webhook/test', WebhookController.testWebhook);

// Error recovery endpoints (admin only - protect in production)
router.get('/errors/stats', (req, res) => {
    res.json(ErrorRecoveryService.getStats());
});

router.post('/errors/retry/:operationId', (req, res) => {
    const { operationId } = req.params;
    ErrorRecoveryService.manualRetry(operationId)
        .then(() => res.json({ success: true, message: 'Retry queued' }))
        .catch(error => res.status(400).json({ success: false, error: error.message }));
});

router.delete('/errors/clear', (req, res) => {
    const cleared = ErrorRecoveryService.clearOldFailedOperations();
    res.json({ success: true, cleared });
});

// Monitoring endpoints
router.get('/monitoring/health', (req, res) => {
    const MonitoringService = require('../services/MonitoringService');
    res.json(MonitoringService.getHealthStatus());
});

router.get('/monitoring/metrics', (req, res) => {
    const MonitoringService = require('../services/MonitoringService');
    res.json(MonitoringService.exportMetrics());
});

// Get payment status
router.get('/status/:paymentIntentId',
    rateLimiter,
    PaymentController.getPaymentStatus
);

module.exports = router;
