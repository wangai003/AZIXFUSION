import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Stack,
    Alert,
    Card,
    CardContent,
    Stepper,
    Step,
    StepLabel,
    Divider,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    AccountBalanceWallet as WalletIcon,
    Payment as PaymentIcon,
    CheckCircle as CheckIcon,
    ArrowForward as ArrowIcon
} from '@mui/icons-material';
import StellarWalletConnect from './StellarWalletConnect';
import StellarTransactionSigner from './StellarTransactionSigner';
import { useDispatch, useSelector } from 'react-redux';
import {
    getPaymentStatusAsync,
    selectCurrentPaymentStatus,
    selectPaymentIntentId
} from '../../payment/PaymentSlice';

const StellarPaymentFlow = ({
    orderData,
    amount,
    recipientPublicKey,
    assetCode = 'AKOFA',
    issuer,
    onPaymentComplete,
    onCancel
}) => {
    const dispatch = useDispatch();

    // Flow state
    const [activeStep, setActiveStep] = useState(0);
    const [walletData, setWalletData] = useState(null);
    const [balanceData, setBalanceData] = useState(null);
    const [transactionResult, setTransactionResult] = useState(null);

    // Polling state
    const [isPolling, setIsPolling] = useState(false);
    const [pollInterval, setPollInterval] = useState(null);

    // Redux state
    const paymentStatus = useSelector(selectCurrentPaymentStatus);
    const paymentIntentId = useSelector(selectPaymentIntentId);

    const steps = [
        'Connect Wallet',
        'Review Payment',
        'Sign Transaction',
        'Confirm Payment'
    ];

    // Handle wallet connection
    const handleWalletConnected = (data) => {
        setWalletData(data);
        setActiveStep(1);
    };

    // Handle balance checked
    const handleBalanceChecked = (balance) => {
        setBalanceData(balance);
    };

    // Handle transaction completion
    const handleTransactionComplete = (result) => {
        setTransactionResult(result);
        setActiveStep(3);

        // Start polling for payment status
        startPaymentPolling(result.orderId);
    };

    // Start polling for payment status
    const startPaymentPolling = (orderId) => {
        if (!orderId) return;

        setIsPolling(true);

        const interval = setInterval(async () => {
            try {
                const result = await dispatch(getPaymentStatusAsync(orderId)).unwrap();

                if (result.status === 'paid') {
                    // Payment confirmed
                    setIsPolling(false);
                    clearInterval(interval);
                    onPaymentComplete?.({
                        success: true,
                        orderId,
                        transactionResult,
                        paymentStatus: result
                    });
                } else if (result.status === 'failed') {
                    // Payment failed
                    setIsPolling(false);
                    clearInterval(interval);
                    console.error('Payment failed');
                }
                // Continue polling for 'pending' status
            } catch (error) {
                console.error('Error polling payment status:', error);
            }
        }, 5000); // Poll every 5 seconds

        setPollInterval(interval);
    };

    // Stop polling
    const stopPolling = () => {
        if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
        }
        setIsPolling(false);
    };

    // Handle step navigation
    const handleNext = () => {
        if (activeStep === 1 && walletData && balanceData) {
            // Check if balance is sufficient
            if (balanceData.balance < amount) {
                alert(`Insufficient balance. You have ${balanceData.balance} ${balanceData.asset} but need ${amount} ${assetCode}`);
                return;
            }
            setActiveStep(2);
        }
    };

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, []);

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
                Stellar Payment Flow
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Stack spacing={3}>
                {/* Step 1: Wallet Connection */}
                {activeStep === 0 && (
                    <StellarWalletConnect
                        onWalletConnected={handleWalletConnected}
                        onBalanceChecked={handleBalanceChecked}
                    />
                )}

                {/* Step 2: Payment Review */}
                {activeStep === 1 && walletData && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Review Payment Details
                            </Typography>

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        From Wallet:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {walletData.publicKey}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        To:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {recipientPublicKey}
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Amount:
                                    </Typography>
                                    <Typography variant="h5" color="primary">
                                        {amount} {assetCode}
                                    </Typography>
                                </Box>

                                {balanceData && (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Your Balance:
                                        </Typography>
                                        <Typography variant="body1">
                                            {balanceData.balance} {balanceData.asset}
                                        </Typography>
                                        {balanceData.balance >= amount ? (
                                            <Chip label="Sufficient Balance" color="success" size="small" />
                                        ) : (
                                            <Chip label="Insufficient Balance" color="error" size="small" />
                                        )}
                                    </Box>
                                )}

                                {orderData && (
                                    <>
                                        <Divider />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Order Details:
                                            </Typography>
                                            <Typography variant="body2">
                                                Order ID: {orderData.id || 'N/A'}
                                            </Typography>
                                            {orderData.total && (
                                                <Typography variant="body2">
                                                    Total: ${orderData.total}
                                                </Typography>
                                            )}
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Transaction Signing */}
                {activeStep === 2 && walletData && (
                    <StellarTransactionSigner
                        walletData={walletData}
                        orderData={orderData}
                        amount={amount}
                        recipientPublicKey={recipientPublicKey}
                        assetCode={assetCode}
                        issuer={issuer}
                        onTransactionComplete={handleTransactionComplete}
                        onCancel={handleBack}
                    />
                )}

                {/* Step 4: Payment Confirmation */}
                {activeStep === 3 && transactionResult && (
                    <Card sx={{ bgcolor: 'success.light' }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                <CheckIcon color="success" fontSize="large" />
                                <Typography variant="h6">
                                    Transaction Submitted Successfully!
                                </Typography>
                            </Stack>

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Transaction Hash:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {transactionResult.transactionHash}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Order ID:
                                    </Typography>
                                    <Typography variant="body2">
                                        {transactionResult.orderId}
                                    </Typography>
                                </Box>

                                {isPolling && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={16} />
                                        <Typography variant="body2">
                                            Confirming payment on network...
                                        </Typography>
                                    </Box>
                                )}

                                {!isPolling && paymentStatus?.status === 'paid' && (
                                    <Alert severity="success">
                                        Payment confirmed! Your transaction has been processed successfully.
                                    </Alert>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Buttons */}
                {activeStep < 3 && (
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={onCancel}
                            fullWidth
                        >
                            Cancel Payment
                        </Button>

                        {activeStep === 1 && (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!walletData || !balanceData || balanceData.balance < amount}
                                endIcon={<ArrowIcon />}
                                fullWidth
                            >
                                Proceed to Sign
                            </Button>
                        )}
                    </Stack>
                )}

                {activeStep === 3 && !isPolling && (
                    <Button
                        variant="contained"
                        onClick={() => onPaymentComplete?.({
                            success: true,
                            transactionResult,
                            paymentStatus
                        })}
                        fullWidth
                        sx={{ py: 1.5 }}
                    >
                        Complete Payment
                    </Button>
                )}
            </Stack>
        </Paper>
    );
};

export default StellarPaymentFlow;