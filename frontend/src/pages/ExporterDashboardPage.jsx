import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Message as MessageIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { axiosi } from '../config/axios';
import { EXPORT_CATEGORIES } from '../config/exportCategories';

const ExporterDashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    totalInquiries: 0
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form data
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    wholesalePrice: '',
    minimumOrderQuantity: 1,
    unit: 'pieces',
    targetMarkets: [],
    specifications: {},
    packaging: '',
    leadTime: '',
    productionCapacity: ''
  });

  // Load exporter products and stats
  useEffect(() => {
    loadExporterData();
  }, []);

  const loadExporterData = async () => {
    try {
      setLoading(true);
      const [productsResponse, statsResponse] = await Promise.all([
        axiosi.get('/export-products/exporter/products'),
        axiosi.get('/users/exporter/stats') // This endpoint doesn't exist yet, but we can add it
      ]);

      setProducts(productsResponse.data.data || []);
      setStats(statsResponse.data.data || stats);
    } catch (error) {
      console.error('Error loading exporter data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setProductForm({
      title: '',
      description: '',
      category: '',
      subcategory: '',
      wholesalePrice: '',
      minimumOrderQuantity: 1,
      unit: 'pieces',
      targetMarkets: [],
      specifications: {},
      packaging: '',
      leadTime: '',
      productionCapacity: ''
    });
    setCreateDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      wholesalePrice: product.wholesalePrice,
      minimumOrderQuantity: product.minimumOrderQuantity,
      unit: product.unit,
      targetMarkets: product.targetMarkets || [],
      specifications: product.specifications || {},
      packaging: product.packaging || '',
      leadTime: product.leadTime || '',
      productionCapacity: product.productionCapacity || ''
    });
    setEditDialogOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axiosi.delete(`/export-products/${productId}`);
      await loadExporterData();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  };

  const handleSaveProduct = async () => {
    try {
      const payload = {
        ...productForm,
        targetMarkets: productForm.targetMarkets.filter(market => market.trim()),
        specifications: productForm.specifications
      };

      if (selectedProduct) {
        // Update existing product
        await axiosi.put(`/export-products/${selectedProduct._id}`, payload);
      } else {
        // Create new product
        await axiosi.post('/export-products', payload);
      }

      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      setSelectedProduct(null);
      await loadExporterData();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product');
    }
  };

  const handleInputChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setProductForm(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const getSubcategories = (category) => {
    return EXPORT_CATEGORIES[category] || [];
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={28} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Exporter Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your African export products and track performance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateProduct}
          size="large"
        >
          Add Product
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Products
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalProducts}
                  </Typography>
                </Box>
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Products
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.activeProducts}
                  </Typography>
                </Box>
                <ShoppingCartIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Views
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalViews}
                  </Typography>
                </Box>
                <VisibilityIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Inquiries
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalInquiries}
                  </Typography>
                </Box>
                <MessageIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Products Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Export Products
          </Typography>

          {products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BusinessIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start by adding your first export product to reach global buyers
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateProduct}
              >
                Add Your First Product
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Views</TableCell>
                    <TableCell>Inquiries</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={product.images?.[0]?.url}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          >
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {product.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.sku}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{product.category}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.subcategory}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ${product.wholesalePrice}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Min: {product.minimumOrderQuantity} {product.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.status}
                          color={product.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{product.views || 0}</TableCell>
                      <TableCell>{product.inquiries || 0}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditProduct(product)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Product Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          setSelectedProduct(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Create New Export Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Title"
                value={productForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={productForm.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={productForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={productForm.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              >
                {Object.keys(EXPORT_CATEGORIES).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Subcategory"
                value={productForm.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
              >
                {getSubcategories(productForm.category).map((subcategory) => (
                  <MenuItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Wholesale Price (USD)"
                value={productForm.wholesalePrice}
                onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Order Quantity"
                value={productForm.minimumOrderQuantity}
                onChange={(e) => handleInputChange('minimumOrderQuantity', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit"
                value={productForm.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lead Time (days)"
                value={productForm.leadTime}
                onChange={(e) => handleInputChange('leadTime', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Target Markets"
                value={productForm.targetMarkets.join(', ')}
                onChange={(e) => handleArrayInputChange('targetMarkets', e.target.value)}
                helperText="Separate countries/regions with commas"
                placeholder="e.g., Nigeria, South Africa, Europe, Middle East"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Packaging"
                value={productForm.packaging}
                onChange={(e) => handleInputChange('packaging', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              setSelectedProduct(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {selectedProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExporterDashboardPage;