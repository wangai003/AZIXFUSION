import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar
} from '@mui/material';
import {
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Language as LanguageIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { becomeExporterAsync, selectExporterOnboardingStatus } from '../features/user/UserSlice';
import { refreshUserDataAsync } from '../features/auth/AuthSlice';

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
  'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
  'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
];

const BecomeExportVendorPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const exporterOnboardingStatus = useSelector(selectExporterOnboardingStatus);

  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Business Info', 'Export Details', 'Review & Submit'];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Business Information
    companyName: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    yearEstablished: '',
    employeeCount: '',

    // Contact Information
    businessAddress: '',
    city: '',
    country: 'Kenya',
    postalCode: '',
    businessPhone: '',
    businessEmail: '',

    // Export Information
    exportExperience: '',
    mainMarkets: [],
    exportCertifications: [],
    annualExportValue: '',
    primaryProducts: '',

    // Online Presence
    website: '',
    linkedin: '',
    facebook: '',
    twitter: '',
    instagram: '',

    // Additional Information
    businessDescription: '',
    exportStrategy: '',
    references: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.companyName.trim()) return 'Company name is required';
        if (!formData.businessType) return 'Business type is required';
        if (!formData.businessEmail) return 'Business email is required';
        if (!formData.businessPhone) return 'Business phone is required';
        break;
      case 1:
        if (!formData.website.trim()) return 'Website URL is required';
        if (!formData.mainMarkets.length) return 'At least one main market is required';
        break;
      case 2:
        if (!formData.businessDescription.trim()) return 'Business description is required';
        break;
    }
    return null;
  };

  const handleNext = () => {
    const validationError = validateStep(activeStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setActiveStep(prev => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = () => {
    const validationError = validateStep(activeStep);
    if (validationError) {
      setError(validationError);
      return;
    }

    dispatch(becomeExporterAsync(formData)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        // Refresh user data to get the updated roles
        dispatch(refreshUserDataAsync()).then(() => {
          setSuccess(true);
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        });
      } else {
        setError('Submission failed. Please try again.');
      }
    });
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Dialog open={true} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" color="success.main">
              Application Submitted Successfully!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your application to become an African Export Vendor has been submitted for review.
              We'll review your application and get back to you within 2-3 business days.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to your profile...
            </Typography>
          </DialogContent>
        </Dialog>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="outlined"
        >
          Back to Home
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Become an African Export Vendor
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Step 1: Business Info */}
      {activeStep === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Business Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Business Type"
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                required
                placeholder="e.g., Manufacturing, Trading, Agriculture"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Registration Number"
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax ID"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Year Established"
                value={formData.yearEstablished}
                onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Number of Employees"
                value={formData.employeeCount}
                onChange={(e) => handleInputChange('employeeCount', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Address"
                value={formData.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">Select Country</option>
                {countries.map(countryName => (
                  <option key={countryName} value={countryName}>{countryName}</option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Business Phone"
                value={formData.businessPhone}
                onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                label="Business Email"
                value={formData.businessEmail}
                onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Step 2: Export Details */}
      {activeStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Export Details & Online Presence
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Export Experience"
                type="number"
                value={formData.exportExperience}
                onChange={(e) => handleInputChange('exportExperience', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Annual Export Value (USD)"
                value={formData.annualExportValue}
                onChange={(e) => handleInputChange('annualExportValue', e.target.value)}
                placeholder="e.g., $500,000 - $1,000,000"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Main Export Markets"
                value={formData.mainMarkets.join(', ')}
                onChange={(e) => handleArrayInputChange('mainMarkets', e.target.value)}
                required
                helperText="Separate countries/regions with commas (e.g., Nigeria, South Africa, Europe)"
                placeholder="e.g., Nigeria, South Africa, Europe, Middle East"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Export Certifications"
                value={formData.exportCertifications.join(', ')}
                onChange={(e) => handleArrayInputChange('exportCertifications', e.target.value)}
                helperText="Separate certifications with commas (e.g., ISO 9001, HACCP, Organic)"
                placeholder="e.g., ISO 9001, HACCP, Organic Certification"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Primary Products/Services"
                value={formData.primaryProducts}
                onChange={(e) => handleInputChange('primaryProducts', e.target.value)}
                multiline
                rows={2}
                placeholder="Describe your main products or services for export"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Online Presence (Required)
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website URL"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                required
                placeholder="https://www.yourcompany.com"
                InputProps={{
                  startAdornment: <LanguageIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
                InputProps={{
                  startAdornment: <LinkedInIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Facebook Page"
                value={formData.facebook}
                onChange={(e) => handleInputChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourcompany"
                InputProps={{
                  startAdornment: <FacebookIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Twitter Handle"
                value={formData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder="@yourcompany"
                InputProps={{
                  startAdornment: <TwitterIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Instagram Profile"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="@yourcompany"
                InputProps={{
                  startAdornment: <InstagramIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Step 3: Review & Submit */}
      {activeStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Review Your Application
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Business Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography><strong>Company:</strong> {formData.companyName}</Typography>
                    <Typography><strong>Type:</strong> {formData.businessType}</Typography>
                    <Typography><strong>Email:</strong> {formData.businessEmail}</Typography>
                    <Typography><strong>Phone:</strong> {formData.businessPhone}</Typography>
                    <Typography><strong>Address:</strong> {formData.businessAddress}, {formData.city}, {formData.country}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Export Profile
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography><strong>Experience:</strong> {formData.exportExperience} years</Typography>
                    <Typography><strong>Markets:</strong> {formData.mainMarkets.join(', ')}</Typography>
                    <Typography><strong>Website:</strong> {formData.website}</Typography>
                    <Typography><strong>Annual Value:</strong> {formData.annualExportValue}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Business Description
                  </Typography>
                  <Typography variant="body2">
                    {formData.businessDescription || 'Not provided'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              size="large"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {exporterOnboardingStatus === 'pending' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography color="primary">Submitting application...</Typography>
        </Box>
      )}
    </Container>
  );
};

export default BecomeExportVendorPage;