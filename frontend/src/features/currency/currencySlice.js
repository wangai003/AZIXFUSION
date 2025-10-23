import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching rates
export const fetchCurrencyRates = createAsyncThunk(
    'currency/fetchCurrencyRates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/payments/rates');
            return response.data.rates;
        } catch (error) {
            console.error('Failed to fetch currency rates:', error);
            return rejectWithValue(error.response?.data || 'Failed to fetch rates');
        }
    }
);

// Async thunk for locking rates
export const lockCurrencyRates = createAsyncThunk(
    'currency/lockCurrencyRates',
    async (selectedCurrency, { rejectWithValue }) => {
        try {
            const response = await axios.post('/payments/rates/lock', { selectedCurrency });
            return response.data;
        } catch (error) {
            console.error('Failed to lock currency rates:', error);
            return rejectWithValue(error.response?.data || 'Failed to lock rates');
        }
    }
);

const currencySlice = createSlice({
    name: 'currency',
    initialState: {
        selectedCurrency: 'AKOFA',
        rates: {
            AKOFA: 1,    // Base currency
            USD: 0.0075, // 1 AKOFA = 0.0075 USD
            KES: 1.00,   // 1 AKOFA = 1 KES
            BTC: 0.00000012, // 1 AKOFA = 0.00000012 BTC
            ETH: 0.000002,   // 1 AKOFA = 0.000002 ETH
            USDT: 0.0075,    // 1 AKOFA = 0.0075 USDT (same as USD)
            USDC: 0.0075,    // 1 AKOFA = 0.0075 USDC (same as USD)
        },
        lockedRates: null,
        ratesStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        lockStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        setSelectedCurrency: (state, action) => {
            state.selectedCurrency = action.payload;
            // Clear locked rates when currency changes
            state.lockedRates = null;
        },
        clearLockedRates: (state) => {
            state.lockedRates = null;
        },
        resetCurrencyError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch rates
            .addCase(fetchCurrencyRates.pending, (state) => {
                state.ratesStatus = 'loading';
            })
            .addCase(fetchCurrencyRates.fulfilled, (state, action) => {
                state.ratesStatus = 'succeeded';
                state.rates = { ...state.rates, ...action.payload };
                state.error = null;
            })
            .addCase(fetchCurrencyRates.rejected, (state, action) => {
                state.ratesStatus = 'failed';
                state.error = action.payload;
            })
            // Lock rates
            .addCase(lockCurrencyRates.pending, (state) => {
                state.lockStatus = 'loading';
            })
            .addCase(lockCurrencyRates.fulfilled, (state, action) => {
                state.lockStatus = 'succeeded';
                state.lockedRates = action.payload.lockedRates;
                state.error = null;
            })
            .addCase(lockCurrencyRates.rejected, (state, action) => {
                state.lockStatus = 'failed';
                state.error = action.payload;
            });
    }
});

export const { setSelectedCurrency, clearLockedRates, resetCurrencyError } = currencySlice.actions;

export const selectCurrency = (state) => state.currency.selectedCurrency;
export const selectRates = (state) => state.currency.rates;
export const selectLockedRates = (state) => state.currency.lockedRates;
export const selectRatesStatus = (state) => state.currency.ratesStatus;
export const selectLockStatus = (state) => state.currency.lockStatus;
export const selectCurrencyError = (state) => state.currency.error;

export default currencySlice.reducer;
