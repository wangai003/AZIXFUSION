import React, { useState } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, TextField, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const MpesaPaymentModal = ({ open, onClose, amount }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/lipanampesa/stkPush', {
        phoneNumber,
        amount
      });

      if (response.data.ResponseCode === '0') {
        // Payment initiated successfully
        console.warn('Please check your phone for the STK push notification');
        onClose();
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="mpesa-payment-title"
      aria-describedby="mpesa-payment-description"
      disableRestoreFocus
      keepMounted={false}
    >
      <DialogTitle id="mpesa-payment-title">
        <Typography variant="h6" component="div">
          Mpesa Payment
        </Typography>
      </DialogTitle>
      <DialogContent id="mpesa-payment-description">
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Amount to pay: KES {amount}
          </Typography>
          
          <TextField
            fullWidth
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your Mpesa number (254...)"
            required
            sx={{ mb: 3 }}
          />

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': {
                bgcolor: '#45a049'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Pay with Mpesa'
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPaymentModal;