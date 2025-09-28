import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllServicesAsync, selectAllServices, selectAllServicesStatus, selectSearchResults, selectSearchStatus } from './ServiceSlice';
import { Card, CardContent, CardMedia, Typography, Grid, CircularProgress, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  return (
    <Card sx={{ maxWidth: 345, m: 2, cursor: 'pointer', boxShadow: 3 }} onClick={() => navigate(`/services/${service._id}`)}>
      {service.images && service.images.length > 0 && (
        <CardMedia
          component="img"
          height="180"
          image={service.images[0]}
          alt={service.title}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {service.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {service.description?.slice(0, 60)}...
        </Typography>
        <Typography variant="subtitle2" color="primary" mt={1}>
          From ${service.price || (service.packages && service.packages[0]?.price) || 'N/A'}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {service.subcategory && (
            <Chip 
              label={service.subcategory} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
          )}
          {service.serviceLevel && (
            <Chip 
              label={service.serviceLevel} 
              size="small" 
              variant="outlined" 
              color="secondary"
            />
          )}
          {service.isFeatured && (
            <Chip 
              label="Featured" 
              size="small" 
              variant="filled" 
              color="success"
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Seller: {service.sellerName || service.provider || 'Unknown'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export const ServiceList = ({ services: propServices, status: propStatus, showLoading = true }) => {
  const dispatch = useDispatch();
  const defaultServices = useSelector(selectAllServices);
  const defaultStatus = useSelector(selectAllServicesStatus);

  // Use props if provided, otherwise use default from Redux
  const services = propServices || defaultServices;
  const status = propStatus || defaultStatus;

  useEffect(() => {
    // Only fetch if no services are provided via props
    if (!propServices && dispatch) {
      dispatch(fetchAllServicesAsync());
    }
  }, [dispatch, propServices]);

  if (showLoading && status === 'pending') {
    return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  }

  if (!services || services.length === 0) {
    return <Typography variant="h6" align="center" mt={4}>No services found.</Typography>;
  }

  return (
    <Grid container justifyContent="center">
      {services.map(service => (
        <Grid item key={service._id} xs={12} sm={6} md={4} lg={3}>
          <ServiceCard service={service} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ServiceList; 