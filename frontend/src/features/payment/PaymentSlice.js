import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    initiateMoonPayPayment,
    initiateAkofaPayment,
    getPaymentStatus,
    getExchangeRates,
    lockCurrencyRates,
    checkStellarBalance,
    getStellarAccount,
    initiateStellarPayment,
    submitStellarTransaction,
    verifyStellarTransaction,
    getStellarTransactionHistory,
    getStellarNetworkStatus
} from './PaymentApi';

// Async thunks for payment operations
export const initiateMoonPayPaymentAsync = createAsyncThunk(
    'payment/initiateMoonPayPayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await initiateMoonPayPayment(paymentData);
            return response;
        } catch (error) {
            console.error('MoonPay payment initiation failed:', error);
            return rejectWithValue(error.response?.data || 'Payment initiation failed');
        }
    }
);

export const initiateAkofaPaymentAsync = createAsyncThunk(
    'payment/initiateAkofaPayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await initiateAkofaPayment(paymentData);
            return response;
        } catch (error) {
            console.error('AKOFA payment initiation failed:', error);
            return rejectWithValue(error.response?.data || 'Payment initiation failed');
        }
    }
);

export const getPaymentStatusAsync = createAsyncThunk(
    'payment/getPaymentStatus',
    async (paymentIntentId, { rejectWithValue }) => {
        try {
            const response = await getPaymentStatus(paymentIntentId);
            return response;
        } catch (error) {
            console.error('Payment status check failed:', error);
            return rejectWithValue(error.response?.data || 'Status check failed');
        }
    }
);

export const getExchangeRatesAsync = createAsyncThunk(
    'payment/getExchangeRates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getExchangeRates();
            return response;
        } catch (error) {
            console.error('Exchange rates fetch failed:', error);
            return rejectWithValue(error.response?.data || 'Rates fetch failed');
        }
    }
);

export const lockCurrencyRatesAsync = createAsyncThunk(
    'payment/lockCurrencyRates',
    async (selectedCurrency, { rejectWithValue }) => {
        try {
            const response = await lockCurrencyRates(selectedCurrency);
            return response;
        } catch (error) {
            console.error('Currency rates lock failed:', error);
            return rejectWithValue(error.response?.data || 'Rates lock failed');
        }
    }
);

// Stellar-specific async thunks
export const checkStellarBalanceAsync = createAsyncThunk(
    'payment/checkStellarBalance',
    async ({ publicKey, assetCode, issuer }, { rejectWithValue }) => {
        try {
            const response = await checkStellarBalance(publicKey, assetCode, issuer);
            return response;
        } catch (error) {
            console.error('Stellar balance check failed:', error);
            return rejectWithValue(error.response?.data || 'Balance check failed');
        }
    }
);

export const getStellarAccountAsync = createAsyncThunk(
    'payment/getStellarAccount',
    async (publicKey, { rejectWithValue }) => {
        try {
            const response = await getStellarAccount(publicKey);
            return response;
        } catch (error) {
            console.error('Stellar account fetch failed:', error);
            return rejectWithValue(error.response?.data || 'Account fetch failed');
        }
    }
);

export const initiateStellarPaymentAsync = createAsyncThunk(
    'payment/initiateStellarPayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await initiateStellarPayment(paymentData);
            return response;
        } catch (error) {
            console.error('Stellar payment initiation failed:', error);
            return rejectWithValue(error.response?.data || 'Payment initiation failed');
        }
    }
);

export const submitStellarTransactionAsync = createAsyncThunk(
    'payment/submitStellarTransaction',
    async ({ paymentIntentId, signedTransactionXdr }, { rejectWithValue }) => {
        try {
            const response = await submitStellarTransaction(paymentIntentId, signedTransactionXdr);
            return response;
        } catch (error) {
            console.error('Stellar transaction submission failed:', error);
            return rejectWithValue(error.response?.data || 'Transaction submission failed');
        }
    }
);

export const verifyStellarTransactionAsync = createAsyncThunk(
    'payment/verifyStellarTransaction',
    async (transactionHash, { rejectWithValue }) => {
        try {
            const response = await verifyStellarTransaction(transactionHash);
            return response;
        } catch (error) {
            console.error('Stellar transaction verification failed:', error);
            return rejectWithValue(error.response?.data || 'Transaction verification failed');
        }
    }
);

export const getStellarTransactionHistoryAsync = createAsyncThunk(
    'payment/getStellarTransactionHistory',
    async ({ publicKey, limit, cursor }, { rejectWithValue }) => {
        try {
            const response = await getStellarTransactionHistory(publicKey, limit, cursor);
            return response;
        } catch (error) {
            console.error('Stellar transaction history fetch failed:', error);
            return rejectWithValue(error.response?.data || 'History fetch failed');
        }
    }
);

