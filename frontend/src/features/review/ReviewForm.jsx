import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Rating, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createReviewAsync, selectReviewActionStatus, selectReviewActionError } from './ReviewSlice';
import { selectUserInfo } from '../user/UserSlice';

export const ReviewForm = ({ productId, serviceId, revieweeId, onSuccess }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUserInfo);
  const actionStatus = useSelector(selectReviewActionStatus);
  const actionError = useSelector(selectReviewActionError);

  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Review submitted!', severity: 'success' });
      setForm({ rating: 5, comment: '' });
      if (onSuccess) onSuccess();
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Failed to submit review', severity: 'error' });
    }
  }, [actionStatus, actionError, onSuccess]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !user._id) {
      setSnackbar({ open: true, message: 'You must be logged in to submit a review.', severity: 'error' });
      return;
    }
    dispatch(createReviewAsync({
      user: user._id,
      product: productId,
      service: serviceId,
      reviewee: revieweeId,
      rating: form.rating,
      comment: form.comment
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} mt={2}>
      <Rating
        name="rating"
        value={form.rating}
        onChange={(_, value) => setForm({ ...form, rating: value })}
        size="large"
      />
      <TextField
        fullWidth
        label="Comment"
        name="comment"
        value={form.comment}
        onChange={e => setForm({ ...form, comment: e.target.value })}
        margin="normal"
        multiline
        rows={3}
        required
      />
      <Button type="submit" variant="contained" disabled={actionStatus === 'pending'}>
        {actionStatus === 'pending' ? <CircularProgress size={20} /> : 'Submit Review'}
      </Button>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 