import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Grid, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  CircularProgress, 
  Alert, 
  Snackbar, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Visibility, 
  Search,
  FilterList,
  Sort,
  ToggleOn,
  ToggleOff,
  Star,
  LocalOffer,
  GridView,
  TableChart
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchSellerProductsAsync, 
  addProductAsync, 
  updateProductAsync, 
  deleteProductAsync, 
  selectSellerProducts, 
  selectSellerProductsStatus, 
  selectSellerProductsError, 
  selectProductActionStatus, 
  selectProductActionError 
} from '../products/ProductSlice';
import { selectLoggedInUser } from '../auth/AuthSlice';
import { SellerProductForm } from './SellerProductForm';

export const ProductManagement = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  console.log('🔍 ProductManagement - User from Redux:', user);
  console.log('🔍 ProductManagement - User ID:', user?._id);
  console.log('🔍 ProductManagement - User roles:', user?.roles);
  console.log('🔍 ProductManagement - User seller type:', user?.sellerType);
  const products = useSelector(selectSellerProducts);
  // Ensure products is always an array to prevent "not iterable" errors
  const safeProducts = Array.isArray(products) ? products : [];
  
  // Debug logging
  console.log('🔍 ProductManagement - Redux products:', products);
  console.log('🔍 ProductManagement - Safe products count:', safeProducts.length);
  const status = useSelector(selectSellerProductsStatus) || 'idle';
  const error = useSelector(selectSellerProductsError);
  const actionStatus = useSelector(selectProductActionStatus) || 'idle';
  const actionError = useSelector(selectProductActionError);

  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Enhanced state for admin-style features
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [quickEditProduct, setQuickEditProduct] = useState(null);
  const [quickEditForm, setQuickEditForm] = useState({ title: '', price: 0, stockQuantity: 0, isActive: true });

  useEffect(() => {
    if (user?._id) {
      console.log('🔍 ProductManagement - Fetching products for user:', user._id);
      dispatch(fetchSellerProductsAsync(user._id));
    } else {
      console.log('🔍 ProductManagement - No user ID available:', user);
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Action successful!', severity: 'success' });
      setOpen(false);
      setEditProduct(null);
      setQuickEditProduct(null);
      if (user?._id) dispatch(fetchSellerProductsAsync(user._id));
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Action failed', severity: 'error' });
    }
  }, [actionStatus, actionError, dispatch, user]);

  const handleAdd = () => {
    console.log('Opening add product form');
    setEditProduct(null);
    setOpen(true);
  };

  const handleEdit = (product) => {
    console.log('Editing product:', product);
    setEditProduct(product);
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProductAsync(id));
    }
  };

  const handleFormClose = () => {
    setOpen(false);
    setEditProduct(null);
  };

  // Enhanced admin-style functions
  const handleQuickEdit = (product) => {
    setQuickEditProduct(product);
    setQuickEditForm({ 
      title: product.title, 
      price: product.basePrice || product.price || 0, 
      stockQuantity: product.stockQuantity || 0,
      isActive: product.isActive !== false
    });
  };

  const handleQuickEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuickEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuickEditSave = () => {
    if (quickEditProduct) {
      const updateData = {
        title: quickEditForm.title,
        basePrice: parseFloat(quickEditForm.price),
        stockQuantity: parseInt(quickEditForm.stockQuantity),
        isActive: quickEditForm.isActive
      };
      dispatch(updateProductAsync({ id: quickEditProduct._id, data: updateData }));
    }
  };

  const handleToggleStatus = (product) => {
    const newStatus = !product.isActive;
    dispatch(updateProductAsync({ 
      id: product._id, 
      data: { isActive: newStatus } 
    }));
  };

  const handleToggleFeatured = (product) => {
    const newFeatured = !product.isFeatured;
    dispatch(updateProductAsync({ 
      id: product._id, 
      data: { isFeatured: newFeatured } 
    }));
  };

  const handleToggleOnSale = (product) => {
    const newOnSale = !product.isOnSale;
    dispatch(updateProductAsync({ 
      id: product._id, 
      data: { isOnSale: newOnSale } 
    }));
  };

  // Filtering and sorting logic
  const filteredAndSortedProducts = safeProducts
    .filter(product => {
      const matchesSearch = !search || 
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = !statusFilter || 
        (statusFilter === 'active' ? product.isActive !== false : !product.isActive);
      
      const matchesCategory = !categoryFilter || 
        product.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle nested properties
      if (sortBy === 'price') {
        aValue = a.basePrice || a.price || 0;
        bValue = b.basePrice || b.price || 0;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (status === 'pending') return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message || 'Failed to load products'}</Alert>;

  return (
    <Box>
      {/* Header with controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Your Products</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleAdd}
          disabled={!user?._id}
        >
          Add Product
        </Button>
      </Box>

      {/* Enhanced Controls Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* View Mode Toggle */}
          <Grid item>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridView />
              </ToggleButton>
              <ToggleButton value="table">
                <TableChart />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Search */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                {Array.from(new Set(safeProducts.map(p => p.category).filter(Boolean))).map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Controls */}
          <Grid item xs={12} sm={3}>
            <Box display="flex" gap={1}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="stockQuantity">Stock</MenuItem>
                  <MenuItem value="createdAt">Date Added</MenuItem>
                </Select>
              </FormControl>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                startIcon={<Sort />}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Display */}
      {filteredAndSortedProducts.length > 0 ? (
        viewMode === 'table' ? (
          // Table View (Admin-style)
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        {product.thumbnail && (
                          <img 
                            src={product.thumbnail} 
                            alt={product.title}
                            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                          />
                        )}
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {product.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.category || 'No category'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        ${product.basePrice || product.price || '0'}
                      </Typography>
                      {product.discountPercentage > 0 && (
                        <Chip 
                          label={`${product.discountPercentage}% OFF`} 
                          color="error" 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'} 
                        color={product.stockQuantity > 0 ? 'success' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Chip 
                          label={product.isActive !== false ? 'Active' : 'Inactive'} 
                          color={product.isActive !== false ? 'success' : 'default'} 
                          size="small" 
                        />
                        {product.isFeatured && (
                          <Chip 
                            icon={<Star />} 
                            label="Featured" 
                            color="warning" 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                        {product.isOnSale && (
                          <Chip 
                            icon={<LocalOffer />} 
                            label="On Sale" 
                            color="error" 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Quick Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuickEdit(product)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Full Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(product)}
                            color="secondary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={product.isActive !== false ? 'Deactivate' : 'Activate'}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleStatus(product)}
                            color={product.isActive !== false ? 'warning' : 'success'}
                          >
                            {product.isActive !== false ? <ToggleOn /> : <ToggleOff />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(product._id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Grid View (Original)
          <Grid container spacing={3}>
            {filteredAndSortedProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Paper sx={{ p: 2, position: 'relative', height: '100%' }}>
                    {/* Product Image */}
                    {product.thumbnail && (
                      <Box mb={2} textAlign="center">
                        <img 
                          src={product.thumbnail} 
                          alt={product.title}
                          style={{ 
                            width: '100%', 
                            height: 200, 
                            objectFit: 'cover', 
                            borderRadius: 8 
                          }} 
                        />
                      </Box>
                    )}
                    
                    {/* Product Info */}
                    <Typography variant="h6" fontWeight={600} mb={1} sx={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '3rem'
                    }}>
                      {product.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      SKU: {product.sku || 'N/A'}
                    </Typography>
                    
                    <Typography variant="h5" color="primary.main" fontWeight={600} mb={1}>
                      ${product.basePrice || product.price || '0'}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Chip 
                        label={product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'} 
                        color={product.stockQuantity > 0 ? 'success' : 'error'} 
                        size="small" 
                      />
                      {product.category && (
                        <Chip 
                          label={product.category} 
                          variant="outlined" 
                          size="small" 
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '4rem'
                    }}>
                      {product.description}
                    </Typography>
                    
                    {/* Action Buttons */}
                    <Box position="absolute" top={8} right={8} display="flex" gap={1}>
                      <IconButton 
                        onClick={() => handleEdit(product)}
                        size="small"
                        color="primary"
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(product._id)}
                        size="small"
                        color="error"
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        <Box textAlign="center" py={6}>
          <Typography variant="h5" color="text.secondary" mb={2}>
            {search || statusFilter || categoryFilter ? 'No products match your filters' : 'No products yet'}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            {search || statusFilter || categoryFilter 
              ? 'Try adjusting your search criteria or filters'
              : 'Start building your product catalog to attract customers and grow your business'
            }
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<Add />} 
            onClick={handleAdd}
            disabled={!user?._id}
          >
            Add Your First Product
          </Button>
        </Box>
      )}

      {/* Product Form Dialog */}
      <Dialog 
        open={open} 
        onClose={handleFormClose} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: { maxHeight: '95vh' }
        }}
      >
        <DialogTitle>
          {editProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <SellerProductForm 
            initialData={editProduct} 
            onSuccess={() => {
              setSnackbar({ open: true, message: 'Product saved successfully!', severity: 'success' });
              handleFormClose();
              if (user?._id) dispatch(fetchSellerProductsAsync(user._id));
            }}
            onCancel={handleFormClose}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Quick Edit Dialog */}
      <Dialog 
        open={!!quickEditProduct} 
        onClose={() => setQuickEditProduct(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Quick Edit Product</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={quickEditForm.title}
                  onChange={handleQuickEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={quickEditForm.price}
                  onChange={handleQuickEditChange}
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  name="stockQuantity"
                  type="number"
                  value={quickEditForm.stockQuantity}
                  onChange={handleQuickEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={quickEditForm.isActive}
                      onChange={handleQuickEditChange}
                    />
                  }
                  label="Product Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickEditProduct(null)}>Cancel</Button>
          <Button onClick={handleQuickEditSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
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
    </Box>
  );
}; 