import React, { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllProductsAsync, deleteProductAsync, selectAdminProducts, selectAdminProductsStatus, selectAdminProductsError, selectAdminProductActionStatus, selectAdminProductActionError, editProductAsync, suspendProductAsync, unsuspendProductAsync } from './AdminSlice';
import { selectLoggedInUser } from '../auth/AuthSlice';
import { ErrorBoundary } from 'react-error-boundary';

export const AdminProducts = () => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector(selectLoggedInUser);
  const products = useSelector(selectAdminProducts);
  // Ensure products is always an array to prevent "not iterable" errors
  const safeProducts = Array.isArray(products) ? products : [];
  const loading = useSelector(selectAdminProductsStatus) === 'pending';
  const error = useSelector(selectAdminProductsError);
  const actionStatus = useSelector(selectAdminProductActionStatus);
  const actionError = useSelector(selectAdminProductActionError);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sort, setSort] = React.useState('title');
  const [editProduct, setEditProduct] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ title: '', price: 0, active: true });

  // Check if user is a goods seller (not full admin)
  const isGoodsSeller = loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods' && !loggedInUser?.isAdmin;

  useEffect(() => {
    dispatch(fetchAllProductsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Product updated!', severity: 'success' });
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Action failed', severity: 'error' });
    }
  }, [actionStatus, actionError]);

  const handleEdit = (product) => {
    setEditProduct(product);
    setEditForm({ title: product.title, price: product.price, active: product.active });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = () => {
    dispatch(editProductAsync({ id: editProduct._id, data: editForm }));
    setEditProduct(null);
  };
  const handleSuspend = (product) => {
    if (product.active) {
      dispatch(suspendProductAsync(product._id));
      setSnackbar({ open: true, message: 'Product suspended!', severity: 'info' });
    } else {
      dispatch(unsuspendProductAsync(product._id));
      setSnackbar({ open: true, message: 'Product unsuspended!', severity: 'info' });
    }
  };
  const handleDelete = (id) => {
    dispatch(deleteProductAsync(id));
  };
  
  // Filter products based on user role
  let filteredProducts = safeProducts;
  
  // If goods seller, only show their own products
  if (isGoodsSeller) {
    filteredProducts = safeProducts.filter(product => product.seller === loggedInUser._id);
  }
  
  // Apply search, status, and sort filters
  filteredProducts = filteredProducts
    .filter(p => (!search || p.title.toLowerCase().includes(search.toLowerCase())))
    .filter(p => (!statusFilter || (statusFilter === 'active' ? p.active : !p.active)))
    .sort((a, b) => a[sort]?.toString().localeCompare(b[sort]?.toString()));

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /> </Box>;
  if (error) return <Alert severity="error">{error.message || error}</Alert>;

  return (
    <ErrorBoundary FallbackComponent={({ error }) => <Box color="error.main" p={2}>Error: {error.message}</Box>}>
      <Box>
        <Typography variant="h6" mb={2}>
          {isGoodsSeller ? 'My Products' : 'All Products'}
        </Typography>
        
        {isGoodsSeller && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            You can manage your own products here. Only your products are visible.
          </Typography>
        )}
        
        <Box display="flex" gap={2} mb={2}>
          <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} size="small" />
          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Sort</InputLabel>
            <Select value={sort} onChange={e => setSort(e.target.value)} label="Sort">
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="price">Price</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={4}><Box p={2} textAlign="center">No products found.</Box></TableCell></TableRow>
              ) : filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.title}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.active ? 'Active' : 'Suspended'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(product)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleSuspend(product)}>
                      {product.active ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="error" />}
                    </IconButton>
                    <IconButton onClick={() => handleDelete(product._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Dialog open={!!editProduct} onClose={() => setEditProduct(null)}>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <TextField label="Title" name="title" value={editForm.title} onChange={handleEditChange} fullWidth margin="dense" />
            <TextField label="Price" name="price" value={editForm.price} onChange={handleEditChange} fullWidth margin="dense" type="number" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditProduct(null)}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
}; 