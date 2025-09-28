import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Stepper, Step, StepLabel, Stack, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Snackbar, Alert, InputAdornment, Chip, Autocomplete, Checkbox, FormGroup, Grid } from '@mui/material';
import { Language as LanguageIcon, LinkedIn as LinkedInIcon, Facebook as FacebookIcon, Twitter as TwitterIcon, Instagram as InstagramIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { refreshUserDataAsync } from '../features/auth/AuthSlice';
import { becomeSellerAsync, selectSellerOnboardingStatus } from '../features/user/UserSlice';
import { useNavigate } from 'react-router-dom';
import { TARGET_MARKETS, EXPORT_CERTIFICATIONS, SHIPPING_TERMS, PAYMENT_TERMS } from '../config/exportCategories';

const steps = ['Seller Type', 'Store Info', 'Company/KYC', 'Social Media', 'Export Details', 'Finish'];

export const BecomeSellerPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    sellerType: '',
    storeName: '',
    description: '',
    companyName: '',
    registrationNumber: '',
    address: '',
    taxId: '',
    website: '',
    linkedin: '',
    facebook: '',
    twitter: '',
    instagram: '',
    // Export-specific fields
    exportLicenseNumber: '',
    exportLicenseExpiry: '',
    businessLicenseNumber: '',
    businessLicenseExpiry: '',
    taxIdentificationNumber: '',
    bankName: '',
    bankAccountNumber: '',
    bankSwiftCode: '',
    primaryExportMarkets: [],
    exportExperience: '',
    annualExportVolume: '',
    mainExportProducts: '',
    qualityCertifications: [],
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiry: '',
    warehouseAddress: '',
    shippingMethods: [],
    paymentTerms: [],
    references: []
  });
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
                <FormControlLabel value="service" control={<Radio />} label="Offer Services" />
                <FormControlLabel value="product" control={<Radio />} label="Sell Goods/Physical Products" />
                <FormControlLabel value="exporter" control={<Radio />} label="Export Products Internationally" />
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
            <Typography variant="h6" mb={2}>Social Media Links</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Connect your social media accounts to build trust with customers. These links will be displayed on all your product listings.
            </Typography>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
              margin="normal"
              placeholder="https://www.yourwebsite.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="LinkedIn"
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              margin="normal"
              placeholder="https://linkedin.com/in/yourprofile"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkedInIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Facebook"
              name="facebook"
              value={form.facebook}
              onChange={handleChange}
              margin="normal"
              placeholder="https://facebook.com/yourpage"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FacebookIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Twitter/X"
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
              margin="normal"
              placeholder="https://twitter.com/yourhandle"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TwitterIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Instagram"
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              margin="normal"
              placeholder="https://instagram.com/yourhandle"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InstagramIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="outlined" onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>Next</Button>
            </Stack>
          </motion.div>
        )}
        {activeStep === 4 && form.sellerType === 'exporter' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h6" mb={2}>Export Business Details</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Please provide comprehensive information about your export business. All fields are required for export vendor verification.
            </Typography>

            <Grid container spacing={3}>
              {/* Export Licenses */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Export License Number"
                  name="exportLicenseNumber"
                  value={form.exportLicenseNumber}
                  onChange={handleChange}
                  required
                  helperText="Your official export license number"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Export License Expiry"
                  name="exportLicenseExpiry"
                  value={form.exportLicenseExpiry}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  helperText="License expiry date"
                />
              </Grid>

              {/* Business Licenses */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Business License Number"
                  name="businessLicenseNumber"
                  value={form.businessLicenseNumber}
                  onChange={handleChange}
                  required
                  helperText="Your business registration number"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Business License Expiry"
                  name="businessLicenseExpiry"
                  value={form.businessLicenseExpiry}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  helperText="Business license expiry date"
                />
              </Grid>

              {/* Tax Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Identification Number"
                  name="taxIdentificationNumber"
                  value={form.taxIdentificationNumber}
                  onChange={handleChange}
                  required
                  helperText="Your TIN or tax identification number"
                />
              </Grid>

              {/* Banking Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                  required
                  helperText="Name of your banking institution"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Account Number"
                  name="bankAccountNumber"
                  value={form.bankAccountNumber}
                  onChange={handleChange}
                  required
                  helperText="Your business bank account number"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank SWIFT Code"
                  name="bankSwiftCode"
                  value={form.bankSwiftCode}
                  onChange={handleChange}
                  required
                  helperText="SWIFT/BIC code for international transfers"
                />
              </Grid>

              {/* Export Experience */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Years of Export Experience"
                  name="exportExperience"
                  value={form.exportExperience}
                  onChange={handleChange}
                  required
                  type="number"
                  helperText="How many years have you been exporting?"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Annual Export Volume"
                  name="annualExportVolume"
                  value={form.annualExportVolume}
                  onChange={handleChange}
                  required
                  helperText="Approximate annual export volume (e.g., $500,000)"
                />
              </Grid>

              {/* Main Export Products */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Main Export Products"
                  name="mainExportProducts"
                  value={form.mainExportProducts}
                  onChange={handleChange}
                  required
                  helperText="Describe your main export products and categories"
                />
              </Grid>

              {/* Warehouse Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Warehouse/Storage Address"
                  name="warehouseAddress"
                  value={form.warehouseAddress}
                  onChange={handleChange}
                  required
                  helperText="Address where your export products are stored"
                />
              </Grid>

              {/* Insurance Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Insurance Provider"
                  name="insuranceProvider"
                  value={form.insuranceProvider}
                  onChange={handleChange}
                  required
                  helperText="Name of your export insurance provider"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Insurance Policy Number"
                  name="insurancePolicyNumber"
                  value={form.insurancePolicyNumber}
                  onChange={handleChange}
                  required
                  helperText="Your export insurance policy number"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Insurance Expiry Date"
                  name="insuranceExpiry"
                  value={form.insuranceExpiry}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  helperText="Insurance policy expiry date"
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="outlined" onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>Next</Button>
            </Stack>
          </motion.div>
        )}
        {(activeStep === 4 && form.sellerType !== 'exporter') || (activeStep === 5 && form.sellerType === 'exporter') && (
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