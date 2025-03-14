/* global albedo */
import {
    Stack, TextField, Typography, Button, Menu, MenuItem, Select, Grid, FormControl,
    Radio, Paper, IconButton, Box, useTheme, useMediaQuery, Dialog, DialogTitle,
    DialogContent, CircularProgress
  } from '@mui/material';
  import { LoadingButton } from '@mui/lab';
  import React, { useEffect, useState, useRef  } from 'react';
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
  import axios from 'axios';
  //import { Server, TransactionBuilder, Networks, Operation, Asset, Keypair } from '@stellar/stellar-sdk';
  import * as StellarSdk from '@stellar/stellar-sdk';

  
  export const Checkout = () => {
    const buttonRef = useRef(null);
    const status = '';
    const addresses = useSelector(selectAddresses);
    const [selectedAddress, setSelectedAddress] = useState(addresses[0] || null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const loggedInUser = useSelector(selectLoggedInUser);
    const addressStatus = useSelector(selectAddressStatus);
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems);
    const orderStatus = useSelector(selectOrderStatus);
    const currentOrder = useSelector(selectCurrentOrder);
    const orderTotal = cartItems.reduce((acc, item) => (item.product.price * item.quantity) + acc, 0);
    const theme = useTheme();
    const is900 = useMediaQuery(theme.breakpoints.down(900));
    const is480 = useMediaQuery(theme.breakpoints.down(480));
  
    // Fix missing state declarations
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState(orderTotal + SHIPPING + TAXES);
  
    useEffect(() => {
      if (addressStatus === 'fulfilled') {
        reset();
      } else if (addressStatus === 'rejected') {
        alert('Error adding your address');
      }
    }, [addressStatus]);
  
    useEffect(() => {
      if (currentOrder && currentOrder?._id) {
        dispatch(resetCartByUserIdAsync(loggedInUser?._id));
        navigate(`/order-success/${currentOrder._id}`);
      }
    }, [currentOrder, dispatch, navigate, loggedInUser]);

    
  
    const handleAddAddress = (data) => {
      const address = { ...data, user: loggedInUser._id };
      dispatch(addAddressAsync(address));
    };
  
    const handleCreateOrder = () => {
      if (!selectedAddress) {
        alert('Please select an address.');
        return;
      }
      const order = {
        user: loggedInUser._id,
        items: cartItems,
        address: selectedAddress,
        paymentMode: selectedPaymentMethod,
        total: orderTotal + SHIPPING + TAXES,
      };
      dispatch(createOrderAsync(order));
    };

    const handleCryptoPayment = async () => {
    if (!window.albedo) {
      console.error("Albedo is not available. Ensure it's installed.");
      alert("Albedo is not available. Please install the Albedo wallet.");
      return;
    }

    try {
      const response = await window.albedo.pay({
        amount: "10", // Set amount dynamically if needed
        destination: "GDISSWB34FJ2OOIKLAGJ7GB7OU4CTGMTUZMRRNN3GF27Y4JCIRMEWWQH",
        asset_code: "AKOFA",
        asset_issuer: "GDOMDAYWWHIDDETBRW4V36UBJULCCRO3H3FYZODRHUO376KS7SDHLOPU",
        network: "testnet",
      });

      console.log("Payment successful:", response);
      alert("Payment Successful! Check the transaction details in Stellar.");

       // ✅ Call handleCreateOrder AFTER payment is successful
        handleCreateOrder();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  };

    
    // Function to build transaction XDR
    async function createXDR(amount, destination) {
    try {
        const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

        // Get the user's public key via Albedo
        const albedoResponse = await albedo.publicKey();
        const sourcePublicKey = albedoResponse.pubkey;

        // Load the user's Stellar account
        const sourceAccount = await server.loadAccount(sourcePublicKey);

        // Create the payment transaction
        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            networkPassphrase: StellarSdk.Networks.TESTNET,
            fee: StellarSdk.BASE_FEE,
        })
            .addOperation(
                StellarSdk.Operation.payment({
                    destination: destination,
                    asset: StellarSdk.Asset.native(), // XLM
                    amount: amount.toString(), // Ensure amount is a string
                })
            )
            .setTimeout(180)
            .build();

        return transaction.toXDR();
    } catch (error) {
        console.error("Error creating XDR:", error);
        throw new Error("Failed to generate transaction.");
    }
}
  
    const handleSubmit2 = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
  
      try {
        const response = await axios.post('http://localhost:8000/api/stkPush', {
          phoneNumber,
          SHIPPING
        });
  
        if (response.data.ResponseCode === '0') {
          alert('Please check your phone for the STK push notification');
          setOpen(false);
        } else {
          setError('Failed to initiate payment. Please try again.');
        }
      } catch (error) {
        setError('An error occurred. Please try again later.');
        console.error('Mpesa payment error:', error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Stack flexDirection={'row'} p={2} rowGap={10} justifyContent={'center'} flexWrap={'wrap'} mb={'5rem'} mt={2} columnGap={4} alignItems={'flex-start'}>
        {/* Left box */}
        <Stack rowGap={4}>
          {/* Heading */}
          <Stack flexDirection={'row'} columnGap={is480 ? 0.3 : 1} alignItems={'center'}>
            <motion.div whileHover={{ x: -5 }}>
              <IconButton component={Link} to={"/cart"}>
                <ArrowBackIcon fontSize={is480 ? "medium" : 'large'} />
              </IconButton>
            </motion.div>
            <Typography variant='h4'>Shipping Information</Typography>
          </Stack>

           {/* address form */}
            <Stack component={'form'} noValidate rowGap={2} onSubmit={handleSubmit(handleAddAddress)}>
                    <Stack>
                        <Typography  gutterBottom>Type</Typography>
                        <TextField placeholder='Eg. Home, Buisness' {...register("type",{required:true})}/>
                    </Stack>


                    <Stack>
                        <Typography gutterBottom>Street</Typography>
                        <TextField {...register("street",{required:true})}/>
                    </Stack>

                    <Stack>
                        <Typography gutterBottom>Country</Typography>
                        <TextField {...register("country",{required:true})}/>
                    </Stack>

                    <Stack>
                        <Typography  gutterBottom>Phone Number</Typography>
                        <TextField type='number' {...register("phoneNumber",{required:true})}/>
                    </Stack>

                    <Stack flexDirection={'row'}>
                        <Stack width={'100%'}>
                            <Typography gutterBottom>City</Typography>
                            <TextField  {...register("city",{required:true})}/>
                        </Stack>
                        <Stack width={'100%'}>
                            <Typography gutterBottom>State</Typography>
                            <TextField  {...register("state",{required:true})}/>
                        </Stack>
                        <Stack width={'100%'}>
                            <Typography gutterBottom>Postal Code</Typography>
                            <TextField type='number' {...register("postalCode",{required:true})}/>
                        </Stack>
                    </Stack>

                    <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={1}>
                        <LoadingButton loading={status==='pending'} type='submit' variant='contained'>add</LoadingButton>
                        <Button color='error' variant='outlined' onClick={()=>reset()}>Reset</Button>
                    </Stack>
            </Stack>

            {/* existing address */}
            <Stack rowGap={3}>

                <Stack>
                    <Typography variant='h6'>Address</Typography>
                    <Typography variant='body2' color={'text.secondary'}>Choose from existing Addresses</Typography>
                </Stack>

                <Grid container gap={2} width={is900?"auto":'50rem'} justifyContent={'flex-start'} alignContent={'flex-start'}>
                        {
                            addresses.map((address,index)=>(
                                <FormControl item >
                                    <Stack key={address._id} p={is480?2:2} width={is480?'100%':'20rem'} height={is480?'auto':'15rem'}  rowGap={2} component={is480?Paper:Paper} elevation={1}>

                                        <Stack flexDirection={'row'} alignItems={'center'}>
                                            <Radio checked={selectedAddress===address} name='addressRadioGroup' value={selectedAddress} onChange={(e)=>setSelectedAddress(addresses[index])}/>
                                            <Typography>{address.type}</Typography>
                                        </Stack>

                                        {/* details */}
                                        <Stack>
                                            <Typography>{address.street}</Typography>
                                            <Typography>{address.state}, {address.city}, {address.country}, {address.postalCode}</Typography>
                                            <Typography>{address.phoneNumber}</Typography>
                                        </Stack>
                                    </Stack>
                                </FormControl>
                            ))
                        }
                </Grid>

            </Stack>
  
          {/* Payment Methods */}
          <Stack rowGap={3}>
            <Typography variant='h6'>Payment Methods</Typography>
            <Typography variant='body2' color={'text.secondary'}>Please select a payment method</Typography>
  
            <Stack rowGap={2}>
              <Stack flexDirection={'row'} alignItems={'center'}>
                <Radio checked={selectedPaymentMethod === 'Crypto'} onChange={() => setSelectedPaymentMethod('COD')} />
                <Typography>Crypto</Typography>
              </Stack>
              <Stack flexDirection={'row'} alignItems={'center'}>
                <Radio checked={selectedPaymentMethod === 'CARD'} onChange={() => setSelectedPaymentMethod('CARD')} />
                <Typography>Card</Typography>
              </Stack>
              <Stack flexDirection={'row'} alignItems={'center'}>
                <Radio checked={selectedPaymentMethod === 'MPESA'} onChange={() => setOpen(true)} />
                <Typography>Mpesa</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
  
        {/* Right box */}
        <Stack width={is900 ? '100%' : 'auto'} alignItems={is900 ? 'flex-start' : ''}>
          <Typography variant='h4'>Order Summary</Typography>
          <Cart checkout={true} />
          <LoadingButton fullWidth loading={orderStatus === 'pending'} variant='contained' onClick={handleCryptoPayment } size='large'>Pay and Order</LoadingButton>
        </Stack>
  
        {/* Mpesa Payment Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Mpesa Payment</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit2} sx={{ mt: 2 }}>
              <TextField fullWidth label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter your Mpesa number (254...)" required sx={{ mb: 3 }} />
              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
              <Button type="submit" variant="contained" fullWidth disabled={loading}>{loading ? <CircularProgress size={24} color="inherit" /> : 'Pay with Mpesa'}</Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Stack>
    );
  };
  

