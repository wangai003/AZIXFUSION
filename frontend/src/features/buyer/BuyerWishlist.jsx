import React, { useEffect } from 'react';
import { Box, Typography, Grid, Paper, IconButton, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlistAsync, deleteWishlistItemAsync, selectWishlistItems, selectWishlistStatus, selectWishlistError, selectWishlistActionStatus, selectWishlistActionError } from '../wishlist/WishlistSlice';
import { selectUserInfo } from '../user/UserSlice';

export const BuyerWishlist = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUserInfo);
  const items = useSelector(selectWishlistItems);
  const status = useSelector(selectWishlistStatus);
  const error = useSelector(selectWishlistError);
  const actionStatus = useSelector(selectWishlistActionStatus);
  const actionError = useSelector(selectWishlistActionError);

  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user?._id) dispatch(fetchWishlistAsync(user._id));
  }, [dispatch, user]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Removed from wishlist!', severity: 'success' });
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Action failed', severity: 'error' });
    }
  }, [actionStatus, actionError]);

  const handleDelete = (id) => {
    dispatch(deleteWishlistItemAsync(id));
  };

  if (status === 'pending') return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message || 'Failed to load wishlist'}</Alert>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>Your Wishlist</Typography>
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Paper sx={{ p: 2, position: 'relative' }}>
              <Typography variant="subtitle1">{item.product?.title}</Typography>
              <IconButton onClick={() => handleDelete(item._id)} sx={{ position: 'absolute', top: 8, right: 8 }}><Delete /></IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 