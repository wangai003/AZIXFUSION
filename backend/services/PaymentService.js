const axios = require('axios');
const crypto = require('crypto');
const ErrorRecoveryService = require('./ErrorRecoveryService');

class PaymentService {
    constructor() {
        this.moonpayApiKey = process.env.MOONPAY_API_KEY;
        this.moonpaySecret = process.env.MOONPAY_SECRET_KEY;
        this.moonpayBaseUrl = process.env.MOONPAY_ENVIRONMENT === 'production'
            ? 'https://api.moonpay.com'
            : 'https://api.moonpay-staging.com';

        // Rate providers with fallback
        this.rateProviders = [
            { name: 'moonpay', url: `${this.moonpayBaseUrl}/v3/currencies/`, priority: 1 },
            { name: 'coingecko', url: 'https://api.coingecko.com/api/v3/simple/price', priority: 2 },
        ];

        this.rateCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Fetch exchange rates from multiple providers with fallback and retry
     */
    async fetchExchangeRates() {
        const cached = this.getCachedRates();
        if (cached) return cached;

        const rates = {};

        // Try MoonPay first with error recovery
        try {
            const moonpayRates = await ErrorRecoveryService.handleRateFetchError(
                'moonpay',
                () => this.fetchMoonPayRates(),
                () => this.fetchCoinGeckoRates() // Fallback for MoonPay
            );
            Object.assign(rates, moonpayRates);
        } catch (error) {
            console.warn('MoonPay rates fetch failed with retry:', error.message);
        }

        // Fallback to CoinGecko for missing rates with retry
        try {
            const coingeckoRates = await ErrorRecoveryService.handleRateFetchError(
                'coingecko',
                () => this.fetchCoinGeckoRates(),
                () => ({}) // No fallback for CoinGecko
            );
            Object.assign(rates, coingeckoRates);
        } catch (error) {
            console.warn('CoinGecko rates fetch failed with retry:', error.message);
        }

        // Ensure AKOFA base rate
        rates.AKOFA = 1;

        this.setCachedRates(rates);
        return rates;
    }

    async fetchMoonPayRates() {
        const response = await axios.get(`${this.moonpayBaseUrl}/v3/currencies/`, {
            headers: {
                'Authorization': `Bearer ${this.moonpayApiKey}`
            }
        });

        const rates = {};
        const currencies = response.data;

        // Convert MoonPay rates to AKOFA base
        currencies.forEach(currency => {
            if (currency.code === 'AKOFA') {
                rates.AKOFA = 1;
            } else if (currency.code === 'USDC' || currency.code === 'USDT') {
                rates[currency.code] = currency.price || 0.0075; // Fallback rate
            } else if (currency.code === 'BTC') {
                rates.BTC = currency.price || 0.00000012;
            }
        });

        return rates;
    }

    async fetchCoinGeckoRates() {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'usd-coin,tether,bitcoin',
                vs_currencies: 'usd'
            }
        });

        const data = response.data;
        const rates = {};

        // Convert to AKOFA base (assuming 1 AKOFA = 0.0075 USD)
        const akofaToUsd = 0.0075;

        if (data['usd-coin']) {
            rates.USDC = akofaToUsd / data['usd-coin'].usd;
        }
        if (data.tether) {
            rates.USDT = akofaToUsd / data.tether.usd;
        }
        if (data.bitcoin) {
            rates.BTC = akofaToUsd / data.bitcoin.usd;
        }

        return rates;
    }

    getCachedRates() {
        const cached = this.rateCache.get('rates');
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedRates(rates) {
        this.rateCache.set('rates', {
            data: rates,
            timestamp: Date.now()
        });
    }

    /**
     * Convert amount from AKOFA to target currency
     */
    convertAmount(amount, fromCurrency, toCurrency, rates) {
        if (fromCurrency === toCurrency) return amount;

        // All conversions go through AKOFA base
        const amountInAkofa = fromCurrency === 'AKOFA' ? amount : amount / rates[fromCurrency];
        const convertedAmount = toCurrency === 'AKOFA' ? amountInAkofa : amountInAkofa * rates[toCurrency];

        return convertedAmount;
    }

    /**
     * Lock rates for a payment intent
     */
    lockRates(selectedCurrency) {
        const allRates = this.getCachedRates() || {};
        return {
            [selectedCurrency]: allRates[selectedCurrency] || 0,
            AKOFA: 1,
            timestamp: Date.now()
        };
    }

    /**
     * Validate locked rates (check for anomalies)
     */
    validateLockedRates(lockedRates) {
        const currentRates = this.getCachedRates() || {};
        const tolerance = 0.1; // 10% tolerance

        for (const [currency, rate] of Object.entries(lockedRates)) {
            if (currency === 'timestamp') continue;

            const currentRate = currentRates[currency];
            if (currentRate && Math.abs(rate - currentRate) / currentRate > tolerance) {
                console.warn(`Rate anomaly detected for ${currency}: locked=${rate}, current=${currentRate}`);
                // Could trigger alert here
            }
        }

        return true; // Allow payment to proceed
    }

    /**
     * Create MoonPay payment URL
     */
    async createMoonPayPayment(data) {
        const { amount, currency, walletAddress, userEmail, paymentIntentId } = data;

        const payload = {
            apiKey: this.moonpayApiKey,
            currencyCode: currency.toLowerCase(),
            baseCurrencyCode: 'usd', // MoonPay expects USD base
            baseCurrencyAmount: amount,
            walletAddress: walletAddress,
            redirectURL: `${process.env.FRONTEND_URL}/order-success/${paymentIntentId}`,
            webhookURL: `${process.env.BACKEND_URL}/payments/webhook/moonpay`,
            externalId: paymentIntentId
        };

        // Generate signature for security
        const signature = this.generateSignature(payload);

        try {
            const response = await ErrorRecoveryService.handlePaymentError(
                `moonpay_transaction_${paymentIntentId}`,
                async () => {
                    return await axios.post(`${this.moonpayBaseUrl}/v3/transactions`, payload, {
                        headers: {
                            'Authorization': `Bearer ${this.moonpayApiKey}`,
                            'Content-Type': 'application/json',
                            'MoonPay-Signature': signature
                        }
                    });
                },
                { paymentIntentId, payload }
            );

            return {
                paymentUrl: response.data.redirectUrl,
                transactionId: response.data.id
            };
        } catch (error) {
            console.error('MoonPay payment creation failed:', error.response?.data || error.message);
            throw new Error('Failed to create MoonPay payment');
        }
    }

    /**
     * Generate HMAC signature for MoonPay requests
     */
    generateSignature(payload) {
        const payloadString = JSON.stringify(payload);
        return crypto.createHmac('sha256', this.moonpaySecret)
            .update(payloadString)
            .digest('hex');
    }

    /**
     * Verify MoonPay webhook signature
     */
    verifyWebhookSignature(payload, signature) {
        const expectedSignature = crypto.createHmac('sha256', this.moonpaySecret)
            .update(JSON.stringify(payload))
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    }
}

module.exports = new PaymentService();