export const getStellarNetworkStatusAsync = createAsyncThunk(
    'payment/getStellarNetworkStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getStellarNetworkStatus();
            return response;
        } catch (error) {
            console.error('Stellar network status fetch failed:', error);
            return rejectWithValue(error.response?.data || 'Network status fetch failed');
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        // Payment initiation
        paymentStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        currentPayment: null,
        paymentIntentId: null,

        // Payment status checking
        statusCheckStatus: 'idle',
        currentPaymentStatus: null,

        // Exchange rates
        ratesStatus: 'idle',
        rates: null,

        // Rate locking
        lockStatus: 'idle',
        lockedRates: null,

        // Stellar-specific state
        stellarBalance: null,
        stellarBalanceStatus: 'idle',
        stellarAccount: null,
        stellarAccountStatus: 'idle',
        stellarPayment: null,
        stellarPaymentStatus: 'idle',
        stellarTransaction: null,
        stellarTransactionStatus: 'idle',
        stellarVerification: null,
        stellarVerificationStatus: 'idle',
        stellarHistory: null,
        stellarHistoryStatus: 'idle',
        stellarNetworkStatus: null,
        stellarNetworkStatusCheck: 'idle',

        // Errors
        error: null,
    },
    reducers: {
        resetPaymentState: (state) => {
            state.paymentStatus = 'idle';
            state.currentPayment = null;
            state.paymentIntentId = null;
            state.error = null;
        },
        clearPaymentError: (state) => {
            state.error = null;
        },
        setPaymentIntentId: (state, action) => {
            state.paymentIntentId = action.payload;
        },
        // Stellar-specific reducers
        resetStellarState: (state) => {
            state.stellarBalance = null;
            state.stellarBalanceStatus = 'idle';
            state.stellarAccount = null;
            state.stellarAccountStatus = 'idle';
            state.stellarPayment = null;
            state.stellarPaymentStatus = 'idle';
            state.stellarTransaction = null;
            state.stellarTransactionStatus = 'idle';
            state.stellarVerification = null;
            state.stellarVerificationStatus = 'idle';
            state.stellarHistory = null;
            state.stellarHistoryStatus = 'idle';
            state.stellarNetworkStatus = null;
            state.stellarNetworkStatusCheck = 'idle';
            state.error = null;
        },
        clearStellarError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // MoonPay payment initiation
            .addCase(initiateMoonPayPaymentAsync.pending, (state) => {
                state.paymentStatus = 'loading';
                state.error = null;
            })
            .addCase(initiateMoonPayPaymentAsync.fulfilled, (state, action) => {
                state.paymentStatus = 'succeeded';
                state.currentPayment = action.payload;
                state.paymentIntentId = action.payload.paymentIntentId;
                state.error = null;
            })
            .addCase(initiateMoonPayPaymentAsync.rejected, (state, action) => {
                state.paymentStatus = 'failed';
                state.error = action.payload;
            })

            // AKOFA payment initiation
            .addCase(initiateAkofaPaymentAsync.pending, (state) => {
                state.paymentStatus = 'loading';
                state.error = null;
            })
            .addCase(initiateAkofaPaymentAsync.fulfilled, (state, action) => {
                state.paymentStatus = 'succeeded';
                state.currentPayment = action.payload;
                state.error = null;
            })
            .addCase(initiateAkofaPaymentAsync.rejected, (state, action) => {
                state.paymentStatus = 'failed';
                state.error = action.payload;
            })

            // Payment status check
            .addCase(getPaymentStatusAsync.pending, (state) => {
                state.statusCheckStatus = 'loading';
            })
            .addCase(getPaymentStatusAsync.fulfilled, (state, action) => {
                state.statusCheckStatus = 'succeeded';
                state.currentPaymentStatus = action.payload;
            })
            .addCase(getPaymentStatusAsync.rejected, (state, action) => {
                state.statusCheckStatus = 'failed';
                state.error = action.payload;
            })

            // Exchange rates
            .addCase(getExchangeRatesAsync.pending, (state) => {
                state.ratesStatus = 'loading';
            })
            .addCase(getExchangeRatesAsync.fulfilled, (state, action) => {
                state.ratesStatus = 'succeeded';
                state.rates = action.payload;
            })
            .addCase(getExchangeRatesAsync.rejected, (state, action) => {
                state.ratesStatus = 'failed';
                state.error = action.payload;
            })

            // Rate locking
            .addCase(lockCurrencyRatesAsync.pending, (state) => {
                state.lockStatus = 'loading';
            })
            .addCase(lockCurrencyRatesAsync.fulfilled, (state, action) => {
                state.lockStatus = 'succeeded';
                state.lockedRates = action.payload;
            })
            .addCase(lockCurrencyRatesAsync.rejected, (state, action) => {
                state.lockStatus = 'failed';
                state.error = action.payload;
            })

            // Stellar balance check
            .addCase(checkStellarBalanceAsync.pending, (state) => {
                state.stellarBalanceStatus = 'loading';
            })
            .addCase(checkStellarBalanceAsync.fulfilled, (state, action) => {
                state.stellarBalanceStatus = 'succeeded';
                state.stellarBalance = action.payload;
            })
            .addCase(checkStellarBalanceAsync.rejected, (state, action) => {
                state.stellarBalanceStatus = 'failed';
                state.error = action.payload;
            })

            // Stellar account
            .addCase(getStellarAccountAsync.pending, (state) => {
                state.stellarAccountStatus = 'loading';
            })
            .addCase(getStellarAccountAsync.fulfilled, (state, action) => {
                state.stellarAccountStatus = 'succeeded';
                state.stellarAccount = action.payload;
            })
            .addCase(getStellarAccountAsync.rejected, (state, action) => {
                state.stellarAccountStatus = 'failed';
                state.error = action.payload;
            })

            // Stellar payment initiation
            .addCase(initiateStellarPaymentAsync.pending, (state) => {
                state.stellarPaymentStatus = 'loading';
                state.error = null;
            })
            .addCase(initiateStellarPaymentAsync.fulfilled, (state, action) => {
                state.stellarPaymentStatus = 'succeeded';
                state.stellarPayment = action.payload;
                state.paymentIntentId = action.payload.paymentIntentId;
                state.error = null;
            })
            .addCase(initiateStellarPaymentAsync.rejected, (state, action) => {
                state.stellarPaymentStatus = 'failed';
                state.error = action.payload;
            })

            // Stellar transaction submission
            .addCase(submitStellarTransactionAsync.pending, (state) => {
                state.stellarTransactionStatus = 'loading';
            })
            .addCase(submitStellarTransactionAsync.fulfilled, (state, action) => {
                state.stellarTransactionStatus = 'succeeded';
                state.stellarTransaction = action.payload;
            })
            .addCase(submitStellarTransactionAsync.rejected, (state, action) => {
                state.stellarTransactionStatus = 'failed';
                state.error = action.payload;
            })

            // Stellar transaction verification
            .addCase(verifyStellarTransactionAsync.pending, (state) => {
                state.stellarVerificationStatus = 'loading';
            })
            .addCase(verifyStellarTransactionAsync.fulfilled, (state, action) => {
                state.stellarVerificationStatus = 'succeeded';
                state.stellarVerification = action.payload;
            })
            .addCase(verifyStellarTransactionAsync.rejected, (state, action) => {
                state.stellarVerificationStatus = 'failed';
                state.error = action.payload;
            })

            // Stellar transaction history
            .addCase(getStellarTransactionHistoryAsync.pending, (state) => {
                state.stellarHistoryStatus = 'loading';
            })
            .addCase(getStellarTransactionHistoryAsync.fulfilled, (state, action) => {
                state.stellarHistoryStatus = 'succeeded';
                state.stellarHistory = action.payload;
            })
            .addCase(getStellarTransactionHistoryAsync.rejected, (state, action) => {
                state.stellarHistoryStatus = 'failed';
                state.error = action.payload;
            })

            // Stellar network status
            .addCase(getStellarNetworkStatusAsync.pending, (state) => {
                state.stellarNetworkStatusCheck = 'loading';
            })
            .addCase(getStellarNetworkStatusAsync.fulfilled, (state, action) => {
                state.stellarNetworkStatusCheck = 'succeeded';
                state.stellarNetworkStatus = action.payload;
            })
            .addCase(getStellarNetworkStatusAsync.rejected, (state, action) => {
                state.stellarNetworkStatusCheck = 'failed';
                state.error = action.payload;
            });
    }
});

