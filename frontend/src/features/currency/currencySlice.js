import { createSlice } from '@reduxjs/toolkit';

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
        },
    },
    reducers: {
        setSelectedCurrency: (state, action) => {
            state.selectedCurrency = action.payload;
        }
    }
});

export const { setSelectedCurrency } = currencySlice.actions;

export const selectCurrency = (state) => state.currency.selectedCurrency;
export const selectRates = (state) => state.currency.rates;

export default currencySlice.reducer;
