import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
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
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { axiosi } from '../config/axios';
import { EXPERIENCE_CATEGORIES } from '../config/experienceCategories';

const ExperienceCreatePage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Step management
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Basic Info', 'Details & Pricing', 'Media & Review'];

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form data
  const [experienceData, setExperienceData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    difficulty: 'moderate',
    duration: '',
    basePrice: '',
    pricingType: 'per_person',
    minParticipants: '1',
    maxParticipants: '10',
    location: {
      city: '',
      country: 'Kenya',
      address: '',
      coordinates: null,
      meetingPoint: ''
    },
    whatToBring: '',
    requirements: '',
    itinerary: '',
    included: '',
    notIncluded: '',
    languages: ['English'],
    isActive: true
  });

  // Media state
  const [imageUrls, setImageUrls] = useState(['', '', '', '']);
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setExperienceData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setExperienceData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (index, url) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  // Set featured image
  const setAsFeatured = (index) => {
    setFeaturedImageIndex(index);
  };

  // Validate form data
  const validateForm = () => {
    if (!experienceData.title.trim()) return 'Title is required';
    if (!experienceData.description.trim()) return 'Description is required';
    if (!experienceData.category) return 'Category is required';
    if (!experienceData.basePrice || parseFloat(experienceData.basePrice) <= 0) return 'Valid base price is required';
    if (!experienceData.duration || parseFloat(experienceData.duration) <= 0) return 'Valid duration is required';
    if (!experienceData.location.city.trim()) return 'Location city is required';
    if (!imageUrls[0].trim()) return 'At least one image URL is required';
    return null;
  };

  // Handle experience creation
  const handleCreateExperience = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data
      const payload = {
        ...experienceData,
        images: imageUrls.filter(url => url.trim() !== ''),
        featuredImageIndex,
        // Convert string fields to arrays where expected
        whatToBring: experienceData.whatToBring ? experienceData.whatToBring.split('\n').filter(item => item.trim()) : [],
        requirements: experienceData.requirements ? experienceData.requirements.split('\n').filter(item => item.trim()) : [],
        itinerary: experienceData.itinerary ? experienceData.itinerary.split('\n').filter(item => item.trim()) : [],
        included: experienceData.included ? experienceData.included.split('\n').filter(item => item.trim()) : [],
        notIncluded: experienceData.notIncluded ? experienceData.notIncluded.split('\n').filter(item => item.trim()) : []
      };

      const response = await axiosi.post('/experiences', payload);

      setSuccess(true);
      setTimeout(() => {
        navigate('/host/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error creating experience:', error);
      setError(error.response?.data?.message || 'Failed to create experience');
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (activeStep === 1) {
      const basicValidation = !experienceData.title.trim() || !experienceData.description.trim() || !experienceData.category;
      if (basicValidation) {
        setError('Please fill in all required basic information');
        return;
      }
    }
    setActiveStep(prev => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  // Success dialog
  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Dialog open={true} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" color="success.main">
              Experience Created Successfully!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your experience has been submitted for review. You'll be notified once it's approved and published.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to your dashboard...
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
          onClick={() => navigate('/host/dashboard')}
          variant="outlined"
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Create New Experience
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

      {/* Step 1: Basic Info */}
      {activeStep === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Basic Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Experience Title"
                value={experienceData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                helperText="Give your experience a catchy, descriptive title"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={experienceData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                helperText="Describe what participants will do and what makes this experience special"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={experienceData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {Object.keys(EXPERIENCE_CATEGORIES).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={experienceData.subcategory}
                  label="Subcategory"
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  disabled={!experienceData.category}
                >
                  {experienceData.category && EXPERIENCE_CATEGORIES[experienceData.category]?.map((sub) => (
                    <MenuItem key={sub} value={sub}>
                      {sub}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={experienceData.difficulty}
                  label="Difficulty Level"
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="challenging">Challenging</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Duration (hours)"
                value={experienceData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                required
                inputProps={{ min: 0.5, step: 0.5 }}
              />
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Step 2: Details & Pricing */}
      {activeStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Details & Pricing
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Base Price ($)"
                value={experienceData.basePrice}
                onChange={(e) => handleInputChange('basePrice', e.target.value)}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Pricing Type</InputLabel>
                <Select
                  value={experienceData.pricingType}
                  label="Pricing Type"
                  onChange={(e) => handleInputChange('pricingType', e.target.value)}
                >
                  <MenuItem value="per_person">Per Person</MenuItem>
                  <MenuItem value="fixed_group">Fixed Group Price</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Participants"
                value={experienceData.minParticipants}
                onChange={(e) => handleInputChange('minParticipants', e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Participants"
                value={experienceData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={experienceData.location.city}
                onChange={(e) => handleInputChange('location.city', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={experienceData.location.country}
                onChange={(e) => handleInputChange('location.country', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Point"
                value={experienceData.location.meetingPoint}
                onChange={(e) => handleInputChange('location.meetingPoint', e.target.value)}
                helperText="Where will participants meet for the experience?"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="What to Bring"
                value={experienceData.whatToBring}
                onChange={(e) => handleInputChange('whatToBring', e.target.value)}
                helperText="What should participants bring with them? (one item per line)"
                placeholder="Comfortable walking shoes&#10;Sunscreen&#10;Water bottle"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Requirements"
                value={experienceData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                helperText="Any special requirements or prerequisites? (one item per line)"
                placeholder="Minimum age 18&#10;Good physical fitness&#10;No allergies to local foods"
              />
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Step 3: Media & Review */}
      {activeStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Media & Final Review
          </Typography>

          <Grid container spacing={4}>
            {/* Image URLs */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Experience Images
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Enter image URLs for your experience. The first image will be used as the main thumbnail.
                  </Typography>

                  {imageUrls.map((url, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label={`Image ${index + 1} URL${index === 0 ? ' (Required)' : ' (Optional)'}`}
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        helperText={
                          index === featuredImageIndex
                            ? "This is the featured image"
                            : (
                              <Button
                                size="small"
                                onClick={() => setAsFeatured(index)}
                                disabled={!url.trim()}
                                sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem' }}
                              >
                                Set as Featured
                              </Button>
                            )
                        }
                      />
                      {url && (
                        <Box
                          component="img"
                          src={url}
                          sx={{
                            width: '100%',
                            maxHeight: 150,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mt: 1,
                            border: featuredImageIndex === index ? '2px solid' : '1px solid',
                            borderColor: featuredImageIndex === index ? 'primary.main' : 'divider'
                          }}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg'; // Fallback image
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Review */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Review Your Experience
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography><strong>Title:</strong> {experienceData.title}</Typography>
                    <Typography><strong>Category:</strong> {experienceData.category}</Typography>
                    <Typography><strong>Price:</strong> ${experienceData.basePrice} {experienceData.pricingType === 'per_person' ? 'per person' : 'per group'}</Typography>
                    <Typography><strong>Duration:</strong> {experienceData.duration} hours</Typography>
                    <Typography><strong>Location:</strong> {experienceData.location.city}, {experienceData.location.country}</Typography>
                    <Typography><strong>Images:</strong> {imageUrls.filter(url => url.trim()).length} URLs provided</Typography>
                  </Box>
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
              onClick={handleCreateExperience}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              size="large"
            >
              {loading ? 'Creating...' : 'Create Experience'}
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
    </Container>
  );
};

export default ExperienceCreatePage;