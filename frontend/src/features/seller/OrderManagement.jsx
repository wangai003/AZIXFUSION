import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSellerOrdersAsync, updateOrderStatusAsync, selectSellerOrders, selectSellerOrdersStatus, selectSellerOrdersError, selectOrderActionStatus, selectOrderActionError } from '../order/OrderSlice';
import { selectUserInfo } from '../user/UserSlice';

export const OrderManagement = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUserInfo);
  const orders = useSelector(selectSellerOrders);
  // Ensure orders is always an array to prevent "not iterable" errors
  const safeOrders = Array.isArray(orders) ? orders : [];
  const status = useSelector(selectSellerOrdersStatus);
  const error = useSelector(selectSellerOrdersError);
  const actionStatus = useSelector(selectOrderActionStatus);
  const actionError = useSelector(selectOrderActionError);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user?._id) dispatch(fetchSellerOrdersAsync(user._id));
  }, [dispatch, user]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Order updated!', severity: 'success' });
      setSelectedOrder(null);
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Action failed', severity: 'error' });
    }
  }, [actionStatus, actionError]);

  const handleView = (order) => setSelectedOrder(order);
  const handleClose = () => setSelectedOrder(null);
  const handleMarkCompleted = () => {
    if (selectedOrder) {
      dispatch(updateOrderStatusAsync({ id: selectedOrder._id, data: { status: 'completed' } }));
    }
  };

  if (status === 'pending') return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message || 'Failed to load orders'}</Alert>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>Your Orders</Typography>
      <Grid container spacing={2}>
        {safeOrders.map((order) => (
          <Grid item xs={12} md={6} key={order._id}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1">{order.items?.map(i => i.product?.title || i.service?.title).join(', ')}</Typography>
                  <Typography variant="body2">Buyer: {order.user}</Typography>
                  <Typography variant="body2">Status: {order.status}</Typography>
                </Box>
                <Button variant="outlined" onClick={() => handleView(order)}>View</Button>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      <Dialog open={!!selectedOrder} onClose={handleClose}>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <Typography>Items: {selectedOrder.items?.map(i => i.product?.title || i.service?.title).join(', ')}</Typography>
              <Typography>Buyer: {selectedOrder.user}</Typography>
              <Typography>Status: {selectedOrder.status}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {selectedOrder && selectedOrder.status !== 'completed' && (
            <Button onClick={handleMarkCompleted} variant="contained" disabled={actionStatus === 'pending'}>{actionStatus === 'pending' ? <CircularProgress size={20} /> : 'Mark as Completed'}</Button>
          )}
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