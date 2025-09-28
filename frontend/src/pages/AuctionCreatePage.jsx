import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Gavel as GavelIcon,
  ShoppingCart as ShoppingCartIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createAuction } from '../features/auctions/auctionSlice';
import { axiosi as axios } from '../config/axios';
import { AUCTION_CATEGORIES } from '../config/auctionCategories';

const AuctionCreatePage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Step management
  const [activeStep, setActiveStep] = useState(0);
  const [creationMethod, setCreationMethod] = useState(''); // 'existing' or 'standalone'
  const steps = ['Choose Method', 'Select Item', 'Create Item', 'Configure Auction', 'Review & Create'];

  // State management
  const [userItems, setUserItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Item details for standalone auctions
  const [itemData, setItemData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    images: [],
    videos: [],
    tags: [],
    location: {
      country: 'Kenya',
      city: ''
    },
    shippingInfo: {
      method: 'digital',
      cost: 0,
      estimatedDays: null,
      freeShipping: false
    }
  });

  // Auction form data
  const [auctionData, setAuctionData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    bidIncrement: '1',
    startTime: '',
    endTime: '',
    reservePrice: '',
    buyItNowPrice: '',
    category: '',
    subcategory: ''
  });

  // Fetch user's products and services
  useEffect(() => {
    const fetchUserItems = async () => {
      setLoading(true);
      try {
        // Fetch products
        const productsResponse = await axios.get('/products', {
          params: { user: 'true', limit: 50 }
        });

        // Fetch services
        const servicesResponse = await axios.get('/services');

        // Filter services by provider (assuming current user)
        const userServices = servicesResponse.data.filter(service =>
          service.provider === localStorage.getItem('userId')
        );

        // Combine and format items
        const products = productsResponse.data.data.map(product => ({
          ...product,
          type: 'product',
          displayType: 'Product',
          icon: ShoppingCartIcon,
          image: product.images?.[0]?.url || '/placeholder-product.jpg'
        }));

        const services = userServices.map(service => ({
          ...service,
          type: 'service',
          displayType: 'Service',
          icon: BuildIcon,
          image: service.media?.find(m => m.type === 'image')?.url || '/placeholder-service.jpg'
        }));

        setUserItems([...products, ...services]);
      } catch (error) {
        console.error('Error fetching user items:', error);
        setError('Failed to load your products and services');
      } finally {
        setLoading(false);
      }
    };

    fetchUserItems();
  }, []);

  // Handle creation method selection
  const handleCreationMethodSelect = (method) => {
    setCreationMethod(method);
    if (method === 'existing') {
      setActiveStep(1);
    } else if (method === 'standalone') {
      setActiveStep(2);
    }
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    setSelectedItem(item);

    // Pre-fill auction data
    setAuctionData({
      title: `${item.title} - Auction`,
      description: item.description || '',
      startingPrice: item.price || item.packages?.[0]?.price || '',
      bidIncrement: '1',
      startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // 1 hour from now
      endTime: new Date(Date.now() + 604800000).toISOString().slice(0, 16), // 1 week from now
      reservePrice: '',
      buyItNowPrice: '',
      category: item.category || '',
      subcategory: ''
    });

    setActiveStep(3);
  };

  // Handle item data changes for standalone auctions
  const handleItemDataChange = (field, value) => {
    if (field === 'category') {
      setItemData(prev => ({
        ...prev,
        [field]: value,
        subcategory: '' // Reset subcategory when category changes
      }));
    } else {
      setItemData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle auction form input changes
  const handleAuctionInputChange = (field, value) => {
    setAuctionData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  // Handle image upload for standalone items
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setItemData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setItemData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle tag input
  const handleTagAdd = (tag) => {
    if (tag && !itemData.tags.includes(tag)) {
      setItemData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setItemData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Validate item data for standalone auctions
  const validateItemData = () => {
    if (!itemData.title.trim()) return 'Item title is required';
    if (!itemData.description.trim()) return 'Item description is required';
    if (!itemData.category) return 'Category is required';
    if (itemData.images.length === 0) return 'At least one image is required';
    return null;
  };

  // Validate auction data
  const validateAuctionData = () => {
    if (!auctionData.title.trim()) return 'Auction title is required';
    if (!auctionData.description.trim()) return 'Auction description is required';
    if (!auctionData.startingPrice || parseFloat(auctionData.startingPrice) <= 0) return 'Valid starting price is required';
    if (!auctionData.startTime) return 'Start time is required';
    if (!auctionData.endTime) return 'End time is required';

    const startTime = new Date(auctionData.startTime);
    const endTime = new Date(auctionData.endTime);
    const now = new Date();

    if (startTime <= now) return 'Start time must be in the future';
    if (endTime <= startTime) return 'End time must be after start time';

    if (auctionData.reservePrice && parseFloat(auctionData.reservePrice) <= parseFloat(auctionData.startingPrice)) {
      return 'Reserve price must be higher than starting price';
    }

    if (auctionData.buyItNowPrice && parseFloat(auctionData.buyItNowPrice) <= parseFloat(auctionData.startingPrice)) {
      return 'Buy it now price must be higher than starting price';
    }

    return null;
  };

  // Handle auction creation
  const handleCreateAuction = async () => {
    const validationError = validateAuctionData();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let payload;

      if (creationMethod === 'existing') {
        payload = {
          ...auctionData,
          itemType: selectedItem.type,
          itemId: selectedItem._id,
          startingPrice: parseFloat(auctionData.startingPrice),
          bidIncrement: parseFloat(auctionData.bidIncrement),
          reservePrice: auctionData.reservePrice ? parseFloat(auctionData.reservePrice) : undefined,
          buyItNowPrice: auctionData.buyItNowPrice ? parseFloat(auctionData.buyItNowPrice) : undefined,
          startTime: new Date(auctionData.startTime).toISOString(),
          endTime: new Date(auctionData.endTime).toISOString()
        };
      } else if (creationMethod === 'standalone') {
        payload = {
          ...auctionData,
          ...itemData,
          itemType: 'standalone',
          itemId: null, // No linked item for standalone
          startingPrice: parseFloat(auctionData.startingPrice),
          bidIncrement: parseFloat(auctionData.bidIncrement),
          reservePrice: auctionData.reservePrice ? parseFloat(auctionData.reservePrice) : undefined,
          buyItNowPrice: auctionData.buyItNowPrice ? parseFloat(auctionData.buyItNowPrice) : undefined,
          startTime: new Date(auctionData.startTime).toISOString(),
          endTime: new Date(auctionData.endTime).toISOString()
        };
      }

      await dispatch(createAuction(payload)).unwrap();

      setSuccess(true);
      setTimeout(() => {
        navigate('/auctions');
      }, 2000);

    } catch (error) {
      console.error('Error creating auction:', error);
      setError(error.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (activeStep === 2 && creationMethod === 'standalone') {
      // Validate item data before moving to auction config
      const itemValidationError = validateItemData();
      if (itemValidationError) {
        setError(itemValidationError);
        return;
      }
      // Pre-fill auction data from item data
      setAuctionData(prev => ({
        ...prev,
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        subcategory: itemData.subcategory
      }));
    } else if ((activeStep === 3 && creationMethod === 'standalone') || (activeStep === 1 && creationMethod === 'existing')) {
      // Validate auction data before moving to review
      const validationError = validateAuctionData();
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };


  // Success dialog
  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Dialog open={true} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" color="success.main">
              Auction Created Successfully!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your auction has been created and is now live in the bidding hub.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to the Live Bidding Hub...
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
          onClick={() => navigate('/auctions')}
          variant="outlined"
        >
          Back to Hub
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Create New Auction
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => {
            // Hide steps based on creation method
            if (creationMethod === 'existing' && (index === 2 || index === 0)) return null;
            if (creationMethod === 'standalone' && index === 1) return null;
            if (!creationMethod && index > 0) return null;

            return (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Step 0: Choose Creation Method */}
      {activeStep === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            How would you like to create your auction?
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: creationMethod === 'existing' ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                  borderColor: creationMethod === 'existing' ? theme.palette.primary.main : theme.palette.divider,
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleCreationMethodSelect('existing')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <ShoppingCartIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Use Existing Item
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select from your products or services that you've already created
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: creationMethod === 'standalone' ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                  borderColor: creationMethod === 'standalone' ? theme.palette.primary.main : theme.palette.divider,
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleCreationMethodSelect('standalone')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CreateIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Create from Scratch
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create a completely new item with all details for auction
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Step 1: Select Item (for existing items) */}
      {activeStep === 1 && creationMethod === 'existing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Select a Product or Service to Auction
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : userItems.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                You don't have any products or services to auction yet.
              </Typography>
              <Typography variant="body2">
                Create a product in the admin dashboard or a service to get started.
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {userItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Grid item xs={12} sm={6} md={4} key={item._id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: selectedItem?._id === item._id ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                        borderColor: selectedItem?._id === item._id ? theme.palette.primary.main : theme.palette.divider,
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => handleItemSelect(item)}
                    >
                      <CardMedia
                        component="img"
                        height={140}
                        image={item.image}
                        alt={item.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <IconComponent sx={{ color: 'primary.main' }} />
                          <Chip
                            label={item.displayType}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="h6" component="h3" gutterBottom noWrap>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {item.description}
                        </Typography>
                        {item.price && (
                          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                            ${item.price}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </motion.div>
      )}

      {/* Step 2: Create Item (for standalone auctions) */}
      {activeStep === 2 && creationMethod === 'standalone' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Create Your Item Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Title"
                value={itemData.title}
                onChange={(e) => handleItemDataChange('title', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Item Description"
                value={itemData.description}
                onChange={(e) => handleItemDataChange('description', e.target.value)}
                required
                helperText="Describe your item in detail to attract bidders"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={itemData.category}
                  label="Category"
                  onChange={(e) => handleItemDataChange('category', e.target.value)}
                >
                  {Object.keys(AUCTION_CATEGORIES).map((category) => (
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
                  value={itemData.subcategory}
                  label="Subcategory"
                  onChange={(e) => handleItemDataChange('subcategory', e.target.value)}
                  disabled={!itemData.category}
                >
                  {itemData.category && AUCTION_CATEGORIES[itemData.category]?.map((subcategory) => (
                    <MenuItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Images
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {itemData.images.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <Avatar
                      src={image.url}
                      sx={{ width: 100, height: 100, borderRadius: 2 }}
                      variant="rounded"
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Box
                  component="label"
                  sx={{
                    width: 100,
                    height: 100,
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <AddPhotoIcon sx={{ color: 'primary.main', fontSize: 40 }} />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Upload at least one image. Multiple images allowed.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {itemData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleTagRemove(tag)}
                    size="small"
                  />
                ))}
              </Box>
              <TextField
                fullWidth
                label="Add Tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd(e.target.value);
                    e.target.value = '';
                  }
                }}
                helperText="Press Enter to add tags"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={itemData.location.city}
                onChange={(e) => handleItemDataChange('location', { ...itemData.location, city: e.target.value })}
                helperText="Location where the item is available"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Shipping Method</InputLabel>
                <Select
                  value={itemData.shippingInfo.method}
                  label="Shipping Method"
                  onChange={(e) => handleItemDataChange('shippingInfo', { ...itemData.shippingInfo, method: e.target.value })}
                >
                  <MenuItem value="digital">Digital Delivery</MenuItem>
                  <MenuItem value="pickup">Local Pickup</MenuItem>
                  <MenuItem value="shipping">Shipping</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Step 3: Configure Auction (for existing items) or Step 2: Configure Auction (for standalone) */}
      {((activeStep === 3 && creationMethod === 'standalone') || (activeStep === 1 && creationMethod === 'existing' && selectedItem)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Configure Your Auction
          </Typography>

          <Grid container spacing={4}>
            {/* Item Preview */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height={200}
                  image={
                    creationMethod === 'existing'
                      ? selectedItem.image
                      : itemData.images[0]?.url || '/placeholder-auction.jpg'
                  }
                  alt={
                    creationMethod === 'existing'
                      ? selectedItem.title
                      : itemData.title
                  }
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {creationMethod === 'existing' ? selectedItem.title : itemData.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {creationMethod === 'existing' ? selectedItem.displayType : 'Standalone Item'}
                  </Typography>
                  {creationMethod === 'standalone' && itemData.category && (
                    <Chip label={itemData.category} size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Auction Form */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Auction Title"
                    value={auctionData.title}
                    onChange={(e) => handleAuctionInputChange('title', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={auctionData.description}
                    onChange={(e) => handleAuctionInputChange('description', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Starting Price ($)"
                    value={auctionData.startingPrice}
                    onChange={(e) => handleAuctionInputChange('startingPrice', e.target.value)}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Bid Increment ($)"
                    value={auctionData.bidIncrement}
                    onChange={(e) => handleAuctionInputChange('bidIncrement', e.target.value)}
                    inputProps={{ min: 0.01, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Start Time"
                    value={auctionData.startTime}
                    onChange={(e) => handleAuctionInputChange('startTime', e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="End Time"
                    value={auctionData.endTime}
                    onChange={(e) => handleAuctionInputChange('endTime', e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Reserve Price (Optional)"
                    value={auctionData.reservePrice}
                    onChange={(e) => handleAuctionInputChange('reservePrice', e.target.value)}
                    helperText="Minimum price you're willing to accept"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Buy It Now Price (Optional)"
                    value={auctionData.buyItNowPrice}
                    onChange={(e) => handleAuctionInputChange('buyItNowPrice', e.target.value)}
                    helperText="Instant purchase price"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Step 4: Review & Create (for existing) or Step 3: Review & Create (for standalone) */}
      {((activeStep === 4 && creationMethod === 'standalone') || (activeStep === 2 && creationMethod === 'existing' && selectedItem)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Review Your Auction
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Item Details
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={
                        creationMethod === 'existing'
                          ? selectedItem.image
                          : itemData.images[0]?.url
                      }
                      sx={{ width: 60, height: 60 }}
                    />
                    <Box>
                      <Typography variant="h6">
                        {creationMethod === 'existing' ? selectedItem.title : itemData.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {creationMethod === 'existing' ? selectedItem.displayType : 'Standalone Item'}
                      </Typography>
                      {creationMethod === 'standalone' && itemData.category && (
                        <Chip label={itemData.category} size="small" sx={{ mt: 1 }} />
                      )}
                    </Box>
                  </Box>
                  {creationMethod === 'standalone' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Description:</strong> {itemData.description}
                      </Typography>
                      {itemData.subcategory && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Subcategory:</strong> {itemData.subcategory}
                        </Typography>
                      )}
                      {itemData.tags.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}><strong>Tags:</strong></Typography>
                          {itemData.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Auction Settings
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography><strong>Title:</strong> {auctionData.title}</Typography>
                    <Typography><strong>Starting Price:</strong> ${auctionData.startingPrice}</Typography>
                    <Typography><strong>Bid Increment:</strong> ${auctionData.bidIncrement}</Typography>
                    <Typography><strong>Start Time:</strong> {new Date(auctionData.startTime).toLocaleString()}</Typography>
                    <Typography><strong>End Time:</strong> {new Date(auctionData.endTime).toLocaleString()}</Typography>
                    {auctionData.reservePrice && (
                      <Typography><strong>Reserve Price:</strong> ${auctionData.reservePrice}</Typography>
                    )}
                    {auctionData.buyItNowPrice && (
                      <Typography><strong>Buy It Now:</strong> ${auctionData.buyItNowPrice}</Typography>
                    )}
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
          disabled={
            (creationMethod === 'existing' && activeStep === 1) ||
            (creationMethod === 'standalone' && activeStep === 2) ||
            activeStep === 0
          }
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {((creationMethod === 'existing' && activeStep === 2) || (creationMethod === 'standalone' && activeStep === 4)) ? (
            <Button
              variant="contained"
              onClick={handleCreateAuction}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <GavelIcon />}
              size="large"
            >
              {loading ? 'Creating...' : 'Create Auction'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && !creationMethod) ||
                (activeStep === 1 && creationMethod === 'existing' && !selectedItem) ||
                (activeStep === 2 && creationMethod === 'standalone')
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default AuctionCreatePage;