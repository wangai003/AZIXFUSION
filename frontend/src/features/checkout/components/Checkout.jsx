import { Stack, TextField, Typography, Button, Grid, FormControl, Radio, Paper, IconButton, useTheme, useMediaQuery, Alert, Box, Divider } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import React, { useEffect, useState } from 'react';
import { Cart } from '../../cart/components/Cart';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { addAddressAsync, selectAddressStatus, selectAddresses } from '../../address/AddressSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { Link, useNavigate } from 'react-router-dom';
import { createOrderAsync, selectCurrentOrder, selectOrderStatus } from '../../order/OrderSlice';
import { resetCartByUserIdAsync, selectCartItems } from '../../cart/CartSlice';
import { selectCurrency, selectLockedRates, selectLockStatus, selectCurrencyError } from '../../currency/currencySlice';
import { lockCurrencyRatesAsync } from '../../payment/PaymentSlice';
import { initiateMoonPayPaymentAsync, initiateAkofaPaymentAsync, initiateStellarPaymentAsync, selectPaymentStatus, selectCurrentPayment, selectPaymentError, resetPaymentState } from '../../payment/PaymentSlice';
import { usePaymentStatusPoller } from '../../payment/PaymentStatusPoller';
import StellarPaymentFlow from '../../wallet/components/StellarPaymentFlow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SHIPPING, TAXES } from '../../../constants';
import { motion } from 'framer-motion';

