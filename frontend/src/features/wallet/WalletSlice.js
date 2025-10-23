import { createSlice } from '@reduxjs/toolkit';

const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        // Stellar wallet state
        stellarWallet: {
            isConnected: false,
            publicKey: null,
            secretKey: null,
            balance: null,
            account: null,
            network: 'testnet', // 'testnet' or 'mainnet'
        },
        // Transaction history
        transactions: [],
        // Loading states
        loading: false,
        error: null,
    },
    reducers: {
        // Stellar wallet actions
        connectStellarWallet: (state, action) => {
            state.stellarWallet.isConnected = true;
            state.stellarWallet.publicKey = action.payload.publicKey;
            state.stellarWallet.secretKey = action.payload.secretKey;
            state.stellarWallet.account = action.payload.account;
            state.error = null;
        },
        disconnectStellarWallet: (state) => {
            state.stellarWallet = {
                isConnected: false,
                publicKey: null,
                secretKey: null,
                balance: null,
                account: null,
                network: 'testnet',
            };
            state.error = null;
        },
        updateStellarBalance: (state, action) => {
            state.stellarWallet.balance = action.payload;
        },
        updateStellarAccount: (state, action) => {
            state.stellarWallet.account = action.payload;
        },
        setStellarNetwork: (state, action) => {
            state.stellarWallet.network = action.payload;
        },
        // Transaction actions
        addTransaction: (state, action) => {
            state.transactions.unshift(action.payload);
        },
        updateTransaction: (state, action) => {
            const index = state.transactions.findIndex(tx => tx.id === action.payload.id);
            if (index !== -1) {
                state.transactions[index] = { ...state.transactions[index], ...action.payload };
            }
        },
        clearTransactions: (state) => {
            state.transactions = [];
        },
        // General actions
        setWalletLoading: (state, action) => {
            state.loading = action.payload;
        },
        setWalletError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearWalletError: (state) => {
            state.error = null;
        },
        resetWalletState: (state) => {
            state.stellarWallet = {
                isConnected: false,
                publicKey: null,
                secretKey: null,
                balance: null,
                account: null,
                network: 'testnet',
            };
            state.transactions = [];
            state.loading = false;
            state.error = null;
        },
    },
});

// Export actions
export const {
    connectStellarWallet,
    disconnectStellarWallet,
    updateStellarBalance,
    updateStellarAccount,
    setStellarNetwork,
    addTransaction,
    updateTransaction,
    clearTransactions,
    setWalletLoading,
    setWalletError,
    clearWalletError,
    resetWalletState,
} = walletSlice.actions;

// Export selectors
export const selectStellarWallet = (state) => state.wallet.stellarWallet;
export const selectIsStellarConnected = (state) => state.wallet.stellarWallet.isConnected;
export const selectStellarPublicKey = (state) => state.wallet.stellarWallet.publicKey;
export const selectStellarBalance = (state) => state.wallet.stellarWallet.balance;
export const selectStellarAccount = (state) => state.wallet.stellarWallet.account;
export const selectStellarNetwork = (state) => state.wallet.stellarWallet.network;
export const selectWalletTransactions = (state) => state.wallet.transactions;
export const selectWalletLoading = (state) => state.wallet.loading;
export const selectWalletError = (state) => state.wallet.error;

export default walletSlice.reducer;