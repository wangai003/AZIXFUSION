import { Stack, TextField, Typography, Button, Grid, FormControl, Radio, Paper, IconButton, useTheme, useMediaQuery } from '@mui/material';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SHIPPING, TAXES } from '../../../constants';
import { motion } from 'framer-motion';

export const Checkout = () => {
    const addresses = useSelector(selectAddresses);
    const [selectedAddress, setSelectedAddress] = useState(addresses.length > 0 ? addresses[0] : null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');

    const { register, handleSubmit, reset, formState } = useForm();
    const dispatch = useDispatch();
    const loggedInUser = useSelector(selectLoggedInUser);
    const addressStatus = useSelector(selectAddressStatus);
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems);
    const orderStatus = useSelector(selectOrderStatus);
    const currentOrder = useSelector(selectCurrentOrder);
    const orderTotal = cartItems.reduce((acc, item) => ((item.product?.price || 0) * item.quantity) + acc, 0);
    const theme = useTheme();
    const is480 = useMediaQuery(theme.breakpoints.down(480));

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

    const handleCreateOrder = () => {
        if (selectedPaymentMethod === 'mpesa') {
            handleMpesaPayment();
        } else {
            const order = {
                user: loggedInUser._id,
                item: cartItems,
                address: selectedAddress,
                paymentMode: selectedPaymentMethod,
                total: orderTotal + SHIPPING + TAXES
            };
            dispatch(createOrderAsync(order));
        }
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

                {/* payment method selection */}
                <Stack rowGap={2}>
                    <Typography variant='h5'>Payment Method</Typography>
                    <FormControl>
                        <Stack direction='row' spacing={2}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Radio
                                    checked={selectedPaymentMethod === 'cash'}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                    value='cash'
                                />
                                <Typography>Cash on Delivery</Typography>
                            </Stack>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Radio
                                    checked={selectedPaymentMethod === 'mpesa'}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                    value='mpesa'
                                />
                                <Typography>M-Pesa</Typography>
                            </Stack>
                        </Stack>
                    </FormControl>
                </Stack>

                {/* place order button */}
                <LoadingButton
                    loading={orderStatus === 'pending'}
                    onClick={handleCreateOrder}
                    variant='contained'
                    size='large'
                    disabled={!selectedAddress}
                >
                    Place Order
                </LoadingButton>
            </Stack>

            {/* right box */}
            <Stack>
                <Cart />
            </Stack>
        </Stack>
    );
};