export const Checkout = () => {
    const addresses = useSelector(selectAddresses);
    const [selectedAddress, setSelectedAddress] = useState(addresses.length > 0 ? addresses[0] : null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
    const [showStellarFlow, setShowStellarFlow] = useState(false);

    const { register, handleSubmit, reset, formState } = useForm();
    const dispatch = useDispatch();
    const loggedInUser = useSelector(selectLoggedInUser);
    const addressStatus = useSelector(selectAddressStatus);
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems);
    const orderStatus = useSelector(selectOrderStatus);
    const currentOrder = useSelector(selectCurrentOrder);

    // Currency and payment selectors
    const selectedCurrency = useSelector(selectCurrency);
    const lockedRates = useSelector(selectLockedRates);
    const lockStatus = useSelector(selectLockStatus);
    const currencyError = useSelector(selectCurrencyError);
    const paymentStatus = useSelector(selectPaymentStatus);
    const currentPayment = useSelector(selectCurrentPayment);
    const paymentError = useSelector(selectPaymentError);

    const orderTotal = cartItems.reduce((acc, item) => ((item.product?.price || 0) * item.quantity) + acc, 0);
    const theme = useTheme();
    const is480 = useMediaQuery(theme.breakpoints.down(480));

    // Determine available payment methods based on currency
    const getAvailablePaymentMethods = () => {
        const methods = [];

        if (['USDC', 'USDT', 'BTC'].includes(selectedCurrency)) {
            methods.push({ value: 'moonpay', label: 'MoonPay (Crypto)' });
        }

        if (selectedCurrency === 'AKOFA') {
            methods.push({ value: 'stellar', label: 'Stellar Wallet' });
            methods.push({ value: 'akofa', label: 'AKOFA Payment (Coming Soon)' });
        }

        methods.push({ value: 'cash', label: 'Cash on Delivery' });
        methods.push({ value: 'mpesa', label: 'M-Pesa' });

        return methods;
    };

    const availablePaymentMethods = getAvailablePaymentMethods();

    // Payment status polling hook
    const { startPolling, stopPolling } = usePaymentStatusPoller();

    useEffect(() => {
        if (addressStatus === 'fulfilled') {
            reset();
        } else if (addressStatus === 'rejected') {
            console.warn('Error adding your address');
        }
    }, [addressStatus]);

    useEffect(() => {
        if (currentOrder && currentOrder?._id) {
            dispatch(resetCartByUserIdAsync(loggedInUser?._id));
            navigate(`/order-success/${currentOrder?._id}`);
        }
    }, [currentOrder]);

    // Handle payment completion
    useEffect(() => {
        if (currentPayment && currentPayment.paymentUrl && currentPayment.paymentIntentId) {
            // Start polling for payment status
            startPolling(currentPayment.paymentIntentId);

            // Redirect to MoonPay after a short delay to allow polling to start
            setTimeout(() => {
                window.location.href = currentPayment.paymentUrl;
            }, 1000);
        }
    }, [currentPayment, startPolling]);

    // Reset payment state when currency changes
    useEffect(() => {
        dispatch(resetPaymentState());
    }, [selectedCurrency, dispatch]);

    const handleAddAddress = (data) => {
        const address = { ...data, user: loggedInUser._id };
        dispatch(addAddressAsync(address));
    };

    const handleMpesaPayment = async () => {
        try {
            const response = await fetch('http://localhost:8000/payments/mpesa/stkpush', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: orderTotal + SHIPPING + TAXES,
                    phoneNumber: loggedInUser.phoneNumber, // Ensure phoneNumber is available
                }),
            });

            const data = await response.json();
            if (data.success) {
                console.warn('STK Push initiated. Please complete the payment on your phone.');
            } else {
                console.warn('Failed to initiate STK Push: ' + data.message);
            }
        } catch (error) {
            console.error('Error initiating Mpesa payment:', error);
            console.warn('Error initiating Mpesa payment.');
        }
    };

    const handleCreateOrder = async () => {
        if (selectedPaymentMethod === 'mpesa') {
            handleMpesaPayment();
            return;
        }

        if (selectedPaymentMethod === 'moonpay') {
            // Lock rates first
            if (!lockedRates) {
                try {
                    await dispatch(lockCurrencyRatesAsync(selectedCurrency)).unwrap();
                } catch (error) {
                    console.error('Failed to lock rates:', error);
                    return;
                }
            }

            // Get updated locked rates
            const currentLockedRates = lockedRates || (await dispatch(lockCurrencyRatesAsync(selectedCurrency)).unwrap()).lockedRates;

            const paymentData = {
                orderData: {
                    user: loggedInUser._id,
                    item: cartItems,
                    address: selectedAddress,
                    paymentMode: selectedPaymentMethod,
                    total: orderTotal,
                    shipping: SHIPPING,
                    taxes: TAXES,
                    userEmail: loggedInUser.email
                },
                lockedRates: currentLockedRates,
                selectedCurrency,
                walletAddress: loggedInUser.walletAddress // Assuming user has wallet address
            };

            dispatch(initiateMoonPayPaymentAsync(paymentData));
            return;
        }

        if (selectedPaymentMethod === 'stellar') {
            // Show Stellar payment flow
            setShowStellarFlow(true);
            return;
        }

        if (selectedPaymentMethod === 'akofa') {
            // Placeholder for future AKOFA payment
            dispatch(initiateAkofaPaymentAsync({
                orderData: {
                    user: loggedInUser._id,
                    item: cartItems,
                    address: selectedAddress,
                    paymentMode: selectedPaymentMethod,
                    total: orderTotal + SHIPPING + TAXES
                },
                selectedCurrency
            }));
            return;
        }

        // Default: Cash on Delivery or other methods
        const order = {
            user: loggedInUser._id,
            item: cartItems,
            address: selectedAddress,
            paymentMode: selectedPaymentMethod,
            total: orderTotal + SHIPPING + TAXES
        };
        dispatch(createOrderAsync(order));
    };

    return (
        <Stack flexDirection={'row'} p={2} rowGap={10} justifyContent={'center'} flexWrap={'wrap'} mb={'5rem'} mt={2} columnGap={4} alignItems={'flex-start'}>
            {/* left box */}
            <Stack rowGap={4}>
                {/* heading */}
                <Stack flexDirection={'row'} columnGap={is480 ? 0.3 : 1} alignItems={'center'}>
                    <motion.div whileHover={{ x: -5 }}>
                        <IconButton component={Link} to={"/cart"}><ArrowBackIcon fontSize={is480 ? "medium" : 'large'} /></IconButton>
                    </motion.div>
                    <Typography variant='h4'>Shipping Information</Typography>
                </Stack>
                {/* address form */}
                <Stack component={'form'} noValidate rowGap={2} onSubmit={handleSubmit(handleAddAddress)}>
                    <Stack>
                        <Typography gutterBottom>Type</Typography>
                        <TextField placeholder='Eg. Home, Business' {...register("type", { required: true })} />
                    </Stack>
                    <Stack>
                        <Typography gutterBottom>Street</Typography>
                        <TextField {...register("street", { required: true })} />
                    </Stack>
                    <Stack>
                        <Typography gutterBottom>Country</Typography>
                        <TextField {...register("country", { required: true })} />
                    </Stack>
                    <Stack>
                        <Typography gutterBottom>City</Typography>
                        <TextField {...register("city", { required: true })} />
                    </Stack>
                    <Stack>
                        <Typography gutterBottom>Postal Code</Typography>
                        <TextField {...register("postalCode", { required: true })} />
                    </Stack>
                    <LoadingButton loading={addressStatus === 'pending'} type='submit' variant='contained'>Add Address</LoadingButton>
                </Stack>

                {/* address selection */}
                <Stack rowGap={2}>
                    <Typography variant='h5'>Select Address</Typography>
                    <Grid container spacing={2}>
                        {addresses.map((address) => (
                            <Grid item xs={12} sm={6} key={address._id}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        border: selectedAddress?._id === address._id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                        backgroundColor: selectedAddress?._id === address._id ? '#f5f5f5' : 'white'
                                    }}
                                    onClick={() => setSelectedAddress(address)}
                                >
                                    <Typography variant='subtitle1'>{address.type}</Typography>
                                    <Typography variant='body2'>{address.street}</Typography>
                                    <Typography variant='body2'>{address.city}, {address.country} {address.postalCode}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Stack>

                {/* Currency and Payment Preview */}
                <Stack rowGap={2}>
                    <Typography variant='h5'>Payment Summary</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Stack spacing={1}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography>Subtotal:</Typography>
                                <Typography>{orderTotal.toFixed(2)} AKOFA</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography>Shipping:</Typography>
                                <Typography>{SHIPPING} AKOFA</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography>Taxes:</Typography>
                                <Typography>{TAXES} AKOFA</Typography>
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between" fontWeight="bold">
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6">{(orderTotal + SHIPPING + TAXES).toFixed(2)} AKOFA</Typography>
                            </Box>
                            {selectedCurrency !== 'AKOFA' && lockedRates && (
                                <>
                                    <Divider />
                                    <Box display="flex" justifyContent="space-between" color="primary.main">
                                        <Typography>Converted to {selectedCurrency}:</Typography>
                                        <Typography>
                                            {((orderTotal + SHIPPING + TAXES) * (lockedRates[selectedCurrency] || 0)).toFixed(6)} {selectedCurrency}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    </Paper>

                    {/* Rate locking status */}
                    {lockStatus === 'loading' && (
                        <Alert severity="info">Locking exchange rates...</Alert>
                    )}
                    {currencyError && (
                        <Alert severity="error">{currencyError.message || 'Currency error occurred'}</Alert>
                    )}
                </Stack>

                {/* payment method selection */}
                <Stack rowGap={2}>
                    <Typography variant='h5'>Payment Method</Typography>
                    <FormControl>
                        <Stack spacing={2}>
                            {availablePaymentMethods.map((method) => (
                                <Stack key={method.value} direction='row' alignItems='center' spacing={1}>
                                    <Radio
                                        checked={selectedPaymentMethod === method.value}
                                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                        value={method.value}
                                        disabled={method.value === 'akofa'} // Disable AKOFA until implemented
                                    />
                                    <Typography>{method.label}</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </FormControl>

                    {/* Payment errors */}
                    {paymentError && (
                        <Alert severity="error">{paymentError.message || 'Payment error occurred'}</Alert>
                    )}
                    {paymentStatus === 'loading' && (
                        <Alert severity="info">Initiating payment...</Alert>
                    )}
                </Stack>

                {/* place order button */}
                <LoadingButton
                    loading={orderStatus === 'pending' || paymentStatus === 'loading' || lockStatus === 'loading'}
                    onClick={handleCreateOrder}
                    variant='contained'
                    size='large'
                    disabled={!selectedAddress || (selectedPaymentMethod === 'moonpay' && !lockedRates)}
                >
                    {selectedPaymentMethod === 'moonpay' ? 'Pay with MoonPay' :
                     selectedPaymentMethod === 'stellar' ? 'Pay with Stellar Wallet' :
                     selectedPaymentMethod === 'akofa' ? 'Pay with AKOFA' :
                     'Place Order'}
                </LoadingButton>
            </Stack>

            {/* right box */}
            <Stack>
                <Cart />
            </Stack>

            {/* Stellar Payment Flow Modal */}
            {showStellarFlow && (
                <StellarPaymentFlow
                    orderData={{
                        id: `order_${Date.now()}`,
                        user: loggedInUser._id,
                        item: cartItems,
                        address: selectedAddress,
                        paymentMode: selectedPaymentMethod,
                        total: orderTotal + SHIPPING + TAXES,
                        shipping: SHIPPING,
                        taxes: TAXES,
                        userEmail: loggedInUser.email
                    }}
                    amount={orderTotal + SHIPPING + TAXES}
                    recipientPublicKey={process.env.REACT_APP_STELLAR_RECIPIENT_PUBLIC_KEY || 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'}
                    assetCode="AKOFA"
                    issuer={process.env.REACT_APP_STELLAR_AKOFA_ISSUER || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'}
                    onPaymentComplete={(result) => {
                        if (result.success) {
                            // Create order after successful payment
                            const order = {
                                user: loggedInUser._id,
                                item: cartItems,
                                address: selectedAddress,
                                paymentMode: selectedPaymentMethod,
                                total: orderTotal + SHIPPING + TAXES,
                                paymentIntentId: result.transactionResult?.orderId
                            };
                            dispatch(createOrderAsync(order));
                        }
                        setShowStellarFlow(false);
                    }}
                    onCancel={() => setShowStellarFlow(false)}
                />
            )}
        </Stack>
    );
};

