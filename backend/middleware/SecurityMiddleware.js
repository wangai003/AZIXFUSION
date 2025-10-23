const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers middleware
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.moonpay.com", "https://api.moonpay-staging.com", "https://api.coingecko.com"],
        },
    },
    crossOriginEmbedderPolicy: false, // Disable for payment integrations
});

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for sensitive operations
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many sensitive requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Payment-specific rate limiter
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 payment initiations per windowMs
    message: {
        success: false,
        message: 'Too many payment requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Basic input sanitization
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/<[^>]*>/g, '')
                  .trim();
    };

    const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = sanitizeString(value);
            } else if (typeof value === 'object') {
                sanitized[key] = sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    };

    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

// Request logging middleware for payments
const paymentLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`[${timestamp}] PAYMENT_REQUEST: ${req.method} ${req.originalUrl} - IP: ${ip} - UA: ${userAgent.substring(0, 100)}`);

    // Log response
    const originalSend = res.send;
    res.send = function(data) {
        console.log(`[${new Date().toISOString()}] PAYMENT_RESPONSE: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
        originalSend.call(this, data);
    };

    next();
};

// CSRF protection for payment forms (simplified)
const csrfProtection = (req, res, next) => {
    // In production, implement proper CSRF tokens
    // For now, we'll rely on CORS and authentication
    next();
};

module.exports = {
    securityHeaders,
    apiLimiter,
    strictLimiter,
    paymentLimiter,
    sanitizeInput,
    paymentLogger,
    csrfProtection
};