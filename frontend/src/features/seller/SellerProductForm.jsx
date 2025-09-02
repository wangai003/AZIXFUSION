import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardMedia,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCategories,
  fetchMainCategories,
  fetchSubcategories,
  fetchElements,
  selectCategories,
  selectMainCategories,
  selectSubcategoriesByParent,
  selectElementsBySubcategory
} from '../categories/CategoriesSlice';
import { fetchAllBrandsAsync, selectBrands } from '../brands/BrandSlice';
import { addProductAsync, updateProductAsync, selectProductActionStatus, selectProductActionError } from '../products/ProductSlice';
import { selectLoggedInUser } from '../auth/AuthSlice';

const initialForm = {
  // Basic Information
  title: '',
  description: '',
  productType: 'physical',
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
  images: ['', '', '', ''], // Fixed 4 images like admin form
  
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
  
  // Advanced Options
  isActive: true,
  isFeatured: false,
  isOnSale: false,
  saleEndDate: ''
};

export const SellerProductForm = ({ initialData = null, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const mainCategories = useSelector(selectMainCategories);
  const subcategoriesByParent = useSelector(selectSubcategoriesByParent);
  const elementsBySubcategory = useSelector(selectElementsBySubcategory);
  const brands = useSelector(selectBrands);
  const actionStatus = useSelector(selectProductActionStatus);
  const actionError = useSelector(selectProductActionError);
  const loggedInUser = useSelector(selectLoggedInUser);
  
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMainCategories());
    dispatch(fetchAllBrandsAsync());
    
    if (initialData) {
      setForm({
        ...initialForm,
        ...initialData,
        // Ensure images array has 4 elements
        images: [
          initialData.images?.[0] || '',
          initialData.images?.[1] || '',
          initialData.images?.[2] || '',
          initialData.images?.[3] || ''
        ]
      });
    }
  }, [dispatch, initialData]);

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
    if (form.images.filter(img => img.trim()).length === 0) newErrors.images = 'At least one product image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Clean up form data and ensure field compatibility
      const cleanedForm = {
        ...form,
        // Ensure price field is properly named and typed
        price: parseFloat(form.price) || 0,
        
        // Ensure stock quantity is a number
        stockQuantity: parseInt(form.stockQuantity) || 0,
        
        // Remove empty arrays and strings
        tags: form.tags.filter(tag => tag.trim()),
        images: form.images.filter(img => img.trim()),
        
        // Add metadata
        seller: loggedInUser._id,
        creatorId: loggedInUser._id, // CRITICAL: This is what the backend uses to filter user products
        creatorName: loggedInUser.name || loggedInUser.username || 'Unknown',
        creatorType: 'goods_seller',
        isGoodsSellerProduct: true, // CRITICAL: This identifies goods seller products
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        
        // Ensure these fields exist for buyer compatibility
        isActive: form.isActive !== undefined ? form.isActive : true,
        isFeatured: form.isFeatured || false,
        isOnSale: form.isOnSale || false
      };

      // Remove empty fields
      Object.keys(cleanedForm).forEach(key => {
        if (cleanedForm[key] === '' || cleanedForm[key] === null || cleanedForm[key] === undefined) {
          delete cleanedForm[key];
        }
      });

      console.log('Submitting product data:', cleanedForm);

      if (initialData) {
        await dispatch(updateProductAsync({ id: initialData._id, data: cleanedForm })).unwrap();
      } else {
        await dispatch(addProductAsync(cleanedForm)).unwrap();
      }
      
      onSuccess();
      
    } catch (error) {
      console.error('Error submitting product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        {initialData ? 'Edit Product' : 'Add New Product'}
      </Typography>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Basic Information
          </Typography>
        </Grid>
        
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
          <TextField
            fullWidth
            label="SKU"
            value={form.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="Stock Keeping Unit"
          />
        </Grid>

        {/* Pricing & Inventory */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
            Pricing & Inventory
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Price *"
            type="number"
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
            error={!!errors.price}
            helperText={errors.price}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Discount Percentage"
            type="number"
            value={form.discountPercentage}
            onChange={(e) => handleChange('discountPercentage', e.target.value)}
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
            onChange={(e) => handleChange('stockQuantity', e.target.value)}
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
            onChange={(e) => handleChange('minOrderQuantity', e.target.value)}
          />
        </Grid>

        {/* Categories & Branding */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
            Categories & Branding
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>Main Category *</InputLabel>
            <Select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              label="Main Category *"
            >
              {mainCategories && mainCategories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Subcategory</InputLabel>
            <Select
              value={form.subcategory}
              onChange={(e) => handleChange('subcategory', e.target.value)}
              label="Subcategory"
              disabled={!form.category}
            >
              <MenuItem value="">
                <em>Select a main category first</em>
              </MenuItem>
              {form.category && subcategoriesByParent[form.category] && 
                subcategoriesByParent[form.category].map((subcat) => (
                  <MenuItem key={subcat._id} value={subcat._id}>
                    {subcat.name}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Element</InputLabel>
            <Select
              value={form.element}
              onChange={(e) => handleChange('element', e.target.value)}
              label="Element"
              disabled={!form.subcategory}
            >
              <MenuItem value="">
                <em>Select a subcategory first</em>
              </MenuItem>
              {form.subcategory && elementsBySubcategory[form.subcategory] && 
                elementsBySubcategory[form.subcategory].map((elem) => (
                  <MenuItem key={elem._id} value={elem._id}>
                    {elem.name}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
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
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tags"
            value={form.tags.join(', ')}
            onChange={(e) => handleChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
            placeholder="Enter tags separated by commas"
            helperText="Tags help customers find your product"
          />
        </Grid>

        {/* Media & Images */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
            Media & Images
          </Typography>
        </Grid>
        
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
          <Grid container spacing={2}>
            {form.images.map((image, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    fullWidth
                    label={`Image ${index + 1} URL`}
                    value={image}
                    onChange={(e) => handleArrayChange('images', index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    error={!!errors.images}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
          {errors.images && (
            <Alert severity="error" sx={{ mt: 1 }}>{errors.images}</Alert>
          )}
        </Grid>

        {/* Specifications */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
            Specifications
          </Typography>
        </Grid>
        
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

        {/* Advanced Options */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
            Advanced Options
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
            }
            label="Product Active"
          />
        </Grid>
        
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

      {/* Action Buttons */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
        </Button>
      </Box>

      {/* Error Display */}
      {actionError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {actionError.message || 'An error occurred while saving the product'}
        </Alert>
      )}
    </Box>
  );
};
