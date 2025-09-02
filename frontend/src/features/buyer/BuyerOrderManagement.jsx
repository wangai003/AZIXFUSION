import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBuyerOrdersAsync, selectBuyerOrders, selectBuyerOrdersStatus, selectBuyerOrdersError } from '../order/OrderSlice';
import { selectUserInfo } from '../user/UserSlice';

export const BuyerOrderManagement = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUserInfo);
  const orders = useSelector(selectBuyerOrders);
  const status = useSelector(selectBuyerOrdersStatus);
  const error = useSelector(selectBuyerOrdersError);

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user?._id) dispatch(fetchBuyerOrdersAsync(user._id));
  }, [dispatch, user]);

  const handleView = (order) => setSelectedOrder(order);
  const handleClose = () => setSelectedOrder(null);

  if (status === 'pending') return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message || 'Failed to load orders'}</Alert>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>Your Orders</Typography>
      <Grid container spacing={2}>
        {orders.map((order) => (
          <Grid item xs={12} md={6} key={order._id}>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1">{order.items?.map(i => i.product?.title || i.service?.title).join(', ')}</Typography>
                <Typography variant="body2">Status: {order.status}</Typography>
              </Box>
              <Button variant="outlined" onClick={() => handleView(order)}>View</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog open={!!selectedOrder} onClose={handleClose}>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <Typography>Items: {selectedOrder.items?.map(i => i.product?.title || i.service?.title).join(', ')}</Typography>
              <Typography>Status: {selectedOrder.status}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 