// Export actions
export const { resetPaymentState, clearPaymentError, setPaymentIntentId, resetStellarState, clearStellarError } = paymentSlice.actions;

// Export selectors
export const selectPaymentStatus = (state) => state.payment.paymentStatus;
export const selectCurrentPayment = (state) => state.payment.currentPayment;
export const selectPaymentIntentId = (state) => state.payment.paymentIntentId;
export const selectPaymentError = (state) => state.payment.error;
export const selectPaymentStatusCheck = (state) => state.payment.statusCheckStatus;
export const selectCurrentPaymentStatus = (state) => state.payment.currentPaymentStatus;
export const selectRatesStatus = (state) => state.payment.ratesStatus;
export const selectPaymentRates = (state) => state.payment.rates;
export const selectLockStatus = (state) => state.payment.lockStatus;
export const selectLockedRates = (state) => state.payment.lockedRates;

// Stellar selectors
export const selectStellarBalance = (state) => state.payment.stellarBalance;
export const selectStellarBalanceStatus = (state) => state.payment.stellarBalanceStatus;
export const selectStellarAccount = (state) => state.payment.stellarAccount;
export const selectStellarAccountStatus = (state) => state.payment.stellarAccountStatus;
export const selectStellarPayment = (state) => state.payment.stellarPayment;
export const selectStellarPaymentStatus = (state) => state.payment.stellarPaymentStatus;
export const selectStellarTransaction = (state) => state.payment.stellarTransaction;
export const selectStellarTransactionStatus = (state) => state.payment.stellarTransactionStatus;
export const selectStellarVerification = (state) => state.payment.stellarVerification;
export const selectStellarVerificationStatus = (state) => state.payment.stellarVerificationStatus;
export const selectStellarHistory = (state) => state.payment.stellarHistory;
export const selectStellarHistoryStatus = (state) => state.payment.stellarHistoryStatus;
export const selectStellarNetworkStatus = (state) => state.payment.stellarNetworkStatus;
export const selectStellarNetworkStatusCheck = (state) => state.payment.stellarNetworkStatusCheck;

export default paymentSlice.reducer;