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
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Skeleton,
  Alert,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  ShoppingCart as ShoppingCartIcon,
  Message as MessageIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { axiosi } from '../config/axios';
import { EXPORT_CATEGORIES, getExportSubcategories } from '../config/exportCategories';

const ExportMarketplacePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subcategory: '',
    targetMarket: '',
    minPrice: '',
    maxPrice: '',
    sort: 'createdAt',
    order: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [inquiryDialog, setInquiryDialog] = useState({
    open: false,
    product: null,
    message: '',
    quantity: 1
  });

  // Load products
  useEffect(() => {
    loadProducts();
  }, [filters, pagination.page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await axiosi.get('/export-products', { params });
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading export products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      handleFilterChange('search', event.target.value);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      subcategory: '',
      targetMarket: '',
      minPrice: '',
      maxPrice: '',
      sort: 'createdAt',
      order: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleInquiry = (product) => {
    setInquiryDialog({
      open: true,
      product,
      message: `I am interested in purchasing ${product.title}. Please provide more details about pricing, availability, and shipping to my location.`,
      quantity: product.minimumOrderQuantity || 1
    });
  };

  const submitInquiry = async () => {
    try {
      await axiosi.post(`/export-products/${inquiryDialog.product._id}/inquiry`, {
        message: inquiryDialog.message,
        quantity: inquiryDialog.quantity
      });

      setInquiryDialog({ open: false, product: null, message: '', quantity: 1 });
      // Show success message
      alert('Inquiry sent successfully! The exporter will contact you soon.');
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('Failed to send inquiry. Please try again.');
    }
  };

  const ProductCard = ({ product }) => {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          sx={{
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '1px solid',
            borderColor: theme.palette.divider,
            '&:hover': {
              boxShadow: theme.shadows[8],
              transform: 'translateY(-2px)'
            }
          }}
        >
          {/* Product Image */}
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height={200}
              image={product.images?.[0]?.url || '/placeholder-export.jpg'}
              alt={product.title}
              sx={{ objectFit: 'cover' }}
            />

            {/* Status Badge */}
            <Chip
              label="Export Product"
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                fontWeight: 'bold'
              }}
            />

            {/* Featured Badge */}
            {product.featured && (
              <Chip
                label="Featured"
                color="secondary"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>

          <CardContent sx={{ p: 2 }}>
            {/* Title */}
            <Typography
              variant="h6"
              component="h3"
              sx={{
                mb: 1,
                fontSize: '1.1rem',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3
              }}
            >
              {product.title}
            </Typography>

            {/* Exporter Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                sx={{ width: 24, height: 24, mr: 1 }}
                src={product.exporterInfo?.logo}
              >
                <BusinessIcon sx={{ fontSize: '1rem' }} />
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {product.exporterInfo?.name || 'Exporter'}
              </Typography>
            </Box>

            {/* Price */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${product.wholesalePrice?.toLocaleString()} USD
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                / {product.unit}
              </Typography>
            </Box>

            {/* Minimum Order */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Min Order: {product.minimumOrderQuantity} {product.unit}
            </Typography>

            {/* Target Markets */}
            {product.targetMarkets && product.targetMarkets.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Markets: {product.targetMarkets.slice(0, 2).join(', ')}
                  {product.targetMarkets.length > 2 && '...'}
                </Typography>
              </Box>
            )}

            {/* Category */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Chip
                label={product.category}
                size="small"
                variant="outlined"
                color="primary"
              />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInquiry(product);
                  }}
                  sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  <MessageIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Lead Time */}
            {product.leadTime && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Lead Time: {product.leadTime} days
              </Typography>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            sx={{
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            African Exports & Global Trade
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Discover premium products from African exporters for global trade
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect with verified African exporters and access wholesale products for international markets
          </Typography>
        </motion.div>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search export products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {Object.keys(EXPORT_CATEGORIES).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Subcategory Filter */}
          {filters.category && (
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={filters.subcategory}
                  label="Subcategory"
                  onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="">All Subcategories</MenuItem>
                  {getExportSubcategories(filters.category).map((subcategory) => (
                    <MenuItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Filter Toggle */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ borderRadius: 3, py: 1.5 }}
            >
              {showFilters ? 'Hide Filters' : 'More Filters'}
            </Button>
          </Grid>

          {/* Clear Filters */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="text"
              onClick={clearFilters}
              sx={{ borderRadius: 3, py: 1.5 }}
            >
              Clear All
            </Button>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Min Price (USD)"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Max Price (USD)"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sort}
                    label="Sort By"
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  >
                    <MenuItem value="createdAt">Newest</MenuItem>
                    <MenuItem value="wholesalePrice">Price</MenuItem>
                    <MenuItem value="views">Popularity</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={filters.order}
                    label="Order"
                    onChange={(e) => handleFilterChange('order', e.target.value)}
                  >
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Products Grid */}
      <Box sx={{ mb: 4 }}>
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 12 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={28} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="circular" width={24} height={24} />
                      <Skeleton variant="text" width="30%" height={20} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        )}
      </Box>

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <BusinessIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No export products found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your filters or check back later for new products
          </Typography>
        </Box>
      )}

      {/* Inquiry Dialog */}
      <Dialog
        open={inquiryDialog.open}
        onClose={() => setInquiryDialog({ open: false, product: null, message: '', quantity: 1 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send Inquiry to {inquiryDialog.product?.exporterInfo?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Product: {inquiryDialog.product?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Price: ${inquiryDialog.product?.wholesalePrice} USD per {inquiryDialog.product?.unit}
            </Typography>
          </Box>

          <TextField
            fullWidth
            type="number"
            label="Quantity"
            value={inquiryDialog.quantity}
            onChange={(e) => setInquiryDialog(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
            sx={{ mb: 2 }}
            inputProps={{ min: inquiryDialog.product?.minimumOrderQuantity || 1 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={inquiryDialog.message}
            onChange={(e) => setInquiryDialog(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Tell the exporter about your requirements..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInquiryDialog({ open: false, product: null, message: '', quantity: 1 })}>
            Cancel
          </Button>
          <Button onClick={submitInquiry} variant="contained">
            Send Inquiry
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExportMarketplacePage;