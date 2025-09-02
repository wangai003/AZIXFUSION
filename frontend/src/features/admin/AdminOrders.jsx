import React, { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllOrdersAsync, deleteOrderAsync, selectAdminOrders, selectAdminOrdersStatus, selectAdminOrdersError, selectAdminOrderActionStatus, selectAdminOrderActionError, editOrderAsync } from './AdminSlice';

export const AdminOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectAdminOrders);
  // Ensure orders is always an array to prevent "not iterable" errors
  const safeOrders = Array.isArray(orders) ? orders : [];
  const loading = useSelector(selectAdminOrdersStatus) === 'pending';
  const error = useSelector(selectAdminOrdersError);
  const actionStatus = useSelector(selectAdminOrderActionStatus);
  const actionError = useSelector(selectAdminOrderActionError);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sort, setSort] = React.useState('status');
  const [editOrder, setEditOrder] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ status: '' });

  useEffect(() => {
    dispatch(fetchAllOrdersAsync());
  }, [dispatch]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Order updated!', severity: 'success' });
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Action failed', severity: 'error' });
    }
  }, [actionStatus, actionError]);

  const handleEdit = (order) => {
    setEditOrder(order);
    setEditForm({ status: order.status });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = () => {
    dispatch(editOrderAsync({ id: editOrder._id, data: editForm }));
    setEditOrder(null);
  };
  const handleDelete = (id) => {
    dispatch(deleteOrderAsync(id));
  };
  const filteredOrders = safeOrders
    .filter(o => (!search || o.user?.toLowerCase?.().includes(search.toLowerCase())))
    .filter(o => (!statusFilter || o.status === statusFilter))
    .sort((a, b) => a[sort]?.toString().localeCompare(b[sort]?.toString()));

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /> </Box>;
  if (error) return <Alert severity="error">{error.message || error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>All Orders</Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField label="Search by User" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Status">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Sort</InputLabel>
          <Select value={sort} onChange={e => setSort(e.target.value)} label="Sort">
            <MenuItem value="status">Status</MenuItem>
            <MenuItem value="total">Total</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.user?.name || order.user}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(order)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(order._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!editOrder} onClose={() => setEditOrder(null)}>
        <DialogTitle>Edit Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={editForm.status} onChange={handleEditChange} label="Status">
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOrder(null)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 