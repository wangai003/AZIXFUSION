import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Stack, Alert } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuth } from '../../../hooks/useAuth';

const WalletConnect = () => {
    const [error, setError] = useState('');
    const { user, signInWithFirebase } = useAuth();

    const handleNativeWalletConnect = async () => {
        try {
            await signInWithFirebase();
        } catch (err) {
            setError('Failed to connect native wallet. Please try again.');
        }
    };

    const handleAlbedoConnect = async () => {
        try {
            // Implement Albedo wallet connection
            const albedo = window.albedo;
            if (!albedo) {
                setError('Albedo extension not found. Please install it first.');
                return;
            }
            const { pubkey, signed } = await albedo.publicKey({
                require_existing: true
            });
            // Handle successful connection
        } catch (err) {
            setError('Failed to connect Albedo wallet. Please try again.');
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
                Connect Your Wallet
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Stack spacing={2}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={handleNativeWalletConnect}
                    sx={{ py: 1.5 }}
                >
                    Connect Native Wallet (Recommended)
                </Button>

                <Typography variant="body2" color="text.secondary" align="center">
                    - or -
                </Typography>

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleAlbedoConnect}
                    sx={{ py: 1.5 }}
                >
                    Connect with Albedo
                </Button>

                <Typography variant="body2" color="text.secondary" align="center">
                    We recommend using the native wallet for the best experience and security.
                </Typography>
            </Stack>
        </Paper>
    );
};

export default WalletConnect;