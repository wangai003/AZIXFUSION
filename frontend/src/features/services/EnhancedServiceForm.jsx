import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Divider,
  Card,
  CardContent,
  AlertTitle
} from '@mui/material';
import {
  Add,
  Save,
  Preview,
  AutoAwesome,
  TrendingUp,
  Speed,
  Support,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { addService, updateService } from './ServiceApi';
import { useSelector } from 'react-redux';
import { selectLoggedInUser } from '../auth/AuthSlice';
import { CategorySelector } from '../../components/forms/CategorySelector';
import { PackageManager } from '../../components/forms/PackageManager';
import { RequirementsManager } from '../../components/forms/RequirementsManager';
import { MediaManager } from '../../components/forms/MediaManager';
import { SERVICE_CATEGORIES, PRICING_MODELS, SERVICE_LEVELS } from '../../config/serviceCategories';

const steps = [
  { 
    label: 'Basic Info', 
    icon: <Add />,
    description: 'Service title, description, and category'
  },
  { 
    label: 'Pricing & Packages', 
    icon: <TrendingUp />,
    description: 'Set pricing model and create service packages'
  },
  { 
    label: 'Requirements & FAQ', 
    icon: <CheckCircle />,
    description: 'Define client requirements and common questions'
  },
  { 
    label: 'Media & Portfolio', 
    icon: <AutoAwesome />,
    description: 'Upload images and showcase your work'
  },
  { 
    label: 'Review & Publish', 
    icon: <Preview />,
    description: 'Review your service and make it live'
  }
];

const initialForm = {
  title: '',
  description: '',
  category: '',
  subcategory: '',
  tags: [],
  pricingModel: 'fixed',
  serviceLevel: 'standard',
  packages: [],
  requirements: [],
  faq: [],
  media: [],
  portfolio: [],
  isActive: true,
  isFeatured: false,
  isUrgent: false,
  hasExpressDelivery: false,
  expressDeliveryFee: 0,
  expressDeliveryTime: 1,
  cancellationPolicy: 'flexible',
  refundPolicy: 'standard',
  additionalServices: [],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: []
};

export const EnhancedServiceForm = ({ initialData, onSuccess }) => {
  const [form, setForm] = useState(initialData || initialForm);
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [validationErrors, setValidationErrors] = useState({});
  const loggedInUser = useSelector(selectLoggedInUser);

  // Update form when category changes
  useEffect(() => {
    if (form.category && !form.subcategory) {
      // Auto-select first subcategory if available
      const categoryData = Object.entries(SERVICE_CATEGORIES).find(([key]) => 
        key === form.category
      );
      if (categoryData && categoryData[1].subcategories.length > 0) {
        setForm(prev => ({ ...prev, subcategory: categoryData[1].subcategories[0] }));
      }
    }
  }, [form.category]);

  const handleNext = () => {
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSnackbar({ 
        open: true, 
        message: 'Please fix the errors before proceeding', 
        severity: 'error' 
      });
      return;
    }
    setValidationErrors({});
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear validation error when field is updated
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateCurrentStep = () => {
    const errors = {};

    switch (activeStep) {
      case 0: // Basic Info
        if (!form.title?.trim()) errors.title = 'Title is required';
        if (!form.description?.trim()) errors.description = 'Description is required';
        if (!form.category) errors.category = 'Category is required';
        if (!form.subcategory) errors.subcategory = 'Subcategory is required';
        break;

      case 1: // Pricing & Packages
        if (!form.packages || form.packages.length === 0) {
          errors.packages = 'At least one package is required';
        } else {
          form.packages.forEach((pkg, idx) => {
            if (!pkg.name?.trim()) errors[`package_${idx}_name`] = 'Package name is required';
            if (!pkg.price) errors[`package_${idx}_price`] = 'Package price is required';
            if (!pkg.description?.trim()) errors[`package_${idx}_description`] = 'Package description is required';
            if (!pkg.deliveryTime) errors[`package_${idx}_deliveryTime`] = 'Delivery time is required';
          });
        }
        break;

      case 2: // Requirements & FAQ
        if (!form.requirements || form.requirements.length === 0) {
          errors.requirements = 'At least one requirement is needed';
        }
        break;

      case 3: // Media & Portfolio
        if (!form.media || form.media.length === 0) {
          errors.media = 'At least one image is recommended';
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({ 
        open: true, 
        message: 'Please fix all errors before submitting', 
        severity: 'error' 
      });
      return;
    }

    setSubmitting(true);
    try {
      // Clean up the form data
      const cleanForm = {
        ...form,
        packages: form.packages.filter(pkg => pkg.name && pkg.price && pkg.description),
        requirements: form.requirements.filter(req => req.question?.trim()),
        faq: form.faq.filter(item => item.question?.trim() && item.answer?.trim()),
        tags: Array.isArray(form.tags) ? form.tags : form.tags.split(',').map(t => t.trim()).filter(t => t),
        seoKeywords: Array.isArray(form.seoKeywords) ? form.seoKeywords : form.seoKeywords.split(',').map(k => k.trim()).filter(k => k),
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const payload = {
        ...cleanForm,
        provider: loggedInUser?._id,
        providerName: loggedInUser?.name || 'Unknown Provider'
      };

      console.log('Submitting enhanced service with payload:', payload);

      if (initialData && initialData._id) {
        await updateService(initialData._id, payload);
        setSnackbar({ open: true, message: 'Service updated successfully!', severity: 'success' });
      } else {
        await addService(payload);
        setSnackbar({ open: true, message: 'Service created successfully!', severity: 'success' });
      }
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Service submission error:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || 'Failed to save service. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Service Information
            </Typography>
            
            <TextField 
              label="Service Title *" 
              fullWidth 
              margin="normal" 
              value={form.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              error={!!validationErrors.title}
              helperText={validationErrors.title || "Enter a compelling title that describes your service"}
              required 
            />

            <TextField 
              label="Service Description *" 
              fullWidth 
              margin="normal" 
              multiline 
              rows={4} 
              value={form.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              error={!!validationErrors.description}
              helperText={validationErrors.description || "Describe what you offer in detail. Be specific about deliverables, process, and value."}
              required 
            />

            <CategorySelector
              value={form.category}
              onChange={(value) => handleChange('category', value)}
              error={!!validationErrors.category}
              helperText={validationErrors.category}
              required
            />

            {form.category && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Subcategory *</InputLabel>
                <Select
                  value={form.subcategory}
                  onChange={(e) => handleChange('subcategory', e.target.value)}
                  label="Subcategory *"
                  error={!!validationErrors.subcategory}
                >
                  {form.category && SERVICE_CATEGORIES[form.category]?.subcategories.map((sub) => (
                    <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField 
              label="Tags (comma separated)" 
              fullWidth 
              margin="normal" 
              value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags} 
              onChange={(e) => handleChange('tags', e.target.value)}
              helperText="Add relevant tags to help clients find your service (e.g., react, design, logo, website)"
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Service Options
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Pricing Model</InputLabel>
                    <Select
                      value={form.pricingModel}
                      onChange={(e) => handleChange('pricingModel', e.target.value)}
                      label="Pricing Model"
                    >
                      {PRICING_MODELS.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          <Box>
                            <Typography variant="body1">{model.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {model.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Service Level</InputLabel>
                    <Select
                      value={form.serviceLevel}
                      onChange={(e) => handleChange('serviceLevel', e.target.value)}
                      label="Service Level"
                    >
                      {SERVICE_LEVELS.map((level) => (
                        <MenuItem key={level.value} value={level.value}>
                          <Box>
                            <Typography variant="body1">{level.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {level.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );

      case 1:
        return (
          <PackageManager
            packages={form.packages}
            onChange={(packages) => handleChange('packages', packages)}
            category={form.category}
            pricingModel={form.pricingModel}
            onPricingModelChange={(model) => handleChange('pricingModel', model)}
          />
        );

      case 2:
        return (
          <RequirementsManager
            requirements={form.requirements}
            onChange={(requirements) => handleChange('requirements', requirements)}
            category={form.category}
            faq={form.faq}
            onFaqChange={(faq) => handleChange('faq', faq)}
          />
        );

      case 3:
        return (
          <MediaManager
            media={form.media}
            onChange={(media) => handleChange('media', media)}
            portfolio={form.portfolio}
            onPortfolioChange={(portfolio) => handleChange('portfolio', portfolio)}
          />
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Review Your Service
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Title:</strong> {form.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Category:</strong> {form.category} {form.subcategory && `> ${form.subcategory}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Pricing Model:</strong> {PRICING_MODELS.find(p => p.value === form.pricingModel)?.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Service Level:</strong> {SERVICE_LEVELS.find(s => s.value === form.serviceLevel)?.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Packages & Pricing</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Packages:</strong> {form.packages?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Requirements:</strong> {form.requirements?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>FAQ Items:</strong> {form.faq?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Media Files:</strong> {form.media?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Service Description</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {form.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {form.packages && form.packages.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Service Packages</Typography>
                      <Grid container spacing={2}>
                        {form.packages.map((pkg, idx) => (
                          <Grid item xs={12} md={4} key={idx}>
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                {pkg.name}
                              </Typography>
                              <Typography variant="h6" color="primary" gutterBottom>
                                ${pkg.price}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {pkg.description}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Additional Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.isFeatured}
                        onChange={(e) => handleChange('isFeatured', e.target.checked)}
                      />
                    }
                    label="Feature this service (appears in featured section)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.isUrgent}
                        onChange={(e) => handleChange('isUrgent', e.target.checked)}
                      />
                    }
                    label="Mark as urgent (fast delivery available)"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const getStepIcon = (step, index) => {
    if (index < activeStep) return <CheckCircle color="success" />;
    if (index === activeStep) return step.icon;
    return step.icon;
  };

  return (
    <Paper sx={{ maxWidth: 1200, mx: 'auto', p: 3, mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {initialData ? 'Edit Service' : 'Create a Professional Service'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Build a compelling service that attracts clients and showcases your expertise
        </Typography>
      </Box>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel 
              icon={getStepIcon(step, index)}
              optional={<Typography variant="caption">{step.description}</Typography>}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <form onSubmit={handleSubmit}>
        {renderStepContent()}
        
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button 
            disabled={activeStep === 0} 
            onClick={handleBack}
            variant="outlined"
            size="large"
          >
            Back
          </Button>
          
          {activeStep < steps.length - 1 ? (
            <Button 
              onClick={handleNext} 
              variant="contained"
              size="large"
              endIcon={<TrendingUp />}
            >
              Next: {steps[activeStep + 1].label}
            </Button>
          ) : (
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
            >
              {submitting ? 'Publishing Service...' : (initialData ? 'Update Service' : 'Publish Service')}
            </Button>
          )}
        </Box>
      </form>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};
