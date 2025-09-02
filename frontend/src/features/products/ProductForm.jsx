import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Card,
  CardMedia,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCategories,
  fetchMainCategories,
  fetchSubcategories,
  fetchElements,
  selectMainCategories,
  selectSubcategoriesByParent,
  selectElementsBySubcategory
} from '../../categories/CategoriesSlice';
import { fetchAllBrandsAsync, selectBrands } from '../brands/BrandSlice';
import { addProductAsync, updateProductAsync, selectProductActionStatus, selectProductActionError } from './ProductSlice';
import { selectLoggedInUser } from '../auth/AuthSlice';
import { CategorySelector } from './components/CategorySelector';

const steps = [
  'Basic Information',
  'Pricing & Inventory',
  'Categories & Branding',
  'Media & Images',
  'Specifications',
  'Shipping & Returns',
  'SEO & Marketing',
  'Review & Submit'
];

const initialForm = {
  // Basic Information
  title: '',
  description: '',
  productType: 'physical', // Only physical or digital - removed 'service' option
  sku: '',
  
  // Pricing & Inventory
  price: '',
  discountPercentage: '',
  stockQuantity: '',
  minOrderQuantity: '',
  maxOrderQuantity: '',
  
  // Categories & Branding
  category: '',
  subcategory: '',
  element: '',
  brand: '',
  tags: [],
  
  // Media & Images
  thumbnail: '',
  images: [],
  
  // Specifications
  weight: '',
  dimensions: {
    length: '',
    width: '',
    height: ''
  },
  color: '',
  material: '',
  warranty: '',
  
  // Shipping & Returns
  shippingWeight: '',
  shippingDimensions: {
    length: '',
    width: '',
    height: ''
  },
  returnPolicy: '',
  shippingPolicy: '',
  
  // SEO & Marketing
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  
  // Advanced Options
  isActive: true,
  isFeatured: false,
  isOnSale: false,
  saleEndDate: '',
  
  // Additional Fields
  features: [],
  specifications: [],
  requirements: [],
  faq: []
};

