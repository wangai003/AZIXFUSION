import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Stepper, Step, StepLabel, Stack, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { refreshUserDataAsync } from '../features/auth/AuthSlice';
import { becomeSellerAsync, selectSellerOnboardingStatus } from '../features/user/UserSlice';
import { useNavigate } from 'react-router-dom';

const steps = ['Seller Type', 'Store Info', 'Company/KYC', 'Finish'];

export const BecomeSellerPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({ sellerType: '', storeName: '', description: '', companyName: '', registrationNumber: '', address: '', taxId: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const dispatch = useDispatch();
  const sellerOnboardingStatus = useSelector(selectSellerOnboardingStatus);
  const navigate = useNavigate();

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSellerTypeChange = (e) => setForm({ ...form, sellerType: e.target.value });

  const handleSubmit = () => {
    if (!form.sellerType) {
      setSnackbar({ open: true, message: 'Please select a seller type.', severity: 'error' });
      return;
    }
    dispatch(becomeSellerAsync(form)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        // Refresh user data to get the updated roles and seller information
        dispatch(refreshUserDataAsync()).then(() => {
          setSnackbar({ open: true, message: 'Congratulations! You are now a seller. Your profile is pending admin verification.', severity: 'success' });
          setTimeout(() => navigate('/seller/dashboard'), 2000);
        });
      } else {
        setSnackbar({ open: true, message: 'Submission failed. Please try again.', severity: 'error' });
      }
    });
  };

  return (
    <Box maxWidth={500} mx="auto" mt={6} p={3} borderRadius={4} boxShadow={3} bgcolor="#fff">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      <Box mt={4}>
        {activeStep === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h6" mb={2}>Choose Seller Type</Typography>
            <FormControl component="fieldset" required>
              <FormLabel component="legend">I want to...</FormLabel>
              <RadioGroup row value={form.sellerType} onChange={handleSellerTypeChange}>
                <FormControlLabel value="service" control={<Radio />} label="Offer Services (like Fiverr/Upwork)" />
                <FormControlLabel value="product" control={<Radio />} label="Sell Goods/Physical Products (like Amazon/Etsy)" />
              </RadioGroup>
            </FormControl>
            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="contained" onClick={handleNext} disabled={!form.sellerType}>Next</Button>
            </Stack>
          </motion.div>
        )}
        {activeStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h6" mb={2}>Store Information</Typography>
            <TextField fullWidth label="Store Name" name="storeName" value={form.storeName} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Description" name="description" value={form.description} onChange={handleChange} margin="normal" multiline rows={3} />
            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="outlined" onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>Next</Button>
            </Stack>
          </motion.div>
        )}
        {activeStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h6" mb={2}>Company/KYC Details</Typography>
            <TextField fullWidth label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Registration Number" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Tax ID" name="taxId" value={form.taxId} onChange={handleChange} margin="normal" />
            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="outlined" onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>Next</Button>
            </Stack>
          </motion.div>
        )}
        {activeStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h5" mb={2}>You're all set!</Typography>
            <Typography mb={2}>Congratulations! You are now a seller. Your profile is pending admin verification for the blue verified badge.</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              💡 <strong>Pro tip:</strong> You'll now see a floating seller button on the bottom-right of every page for quick access to your dashboard!
            </Typography>
            <Button variant="contained" onClick={handleSubmit}>Finish</Button>
          </motion.div>
        )}
      </Box>
      {sellerOnboardingStatus === 'pending' && <Typography color="primary">Submitting...</Typography>}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 