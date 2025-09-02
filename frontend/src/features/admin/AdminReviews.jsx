import React, { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllReviewsAsync, deleteReviewAsync, selectAdminReviews, selectAdminReviewsStatus, selectAdminReviewsError, selectAdminReviewActionStatus, selectAdminReviewActionError, editReviewAsync, suspendReviewAsync, unsuspendReviewAsync } from './AdminSlice';
import { selectLoggedInUser } from '../auth/AuthSlice';

export const AdminReviews = () => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector(selectLoggedInUser);
  const reviews = useSelector(selectAdminReviews);
  // Ensure reviews is always an array to prevent "not iterable" errors
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const loading = useSelector(selectAdminReviewsStatus) === 'pending';
  const error = useSelector(selectAdminReviewsError);
  const actionStatus = useSelector(selectAdminReviewActionStatus);
  const actionError = useSelector(selectAdminReviewActionError);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sort, setSort] = React.useState('rating');
  const [editReview, setEditReview] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ comment: '', rating: 0 });

  // Check if user is a goods seller (not full admin)
  const isGoodsSeller = loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods' && !loggedInUser?.isAdmin;

  useEffect(() => {
    dispatch(fetchAllReviewsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Review updated!', severity: 'success' });
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Action failed', severity: 'error' });
    }
  }, [actionStatus, actionError]);

  const handleEdit = (review) => {
    setEditReview(review);
    setEditForm({ comment: review.comment, rating: review.rating });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = () => {
    dispatch(editReviewAsync({ id: editReview._id, data: editForm }));
    setEditReview(null);
  };
  const handleSuspend = (review) => {
    if (review.active) {
      dispatch(suspendReviewAsync(review._id));
      setSnackbar({ open: true, message: 'Review suspended!', severity: 'info' });
    } else {
      dispatch(unsuspendReviewAsync(review._id));
      setSnackbar({ open: true, message: 'Review unsuspended!', severity: 'info' });
    }
  };
  const handleDelete = (id) => {
    dispatch(deleteReviewAsync(id));
  };
  
  // Filter reviews based on user role
  let filteredReviews = safeReviews;
  
  // If goods seller, only show reviews for their products
  if (isGoodsSeller) {
    filteredReviews = safeReviews.filter(review => review.product?.seller === loggedInUser._id);
  }
  
  // Apply search, status, and sort filters
  filteredReviews = filteredReviews
    .filter(r => (!search || r.comment.toLowerCase().includes(search.toLowerCase())))
    .filter(r => (!statusFilter || (statusFilter === 'active' ? r.active : !r.active)))
    .sort((a, b) => a[sort]?.toString().localeCompare(b[sort]?.toString()));

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /> </Box>;
  if (error) return <Alert severity="error">{error.message || error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        {isGoodsSeller ? 'Reviews for My Products' : 'All Reviews'}
      </Typography>
      
      {isGoodsSeller && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          You can view and manage reviews for your products here. Only reviews for your products are visible.
        </Typography>
      )}
      
      <Box display="flex" gap={2} mb={2}>
        <TextField label="Search by Comment" value={search} onChange={e => setSearch(e.target.value)} size="small" />
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
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="comment">Comment</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review._id}>
                <TableCell>{review.user?.name || review.user}</TableCell>
                <TableCell>{review.comment}</TableCell>
                <TableCell>{review.rating}</TableCell>
                <TableCell>{review.active ? 'Active' : 'Suspended'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(review)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleSuspend(review)}>
                    {review.active ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="error" />}
                  </IconButton>
                  <IconButton onClick={() => handleDelete(review._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!editReview} onClose={() => setEditReview(null)}>
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent>
          <TextField label="Comment" name="comment" value={editForm.comment} onChange={handleEditChange} fullWidth margin="dense" />
          <TextField label="Rating" name="rating" value={editForm.rating} onChange={handleEditChange} fullWidth margin="dense" type="number" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditReview(null)}>Cancel</Button>
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