export const ProductForm = ({ open, onClose, editProduct = null }) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const mainCategories = useSelector(selectMainCategories);
  const subcategoriesByParent = useSelector(selectSubcategoriesByParent);
  const elementsBySubcategory = useSelector(selectElementsBySubcategory);
  const brands = useSelector(selectBrands);
  const actionStatus = useSelector(selectProductActionStatus);
  const actionError = useSelector(selectProductActionError);
  const loggedInUser = useSelector(selectLoggedInUser);
  
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMainCategories());
    dispatch(fetchAllBrandsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: editProduct ? 'Product updated successfully!' : 'Product created successfully!', severity: 'success' });
      onClose();
      setForm(initialForm);
      setActiveStep(0);
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Operation failed', severity: 'error' });
    }
  }, [actionStatus, actionError, editProduct, onClose]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Handle hierarchical category changes
    if (field === 'category') {
      // Reset subcategory and element when main category changes
      setForm(prev => ({
        ...prev,
        subcategory: '',
        element: ''
      }));
      // Fetch subcategories for the selected category
      if (value) {
        dispatch(fetchSubcategories(value));
      }
    } else if (field === 'subcategory') {
      // Reset element when subcategory changes
      setForm(prev => ({
        ...prev,
        element: ''
      }));
      // Fetch elements for the selected subcategory
      if (value) {
        dispatch(fetchElements(value));
      }
    }
  };

  const handleNestedChange = (parentField, childField, value) => {
    setForm(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field, defaultValue = '') => {
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (activeStep) {
      case 0: // Basic Information
        if (!form.title.trim()) newErrors.title = 'Title is required';
        if (!form.description.trim()) newErrors.description = 'Description is required';
        if (!form.productType) newErrors.productType = 'Product type is required';
        break;
        
      case 1: // Pricing & Inventory
        if (!form.price || form.price <= 0) newErrors.price = 'Valid price is required';
        if (!form.stockQuantity || form.stockQuantity < 0) newErrors.stockQuantity = 'Valid stock quantity is required';
        break;
        
      case 2: // Categories & Branding
        if (!form.category) newErrors.category = 'Category is required';
        if (!form.brand) newErrors.brand = 'Brand is required';
        break;
        
      case 3: // Media & Images
        if (!form.thumbnail.trim()) newErrors.thumbnail = 'Thumbnail image is required';
        if (form.images.length === 0) newErrors.images = 'At least one product image is required';
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.price || form.price <= 0) newErrors.price = 'Valid price is required';
    if (!form.stockQuantity || form.stockQuantity < 0) newErrors.stockQuantity = 'Valid stock quantity is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.brand) newErrors.brand = 'Brand is required';
    if (!form.thumbnail.trim()) newErrors.thumbnail = 'Thumbnail image is required';
    if (form.images.length === 0) newErrors.images = 'At least one product image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Clean up form data
      const cleanedForm = {
        ...form,
        // Remove empty arrays and strings
        tags: form.tags.filter(tag => tag.trim()),
        features: form.features.filter(feature => feature.trim()),
        specifications: form.specifications.filter(spec => spec.trim()),
        requirements: form.requirements.filter(req => req.trim()),
        faq: form.faq.filter(faq => faq.trim()),
        images: form.images.filter(img => img.trim()),
        
        // Add metadata
        seller: loggedInUser._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        
        // Ensure productType is only physical or digital
        productType: form.productType === 'service' ? 'physical' : form.productType
      };

      // Remove empty fields
      Object.keys(cleanedForm).forEach(key => {
        if (cleanedForm[key] === '' || cleanedForm[key] === null || cleanedForm[key] === undefined) {
          delete cleanedForm[key];
        }
      });

      console.log('Submitting product data:', cleanedForm);

      if (editProduct) {
        await dispatch(updateProductAsync({ id: editProduct._id, data: cleanedForm })).unwrap();
      } else {
        await dispatch(addProductAsync(cleanedForm)).unwrap();
      }
      
    } catch (error) {
      console.error('Error submitting product:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to submit product', 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Title *"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description *"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.productType}>
                  <InputLabel>Product Type *</InputLabel>
                  <Select
                    value={form.productType}
                    onChange={(e) => handleChange('productType', e.target.value)}
                    label="Product Type *"
                  >
                    <MenuItem value="physical">Physical Product</MenuItem>
                    <MenuItem value="digital">Digital Product</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  value={form.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="Stock Keeping Unit"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Pricing & Inventory</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price *"
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                  error={!!errors.price}
                  helperText={errors.price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Discount Percentage"
                  type="number"
                  value={form.discountPercentage}
                  onChange={(e) => handleChange('discountPercentage', parseFloat(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock Quantity *"
                  type="number"
                  value={form.stockQuantity}
                  onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value))}
                  error={!!errors.stockQuantity}
                  helperText={errors.stockQuantity}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Order Quantity"
                  type="number"
                  value={form.minOrderQuantity}
                  onChange={(e) => handleChange('minOrderQuantity', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Order Quantity"
                  type="number"
                  value={form.maxOrderQuantity}
                  onChange={(e) => handleChange('maxOrderQuantity', parseInt(e.target.value))}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Categories & Branding</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CategorySelector
                  value={{
                    category: form.category,
                    subcategory: form.subcategory,
                    element: form.element
                  }}
                  onChange={(categoryData) => {
                    setForm(prev => ({
                      ...prev,
                      category: categoryData.category,
                      subcategory: categoryData.subcategory,
                      element: categoryData.element
                    }));
                  }}
                  error={errors.category}
                  helperText="Select the appropriate category, subcategory, and element for your product"
                  required={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.brand}>
                  <InputLabel>Brand *</InputLabel>
                  <Select
                    value={form.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    label="Brand *"
                  >
                    {brands && brands.map((brand) => (
                      <MenuItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tags"
                  value={form.tags.join(', ')}
                  onChange={(e) => handleChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  placeholder="Enter tags separated by commas"
                  helperText="Tags help customers find your product"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Media & Images</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Thumbnail Image URL *"
                  value={form.thumbnail}
                  onChange={(e) => handleChange('thumbnail', e.target.value)}
                  error={!!errors.thumbnail}
                  helperText={errors.thumbnail || "Main product image (URL only)"}
                  placeholder="https://example.com/image.jpg"
                  required
                />
                {form.thumbnail && (
                  <Box mt={2}>
                    <Card sx={{ maxWidth: 200 }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={form.thumbnail}
                        alt="Thumbnail preview"
                        sx={{ objectFit: 'cover' }}
                      />
                    </Card>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Product Images *</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {form.images.map((image, index) => (
                    <Box key={index} display="flex" gap={1} alignItems="center">
                      <TextField
                        fullWidth
                        label={`Image ${index + 1} URL`}
                        value={image}
                        onChange={(e) => handleArrayChange('images', index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        error={!!errors.images}
                      />
                      <IconButton 
                        onClick={() => removeArrayItem('images', index)}
                        color="error"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addArrayItem('images', '')}
                  >
                    Add Image
                  </Button>
                </Box>
                {errors.images && (
                  <Alert severity="error" sx={{ mt: 1 }}>{errors.images}</Alert>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Specifications</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={form.weight}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  value={form.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Material"
                  value={form.material}
                  onChange={(e) => handleChange('material', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Warranty"
                  value={form.warranty}
                  onChange={(e) => handleChange('warranty', e.target.value)}
                  placeholder="e.g., 1 year"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Dimensions (cm)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Length"
                      type="number"
                      value={form.dimensions.length}
                      onChange={(e) => handleNestedChange('dimensions', 'length', parseFloat(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Width"
                      type="number"
                      value={form.dimensions.width}
                      onChange={(e) => handleNestedChange('dimensions', 'width', parseFloat(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Height"
                      type="number"
                      value={form.dimensions.height}
                      onChange={(e) => handleNestedChange('dimensions', 'height', parseFloat(e.target.value))}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Shipping & Returns</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Shipping Weight (kg)"
                  type="number"
                  value={form.shippingWeight}
                  onChange={(e) => handleChange('shippingWeight', parseFloat(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Shipping Dimensions (cm)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Length"
                      type="number"
                      value={form.shippingDimensions.length}
                      onChange={(e) => handleNestedChange('shippingDimensions', 'length', parseFloat(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Width"
                      type="number"
                      value={form.shippingDimensions.width}
                      onChange={(e) => handleNestedChange('shippingDimensions', 'width', parseFloat(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Height"
                      type="number"
                      value={form.shippingDimensions.height}
                      onChange={(e) => handleNestedChange('shippingDimensions', 'height', parseFloat(e.target.value))}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Return Policy"
                  value={form.returnPolicy}
                  onChange={(e) => handleChange('returnPolicy', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Describe your return policy..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Shipping Policy"
                  value={form.shippingPolicy}
                  onChange={(e) => handleChange('shippingPolicy', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Describe your shipping policy..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 6:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>SEO & Marketing</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Title"
                  value={form.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  placeholder="SEO title for search engines"
                  helperText="Leave empty to use product title"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Description"
                  value={form.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="SEO description for search engines"
                  helperText="Leave empty to use product description"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Keywords"
                  value={form.keywords}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  placeholder="SEO keywords separated by commas"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Marketing Options</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.isFeatured}
                          onChange={(e) => handleChange('isFeatured', e.target.checked)}
                        />
                      }
                      label="Featured Product"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.isOnSale}
                          onChange={(e) => handleChange('isOnSale', e.target.checked)}
                        />
                      }
                      label="On Sale"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.isActive}
                          onChange={(e) => handleChange('isActive', e.target.checked)}
                        />
                      }
                      label="Active"
                    />
                  </Grid>
                </Grid>
              </Grid>
              {form.isOnSale && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sale End Date"
                    type="date"
                    value={form.saleEndDate}
                    onChange={(e) => handleChange('saleEndDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 7:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review & Submit</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Product Summary</Typography>
                <Card sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Title</Typography>
                      <Typography variant="body1">{form.title || 'Not specified'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Chip 
                        label={form.productType === 'physical' ? 'Physical Product' : 'Digital Product'} 
                        color="primary" 
                        size="small" 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Price</Typography>
                      <Typography variant="body1">${form.price || 'Not specified'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Stock</Typography>
                      <Typography variant="body1">{form.stockQuantity || 'Not specified'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Typography variant="body1">
                        {categories && form.category ? 
                          categories.find(cat => cat._id === form.category)?.name || 'Not specified' : 
                          'Not specified'
                        }
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Brand</Typography>
                      <Typography variant="body1">
                        {brands && form.brand ? 
                          brands.find(brand => brand._id === form.brand)?.name || 'Not specified' : 
                          'Not specified'
                        }
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Images</Typography>
                <Grid container spacing={2}>
                  {form.thumbnail && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="140"
                          image={form.thumbnail}
                          alt="Thumbnail"
                          sx={{ objectFit: 'cover' }}
                        />
                        <Box p={1}>
                          <Typography variant="caption" color="text.secondary">Thumbnail</Typography>
                        </Box>
                      </Card>
                    </Grid>
                  )}
                  {form.images.filter(img => img.trim()).map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="140"
                          image={image}
                          alt={`Product ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        <Box p={1}>
                          <Typography variant="caption" color="text.secondary">Image {index + 1}</Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Please review all information before submitting. You can go back to any step to make changes.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Submitting...' : (editProduct ? 'Update Product' : 'Create Product')}
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
      </Box>

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            minWidth: 300
          }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      )}
    </>
  );
};
