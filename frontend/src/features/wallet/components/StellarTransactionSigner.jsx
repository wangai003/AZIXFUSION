import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Stack,
    Alert,
    TextField,
    Card,
    CardContent,
    Divider,
    CircularProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import {
    Send as SendIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
    initiateStellarPaymentAsync,
    submitStellarTransactionAsync,
    selectStellarPayment,
    selectStellarPaymentStatus,
    selectStellarTransaction,
    selectStellarTransactionStatus,
    selectPaymentError
} from '../../payment/PaymentSlice';

const StellarTransactionSigner = ({
    walletData,
    orderData,
    amount,
    recipientPublicKey,
    assetCode = 'AKOFA',
    issuer,
    onTransactionComplete,
    onCancel
}) => {
    const dispatch = useDispatch();

    // Component state
    const [activeStep, setActiveStep] = useState(0);
    const [signedTransactionXdr, setSignedTransactionXdr] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState(null);

    // Redux state
    const stellarPayment = useSelector(selectStellarPayment);
    const paymentStatus = useSelector(selectStellarPaymentStatus);
    const stellarTransaction = useSelector(selectStellarTransaction);
    const transactionStatus = useSelector(selectStellarTransactionStatus);
    const error = useSelector(selectPaymentError);

    const steps = ['Initiate Payment', 'Sign Transaction', 'Submit Transaction'];

    // Handle payment initiation
    const handleInitiatePayment = async () => {
        if (!walletData?.publicKey || !recipientPublicKey || !amount) {
            return;
        }

        try {
            const paymentData = {
                orderData,
                fromPublicKey: walletData.publicKey,
                toPublicKey: recipientPublicKey,
                amount: parseFloat(amount),
                assetCode,
                issuer,
                memo: `Payment for order ${orderData?.id || 'N/A'}`
            };

            const result = await dispatch(initiateStellarPaymentAsync(paymentData)).unwrap();

            if (result.success) {
                setTransactionDetails(result);
                setActiveStep(1);
            }
        } catch (err) {
            console.error('Payment initiation failed:', err);
        }
    };

    // Handle transaction signing (client-side)
    const handleSignTransaction = async () => {
        if (!walletData?.secretKey) {
            alert('Secret key is required for signing transactions');
            return;
        }

        try {
            // In a real implementation, this would use the Stellar SDK to sign the transaction
            // For now, we'll simulate the signing process
            setSignedTransactionXdr('SIMULATED_XDR_' + Date.now());
            setActiveStep(2);
        } catch (err) {
            console.error('Transaction signing failed:', err);
        }
    };

    // Handle transaction submission
    const handleSubmitTransaction = async () => {
        if (!transactionDetails?.paymentIntentId || !signedTransactionXdr) {
            return;
        }

        try {
            const result = await dispatch(submitStellarTransactionAsync({
                paymentIntentId: transactionDetails.paymentIntentId,
                signedTransactionXdr
            })).unwrap();

            if (result.success) {
                setActiveStep(3);
                onTransactionComplete?.(result);
            }
        } catch (err) {
            console.error('Transaction submission failed:', err);
        }
    };

    // Handle confirmation dialog
    const handleConfirmTransaction = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmSubmit = () => {
        setShowConfirmDialog(false);
        handleSubmitTransaction();
    };

    // Auto-initiate payment on mount
    useEffect(() => {
        if (walletData && recipientPublicKey && amount && activeStep === 0) {
            handleInitiatePayment();
        }
    }, [walletData, recipientPublicKey, amount]);

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
                Stellar Transaction Signing
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Stack spacing={3}>
                {/* Step 1: Payment Initiation */}
                {activeStep === 0 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Initiating Payment
                            </Typography>
                            {paymentStatus === 'loading' && (
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <CircularProgress size={24} />
                                    <Typography>Preparing transaction...</Typography>
                                </Stack>
                            )}
                            {paymentStatus === 'failed' && (
                                <Alert severity="error">
                                    Failed to initiate payment. Please try again.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Transaction Signing */}
                {activeStep === 1 && transactionDetails && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Review Transaction Details
                            </Typography>

                            <Stack spacing={2} sx={{ mb: 3 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        From:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {transactionDetails.fromPublicKey}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        To:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {transactionDetails.toPublicKey}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Amount:
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        {transactionDetails.amount} {transactionDetails.assetCode}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Network:
                                    </Typography>
                                    <Chip
                                        label={transactionDetails.network}
                                        color={transactionDetails.network === 'testnet' ? 'warning' : 'success'}
                                        size="small"
                                    />
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" gutterBottom color="warning.main">
                                ⚠️ Security Warning
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                You are about to sign a transaction. Make sure you trust the recipient and the amount is correct.
                                This action cannot be undone.
                            </Typography>

                            {!walletData?.secretKey ? (
                                <Alert severity="warning">
                                    Secret key is required for signing. Please provide your secret key in the wallet connection step.
                                </Alert>
                            ) : (
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<SecurityIcon />}
                                    onClick={handleSignTransaction}
                                    sx={{ py: 1.5 }}
                                >
                                    Sign Transaction
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Transaction Submission */}
                {activeStep === 2 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Submit Signed Transaction
                            </Typography>

                            <Alert severity="info" sx={{ mb: 2 }}>
                                Transaction has been signed. Click below to submit it to the Stellar network.
                            </Alert>

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Signed Transaction XDR"
                                value={signedTransactionXdr}
                                onChange={(e) => setSignedTransactionXdr(e.target.value)}
                                sx={{ mb: 2 }}
                                helperText="This is the signed transaction data"
                            />

                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<SendIcon />}
                                onClick={handleConfirmTransaction}
                                disabled={!signedTransactionXdr}
                                sx={{ py: 1.5 }}
                            >
                                Submit Transaction
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Completion */}
                {activeStep === 3 && stellarTransaction && (
                    <Card sx={{ bgcolor: 'success.light' }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                <CheckIcon color="success" fontSize="large" />
                                <Typography variant="h6">
                                    Transaction Successful!
                                </Typography>
                            </Stack>

                            <Stack spacing={1}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Transaction Hash:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {stellarTransaction.transactionHash}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Ledger:
                                    </Typography>
                                    <Typography variant="body2">
                                        {stellarTransaction.ledger}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Fee:
                                    </Typography>
                                    <Typography variant="body2">
                                        {stellarTransaction.fee / 10000000} XLM
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        fullWidth
                        disabled={paymentStatus === 'loading' || transactionStatus === 'loading'}
                    >
                        Cancel
                    </Button>
                    {activeStep === 3 && (
                        <Button
                            variant="contained"
                            onClick={() => onTransactionComplete?.(stellarTransaction)}
                            fullWidth
                        >
                            Continue
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
                <DialogTitle>Confirm Transaction Submission</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to submit this transaction to the Stellar network?
                        This action cannot be undone.
                    </Typography>
                    {transactionDetails && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="body2">
                                Amount: {transactionDetails.amount} {transactionDetails.assetCode}
                            </Typography>
                            <Typography variant="body2">
                                To: {transactionDetails.toPublicKey}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmSubmit} variant="contained">
                        Submit Transaction
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default StellarTransactionSigner;