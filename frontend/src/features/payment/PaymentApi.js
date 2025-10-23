import { axiosi as axios } from '../../config/axios';

// Payment API functions
export const initiateMoonPayPayment = async (paymentData) => {
    const response = await axios.post('/payments/moonpay/initiate', paymentData);
    return response.data;
};

export const initiateAkofaPayment = async (paymentData) => {
    const response = await axios.post('/payments/akofa/initiate', paymentData);
    return response.data;
};

export const getPaymentStatus = async (paymentIntentId) => {
    const response = await axios.get(`/payments/status/${paymentIntentId}`);
    return response.data;
};

export const getExchangeRates = async () => {
    const response = await axios.get('/payments/rates');
    return response.data;
};

export const lockCurrencyRates = async (selectedCurrency) => {
    const response = await axios.post('/payments/rates/lock', { selectedCurrency });
    return response.data;
};

// Stellar-specific API functions
export const checkStellarBalance = async (publicKey, assetCode, issuer) => {
    const response = await axios.get(`/payments/stellar/balance/${publicKey}/${assetCode || 'XLM'}/${issuer || ''}`);
    return response.data;
};

export const getStellarAccount = async (publicKey) => {
    const response = await axios.get(`/payments/stellar/account/${publicKey}`);
    return response.data;
};

export const initiateStellarPayment = async (paymentData) => {
    const response = await axios.post('/payments/stellar/initiate', paymentData);
    return response.data;
};

export const submitStellarTransaction = async (paymentIntentId, signedTransactionXdr) => {
    const response = await axios.post('/payments/stellar/submit', {
        paymentIntentId,
        signedTransactionXdr
    });
    return response.data;
};

export const verifyStellarTransaction = async (transactionHash) => {
    const response = await axios.get(`/payments/stellar/verify/${transactionHash}`);
    return response.data;
};

export const getStellarTransactionHistory = async (publicKey, limit, cursor) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (cursor) params.append('cursor', cursor);
    const response = await axios.get(`/payments/stellar/history/${publicKey}?${params}`);
    return response.data;
};

export const getStellarNetworkStatus = async () => {
    const response = await axios.get('/payments/stellar/network');
    return response.data;
};