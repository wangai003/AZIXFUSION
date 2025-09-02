import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Rating } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductReviewsAsync, fetchServiceReviewsAsync, fetchUserReviewsAsync, selectProductReviews, selectProductReviewsStatus, selectProductReviewsError, selectServiceReviews, selectServiceReviewsStatus, selectServiceReviewsError, selectUserReviews, selectUserReviewsStatus, selectUserReviewsError } from './ReviewSlice';

export const ReviewsList = ({ productId, serviceId, userId }) => {
  const dispatch = useDispatch();
  const productReviews = useSelector(selectProductReviews);
  const productReviewsStatus = useSelector(selectProductReviewsStatus);
  const productReviewsError = useSelector(selectProductReviewsError);
  const serviceReviews = useSelector(selectServiceReviews);
  const serviceReviewsStatus = useSelector(selectServiceReviewsStatus);
  const serviceReviewsError = useSelector(selectServiceReviewsError);
  const userReviews = useSelector(selectUserReviews);
  const userReviewsStatus = useSelector(selectUserReviewsStatus);
  const userReviewsError = useSelector(selectUserReviewsError);

  useEffect(() => {
    if (productId) dispatch(fetchProductReviewsAsync(productId));
    if (serviceId) dispatch(fetchServiceReviewsAsync(serviceId));
    if (userId) dispatch(fetchUserReviewsAsync(userId));
  }, [dispatch, productId, serviceId, userId]);

  let reviews = [];
  let status = 'idle';
  let error = null;
  if (productId) {
    reviews = productReviews;
    status = productReviewsStatus;
    error = productReviewsError;
  } else if (serviceId) {
    reviews = serviceReviews;
    status = serviceReviewsStatus;
    error = serviceReviewsError;
  } else if (userId) {
    reviews = userReviews;
    status = userReviewsStatus;
    error = userReviewsError;
  }

  if (status === 'pending') return <Box textAlign="center" mt={2}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message || 'Failed to load reviews'}</Alert>;

  return (
    <Box mt={2}>
      <Typography variant="h6" mb={2}>Reviews</Typography>
      {reviews.length === 0 ? (
        <Typography color="textSecondary">No reviews yet.</Typography>
      ) : (
        reviews.map((review) => (
          <Paper key={review._id} sx={{ p: 2, mb: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Rating value={review.rating} readOnly size="small" />
              <Typography ml={2} fontWeight={600}>{review.user?.name}</Typography>
            </Box>
            <Typography>{review.comment}</Typography>
            <Typography variant="caption" color="textSecondary">{new Date(review.createdAt).toLocaleDateString()}</Typography>
          </Paper>
        ))
      )}
    </Box>
  );
}; 