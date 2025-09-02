import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Button, Grid, CircularProgress, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert, Avatar, Rating } from '@mui/material';
import { axiosi } from '../../config/axios';
import { ReviewForm } from '../../features/review/ReviewForm';
import { useSelector } from 'react-redux';
import { selectLoggedInUser } from '../../features/auth/AuthSlice';
import { fetchLoggedInUserById } from '../../features/user/UserApi';
import { fetchServiceReviews } from '../../features/review/ReviewApi';
import { getOrderByUserId } from '../../features/order/OrderApi';
import { ReviewsList } from '../review/ReviewsList';

const OrderServiceModal = ({ open, onClose, service }) => {
  const [selectedPackage, setSelectedPackage] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const loggedInUser = useSelector(selectLoggedInUser);

  const handleOrder = async () => {
    setSubmitting(true);
    setError('');
    try {
      const orderData = {
        serviceId: service._id,
        serviceTitle: service.title,
        seller: service.provider || service.sellerId,
        buyer: loggedInUser?._id,
        buyerName: loggedInUser?.name,
        package: selectedPackage,
        requirements,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      await axiosi.post('/orders', orderData);
      setSuccess(true);
      onClose();
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSelectedPackage('');
      setRequirements('');
      setSuccess(false);
    }
  }, [open]);

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="order-service-title"
        aria-describedby="order-service-description"
        disableRestoreFocus
        keepMounted={false}
      >
        <DialogTitle id="order-service-title">Order / Request Service</DialogTitle>
        <DialogContent id="order-service-description">
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {service.packages && service.packages.length > 0 && (
            <TextField
              select
              label="Select Package"
              value={selectedPackage}
              onChange={e => setSelectedPackage(e.target.value)}
              fullWidth
              margin="normal"
            >
              {service.packages.map((pkg, idx) => (
                <MenuItem key={idx} value={pkg.name}>{pkg.name} - ${pkg.price}</MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label="Project Requirements"
            value={requirements}
            onChange={e => setRequirements(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={3}
            placeholder="Describe what you need..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleOrder} disabled={submitting || (!requirements)}>
            {submitting ? 'Placing Order...' : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Order placed successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [seller, setSeller] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [sellerError, setSellerError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [canReview, setCanReview] = useState(false);
  const loggedInUser = useSelector(selectLoggedInUser);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await axiosi.get(`/api/services/${id}`);
        setService(res.data);
      } catch (err) {
        setError('Failed to load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  useEffect(() => {
    if (service && (service.provider || service.sellerId)) {
      setSellerLoading(true);
      fetchLoggedInUserById(service.provider || service.sellerId)
        .then(setSeller)
        .catch(() => setSellerError('Failed to load seller info.'))
        .finally(() => setSellerLoading(false));
    }
  }, [service]);

  useEffect(() => {
    if (service && service._id) {
      setReviewsLoading(true);
      fetchServiceReviews(service._id)
        .then(setReviews)
        .catch(() => setReviewsError('Failed to load reviews.'))
        .finally(() => setReviewsLoading(false));
    }
  }, [service]);

  useEffect(() => {
    if (service && loggedInUser?._id) {
      getOrderByUserId(loggedInUser._id)
        .then(orders => {
          const completed = orders.some(order => order.serviceId === service._id && order.status === 'completed');
          setCanReview(completed);
        })
        .catch(() => setCanReview(false));
    }
  }, [service, loggedInUser]);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;
  if (!service) return null;

  return (
    <Card sx={{ maxWidth: 900, m: '2rem auto', p: 2, boxShadow: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {service.images && service.images.length > 0 && (
            <CardMedia
              component="img"
              height="320"
              image={service.images[0]}
              alt={service.title}
              sx={{ borderRadius: 2 }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} gutterBottom>{service.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {service.category}
              {service.subcategory && ` • ${service.subcategory}`}
            </Typography>
            {service.tags && service.tags.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {service.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            )}
            <Typography variant="body1" sx={{ my: 2 }}>{service.description}</Typography>
            
            {/* Service Details */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {service.serviceLevel && (
                <Chip 
                  label={service.serviceLevel} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              )}
              {service.pricingModel && (
                <Chip 
                  label={service.pricingModel} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              )}
              {service.isFeatured && (
                <Chip 
                  label="Featured" 
                  size="small" 
                  color="success" 
                  variant="filled"
                />
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            {service.packages && service.packages.length > 0 ? (
              <>
                <Typography variant="h6">Packages</Typography>
                {service.packages.map((pkg, idx) => (
                  <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography fontWeight={600} variant="h6">{pkg.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {pkg.isPopular && (
                          <Chip label="Popular" size="small" color="warning" variant="filled" />
                        )}
                        {pkg.isRecommended && (
                          <Chip label="Recommended" size="small" color="success" variant="filled" />
                        )}
                      </Box>
                    </Box>
                    <Typography variant="h5" color="primary.main" fontWeight={700} mb={1}>
                      ${pkg.price}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>{pkg.description}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Delivery: {pkg.deliveryTime} days
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Revisions: {pkg.revisions}
                      </Typography>
                    </Box>
                    {pkg.features && pkg.features.length > 0 && (
                      <Box>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">Features:</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {pkg.features.filter(f => f.trim()).map((feature, fIdx) => (
                            <Chip key={fIdx} label={feature} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
              </>
            ) : (
              <Typography variant="h6">Price: ${service.price}</Typography>
            )}
            <Divider sx={{ my: 2 }} />
            {/* Seller Profile Info */}
            <Box display="flex" alignItems="center" mb={2}>
              {sellerLoading ? (
                <CircularProgress size={24} sx={{ mr: 2 }} />
              ) : sellerError ? (
                <Typography color="error">{sellerError}</Typography>
              ) : seller ? (
                <>
                  <Avatar src={seller.avatar || ''} alt={seller.name} sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2">{seller.name}</Typography>
                    <Rating value={seller.rating || 0} precision={0.1} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">{seller.bio || ''}</Typography>
                  </Box>
                </>
              ) : null}
            </Box>
            <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => setOrderOpen(true)}>
              Order / Request Service
            </Button>
          </CardContent>
        </Grid>
      </Grid>
      {/* Requirements Section */}
      {service.requirements && service.requirements.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Requirements</Typography>
          {service.requirements.map((req, idx) => (
            <Box key={idx} mb={2} p={2} sx={{ border: '1px solid #eee', borderRadius: 1 }}>
              <Typography fontWeight={600} gutterBottom>{req.question}</Typography>
              {req.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {req.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={req.type} 
                  size="small" 
                  color={req.required ? "error" : "default"} 
                  variant="outlined"
                />
                {req.required && (
                  <Chip label="Required" size="small" color="error" variant="filled" />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* FAQ Section */}
      {service.faq && service.faq.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>FAQ</Typography>
          {service.faq.map((item, idx) => (
            <Box key={idx} mb={2} p={2} sx={{ border: '1px solid #eee', borderRadius: 1 }}>
              <Typography fontWeight={600} gutterBottom>{item.question}</Typography>
              <Typography variant="body2">{item.answer}</Typography>
              {item.category && (
                <Chip label={item.category} size="small" variant="outlined" sx={{ mt: 1 }} />
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Portfolio Section */}
      {service.portfolio && service.portfolio.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Portfolio</Typography>
          <Grid container spacing={2}>
            {service.portfolio.map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ height: '100%' }}>
                  {item.image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.image}
                      alt={item.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {item.category && (
                        <Chip label={item.category} size="small" variant="outlined" />
                      )}
                      {item.tags && item.tags.map((tag, tagIdx) => (
                        <Chip key={tagIdx} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Reviews Section */}
      <Box mt={4}>
        <Typography variant="h6">Reviews</Typography>
        {canReview && (
          <ReviewForm serviceId={service._id} revieweeId={seller?._id} onSuccess={() => {
            fetchServiceReviews(service._id).then(setReviews);
            setCanReview(false);
          }} />
        )}
        {reviewsLoading ? (
          <CircularProgress size={20} />
        ) : reviewsError ? (
          <Typography color="error">{reviewsError}</Typography>
        ) : reviews.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No reviews yet.</Typography>
        ) : (
          <ReviewsList reviews={reviews} />
        )}
      </Box>
      <OrderServiceModal open={orderOpen} onClose={() => setOrderOpen(false)} service={service} />
    </Card>
  );
};

export default ServiceDetails; 