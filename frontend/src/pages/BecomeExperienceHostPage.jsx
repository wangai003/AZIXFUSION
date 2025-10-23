import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Stepper, Step, StepLabel, Stack, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Snackbar, Alert, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { becomeExperienceHostAsync, selectHostOnboardingStatus } from '../features/user/UserSlice';
import { useNavigate } from 'react-router-dom';

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

const steps = ['Host Type', 'Experience Details', 'Business Info', 'Finish'];

export const BecomeExperienceHostPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    hostType: 'local_experience_host',
    businessName: '',
    description: '',
    yearsOfExperience: '',
    specializations: [],
    languages: ['English'],
    certifications: [],
    emergencyContact: '',
    insuranceInfo: '',
    location: '',
    country: '',
    website: '',
    socialMedia: { instagram: '', facebook: '', twitter: '' },
    registrationNumber: '',
    taxId: '',
    businessAddress: '',
    licenseType: '',
    licenseExpiryDate: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const dispatch = useDispatch();
  const hostOnboardingStatus = useSelector(selectHostOnboardingStatus);
  const navigate = useNavigate();

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSpecializationAdd = () => {
    if (newSpecialization.trim() && !form.specializations.includes(newSpecialization.trim())) {
      setForm({
        ...form,
        specializations: [...form.specializations, newSpecialization.trim()]
      });
      setNewSpecialization('');
    }
  };

  const handleSpecializationRemove = (spec) => {
    setForm({
      ...form,
      specializations: form.specializations.filter(s => s !== spec)
    });
  };

  const handleCertificationAdd = () => {
    if (newCertification.trim() && !form.certifications.includes(newCertification.trim())) {
      setForm({
        ...form,
        certifications: [...form.certifications, newCertification.trim()]
      });
      setNewCertification('');
    }
  };

  const handleCertificationRemove = (cert) => {
    setForm({
      ...form,
      certifications: form.certifications.filter(c => c !== cert)
    });
  };

  const handleLanguageAdd = () => {
    if (newLanguage.trim() && !form.languages.includes(newLanguage.trim())) {
      setForm({
        ...form,
        languages: [...form.languages, newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const handleLanguageRemove = (lang) => {
    if (form.languages.length > 1) { // Keep at least one language
      setForm({
        ...form,
        languages: form.languages.filter(l => l !== lang)
      });
    }
  };

  const handleSocialMediaChange = (platform, value) => {
    setForm({
      ...form,
      socialMedia: { ...form.socialMedia, [platform]: value }
    });
  };

  const handleSubmit = () => {
    if (!form.businessName.trim()) {
      setSnackbar({ open: true, message: 'Business name is required.', severity: 'error' });
      return;
    }
    if (!form.description.trim()) {
      setSnackbar({ open: true, message: 'Business description is required.', severity: 'error' });
      return;
    }
    if (!form.location.trim()) {
      setSnackbar({ open: true, message: 'Location is required.', severity: 'error' });
      return;
    }

    dispatch(becomeExperienceHostAsync(form)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setSnackbar({
          open: true,
          message: 'Congratulations! You are now a Local Experience Host. Your profile is pending admin verification.',
          severity: 'success'
        });
        setTimeout(() => navigate('/host/dashboard'), 2000);
      } else {
        setSnackbar({ open: true, message: 'Submission failed. Please try again.', severity: 'error' });
      }
    });
  };

  return (
    <Box maxWidth={600} mx="auto" mt={6} p={3} borderRadius={4} boxShadow={3} bgcolor="#fff">
      <Typography variant="h4" textAlign="center" mb={3} fontWeight="bold">
        Become a Local Experience Host
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Box mt={4}>
        {activeStep === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h6" mb={2}>Host Type</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              You're applying to become a Local Experience Host, offering authentic local experiences to travelers.
            </Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend">What type of experiences will you offer?</FormLabel>
              <RadioGroup value={form.hostType} onChange={(e) => setForm({ ...form, hostType: e.target.value })}>
                <FormControlLabel
                  value="local_experience_host"
                  control={<Radio />}
                  label="Local Experience Host - Guided tours, cultural experiences, adventure activities"
                />
              </RadioGroup>
            </FormControl>
            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="contained" onClick={handleNext}>Next</Button>
            </Stack>
          </motion.div>
        )}

        {activeStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h6" mb={2}>Experience Details</Typography>

            <TextField fullWidth label="Business/Host Name" name="businessName" value={form.businessName} onChange={handleChange} margin="normal" required />

            <TextField fullWidth label="Business Description" name="description" value={form.description} onChange={handleChange} margin="normal" multiline rows={3} required
              helperText="Describe your business and the types of experiences you offer" />

            <TextField fullWidth label="Years of Experience" name="yearsOfExperience" type="number" value={form.yearsOfExperience} onChange={handleChange} margin="normal"
              helperText="How many years have you been hosting experiences?" />

            <TextField fullWidth label="Primary Location" name="location" value={form.location} onChange={handleChange} margin="normal" required
              helperText="City or region where you operate" />

            <TextField
              fullWidth
              select
              label="Country"
              name="country"
              value={form.country}
              onChange={handleChange}
              margin="normal"
              required
              SelectProps={{ native: true }}
            >
              <option value="">Select Country</option>
              {countries.map(countryName => (
                <option key={countryName} value={countryName}>{countryName}</option>
              ))}
            </TextField>

            <Typography variant="subtitle1" mt={2} mb={1}>Languages You Speak</Typography>
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              {form.languages.map((lang) => (
                <Chip key={lang} label={lang} onDelete={() => handleLanguageRemove(lang)} />
              ))}
            </Box>
            <Box display="flex" gap={1}>
              <TextField size="small" label="Add Language" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLanguageAdd()} />
              <Button variant="outlined" onClick={handleLanguageAdd}>Add</Button>
            </Box>

            <Typography variant="subtitle1" mt={3} mb={1}>Specializations</Typography>
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              {form.specializations.map((spec) => (
                <Chip key={spec} label={spec} onDelete={() => handleSpecializationRemove(spec)} />
              ))}
            </Box>
            <Box display="flex" gap={1}>
              <TextField size="small" label="Add Specialization" value={newSpecialization} onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSpecializationAdd()} />
              <Button variant="outlined" onClick={handleSpecializationAdd}>Add</Button>
            </Box>

            <Stack direction="row" spacing={2} mt={3}>
              <Button variant="outlined" onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>Next</Button>
            </Stack>
          </motion.div>
        )}

        {activeStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h6" mb={2}>Business & Legal Information</Typography>

            <Typography variant="subtitle1" mb={1}>Certifications & Licenses</Typography>
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              {form.certifications.map((cert) => (
                <Chip key={cert} label={cert} onDelete={() => handleCertificationRemove(cert)} />
              ))}
            </Box>
            <Box display="flex" gap={1} mb={3}>
              <TextField size="small" label="Add Certification" value={newCertification} onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCertificationAdd()} />
              <Button variant="outlined" onClick={handleCertificationAdd}>Add</Button>
            </Box>

            <TextField fullWidth label="Business Registration Number" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} margin="normal" />

            <TextField fullWidth label="Tax ID" name="taxId" value={form.taxId} onChange={handleChange} margin="normal" />

            <TextField fullWidth label="Business Address" name="businessAddress" value={form.businessAddress} onChange={handleChange} margin="normal" />

            <TextField fullWidth label="License Type" name="licenseType" value={form.licenseType} onChange={handleChange} margin="normal"
              helperText="Tour guide license, business license, etc." />

            <TextField fullWidth label="License Expiry Date" name="licenseExpiryDate" type="date" value={form.licenseExpiryDate} onChange={handleChange} margin="normal"
              InputLabelProps={{ shrink: true }} />

            <TextField fullWidth label="Emergency Contact" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} margin="normal"
              helperText="Phone number for emergencies" />

            <TextField fullWidth label="Insurance Information" name="insuranceInfo" value={form.insuranceInfo} onChange={handleChange} margin="normal"
              helperText="Insurance provider and policy details" />

            <Typography variant="subtitle1" mt={3} mb={1}>Online Presence</Typography>
            <TextField fullWidth label="Website" name="website" value={form.website} onChange={handleChange} margin="normal" />

            <TextField fullWidth label="Instagram" value={form.socialMedia.instagram} onChange={(e) => handleSocialMediaChange('instagram', e.target.value)} margin="normal" />
            <TextField fullWidth label="Facebook" value={form.socialMedia.facebook} onChange={(e) => handleSocialMediaChange('facebook', e.target.value)} margin="normal" />
            <TextField fullWidth label="Twitter" value={form.socialMedia.twitter} onChange={(e) => handleSocialMediaChange('twitter', e.target.value)} margin="normal" />

            <Stack direction="row" spacing={2} mt={3}>
              <Button variant="outlined" onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>Next</Button>
            </Stack>
          </motion.div>
        )}

        {activeStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h5" mb={2}>You're all set!</Typography>
            <Typography mb={2}>
              Congratulations! You are now a Local Experience Host. Your application will be reviewed by our team within 2-3 business days.
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              💡 <strong>What happens next:</strong><br />
              • Our team will verify your credentials and business information<br />
              • You'll receive an email once your account is activated<br />
              • You can then start creating and listing your local experiences<br />
              • You'll get access to the Host Dashboard for managing your experiences
            </Typography>
            <Button variant="contained" onClick={handleSubmit} disabled={hostOnboardingStatus === 'pending'}>
              {hostOnboardingStatus === 'pending' ? 'Submitting...' : 'Complete Application'}
            </Button>
          </motion.div>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};