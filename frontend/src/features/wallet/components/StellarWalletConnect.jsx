import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Stack,
    Alert,
    TextField,
    InputAdornment,
    IconButton,
    Card,
    CardContent,
    Chip,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    AccountBalanceWallet as WalletIcon,
    Visibility,
    VisibilityOff,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
    checkStellarBalanceAsync,
    getStellarAccountAsync,
    selectStellarBalance,
    selectStellarBalanceStatus,
    selectStellarAccount,
    selectStellarAccountStatus,
    selectPaymentError,
    resetStellarState
} from '../../payment/PaymentSlice';

const StellarWalletConnect = ({ onWalletConnected, onBalanceChecked }) => {
    const dispatch = useDispatch();

    // Form state
    const [publicKey, setPublicKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [assetCode, setAssetCode] = useState('AKOFA');
    const [issuer, setIssuer] = useState('');

    // UI state
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState('');

    // Redux state
    const balance = useSelector(selectStellarBalance);
    const balanceStatus = useSelector(selectStellarBalanceStatus);
    const account = useSelector(selectStellarAccount);
    const accountStatus = useSelector(selectStellarAccountStatus);
    const error = useSelector(selectPaymentError);

    // Validation
    const isValidPublicKey = (key) => {
        return key.length === 56 && /^[A-Z0-9]+$/i.test(key);
    };

    const isValidSecretKey = (key) => {
        return key.length === 56 && /^[A-Z0-9]+$/i.test(key);
    };

    // Handle wallet connection
    const handleConnectWallet = async () => {
        if (!publicKey.trim()) {
            setConnectionError('Please enter a public key');
            return;
        }

        if (!isValidPublicKey(publicKey)) {
            setConnectionError('Invalid Stellar public key format');
            return;
        }

        setConnectionError('');

        try {
            // Check account details
            const accountResult = await dispatch(getStellarAccountAsync(publicKey)).unwrap();

            if (accountResult.success) {
                setIsConnected(true);
                onWalletConnected?.({
                    publicKey,
                    secretKey: secretKey || null,
                    account: accountResult.account
                });
            }
        } catch (err) {
            setConnectionError(err.message || 'Failed to connect wallet');
        }
    };

    // Handle balance check
    const handleCheckBalance = async () => {
        if (!publicKey.trim()) {
            setConnectionError('Please connect wallet first');
            return;
        }

        try {
            const balanceResult = await dispatch(checkStellarBalanceAsync({
                publicKey,
                assetCode: assetCode || 'XLM',
                issuer: issuer || undefined
            })).unwrap();

            if (balanceResult.success) {
                onBalanceChecked?.(balanceResult.balance);
            }
        } catch (err) {
            setConnectionError(err.message || 'Failed to check balance');
        }
    };

    // Handle disconnect
    const handleDisconnect = () => {
        setIsConnected(false);
        setPublicKey('');
        setSecretKey('');
        setConnectionError('');
        dispatch(resetStellarState());
        onWalletConnected?.(null);
    };

    // Auto-check balance when connected
    useEffect(() => {
        if (isConnected && publicKey) {
            handleCheckBalance();
        }
    }, [isConnected, publicKey]);

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
                Stellar Wallet Connection
            </Typography>

            {(connectionError || error) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {connectionError || error}
                </Alert>
            )}

            {!isConnected ? (
                <Stack spacing={3}>
                    <TextField
                        fullWidth
                        label="Stellar Public Key"
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                        placeholder="G..."
                        helperText="Enter your Stellar public key (56 characters)"
                        error={publicKey && !isValidPublicKey(publicKey)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <WalletIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Stellar Secret Key (Optional)"
                        type={showSecret ? 'text' : 'password'}
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="S..."
                        helperText="Required for signing transactions"
                        error={secretKey && !isValidSecretKey(secretKey)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowSecret(!showSecret)}
                                        edge="end"
                                    >
                                        {showSecret ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleConnectWallet}
                        disabled={!publicKey || (publicKey && !isValidPublicKey(publicKey))}
                        sx={{ py: 1.5 }}
                    >
                        Connect Stellar Wallet
                    </Button>
                </Stack>
            ) : (
                <Stack spacing={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Wallet Connected
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Public Key:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {publicKey}
                            </Typography>
                            {secretKey && (
                                <>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                                        Secret Key:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {showSecret ? secretKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                                    </Typography>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Divider />

                    <Typography variant="h6" gutterBottom>
                        Balance Check
                    </Typography>

                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Asset Code"
                            value={assetCode}
                            onChange={(e) => setAssetCode(e.target.value)}
                            placeholder="AKOFA"
                            size="small"
                        />
                        <TextField
                            label="Issuer (Optional)"
                            value={issuer}
                            onChange={(e) => setIssuer(e.target.value)}
                            placeholder="Issuer public key"
                            size="small"
                            fullWidth
                        />
                        <Button
                            variant="outlined"
                            onClick={handleCheckBalance}
                            disabled={balanceStatus === 'loading'}
                            startIcon={balanceStatus === 'loading' ? <CircularProgress size={16} /> : <RefreshIcon />}
                        >
                            Check Balance
                        </Button>
                    </Stack>

                    {balance && balance.success && (
                        <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <CheckIcon color="success" />
                                    <Typography variant="h6">
                                        Balance: {balance.balance.balance} {balance.balance.asset}
                                    </Typography>
                                </Stack>
                                {balance.balance.buyingLiabilities > 0 && (
                                    <Chip
                                        label={`Buying Liabilities: ${balance.balance.buyingLiabilities}`}
                                        size="small"
                                        color="warning"
                                        sx={{ mr: 1 }}
                                    />
                                )}
                                {balance.balance.sellingLiabilities > 0 && (
                                    <Chip
                                        label={`Selling Liabilities: ${balance.balance.sellingLiabilities}`}
                                        size="small"
                                        color="warning"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {balanceStatus === 'failed' && (
                        <Alert severity="error">
                            Failed to check balance. Please try again.
                        </Alert>
                    )}

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={handleDisconnect}
                            fullWidth
                        >
                            Disconnect Wallet
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => onWalletConnected?.({
                                publicKey,
                                secretKey,
                                account: account?.account,
                                balance: balance?.balance
                            })}
                            fullWidth
                        >
                            Continue with Payment
                        </Button>
                    </Stack>
                </Stack>
            )}
        </Paper>
    );
};

export default StellarWalletConnect;