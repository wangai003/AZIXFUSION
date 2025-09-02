import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Grid, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert, Snackbar, Chip } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSellerServicesAsync, deleteServiceAsync, selectSellerServices, selectSellerServicesStatus, selectSellerServicesError, selectServiceActionStatus, selectServiceActionError } from '../services/ServiceSlice';
import { selectLoggedInUser } from '../auth/AuthSlice';
import { EnhancedServiceForm } from '../services/EnhancedServiceForm';

export const ServiceManagement = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  const services = useSelector(selectSellerServices);
  // Ensure services is always an array to prevent "not iterable" errors
  const safeServices = Array.isArray(services) ? services : [];
  const status = useSelector(selectSellerServicesStatus);
  const error = useSelector(selectSellerServicesError);
  const actionStatus = useSelector(selectServiceActionStatus);
  const actionError = useSelector(selectServiceActionError);

  const [formOpen, setFormOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user?._id) {
      console.log('Fetching services for user:', user._id);
      dispatch(fetchSellerServicesAsync(user._id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Action successful!', severity: 'success' });
      setFormOpen(false);
      setEditService(null);
      if (user?._id) dispatch(fetchSellerServicesAsync(user._id));
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Action failed', severity: 'error' });
    }
  }, [actionStatus, actionError, dispatch, user]);

  const handleAdd = () => {
    console.log('Opening add service form');
    setEditService(null);
    setFormOpen(true);
  };

  const handleEdit = (service) => {
    console.log('Editing service:', service);
    setEditService(service);
    setFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      dispatch(deleteServiceAsync(id));
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditService(null);
  };

  if (status === 'pending') return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message || 'Failed to load services'}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Your Services</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleAdd}
          disabled={!user?._id}
        >
          Add Service
        </Button>
      </Box>

      {safeServices && safeServices.length > 0 ? (
        <Grid container spacing={2}>
          {safeServices.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service._id}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Paper sx={{ p: 2, position: 'relative' }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {service.category}
                    {service.subcategory && ` • ${service.subcategory}`}
                  </Typography>
                  <Typography variant="h6" color="primary.main" mb={1}>
                    ${service.price || (service.packages && service.packages[0]?.price) || '0'}
                  </Typography>
                  {service.tags && service.tags.length > 0 && (
                    <Box mb={1}>
                      {service.tags.slice(0, 3).map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                      {service.tags.length > 3 && (
                        <Chip 
                          label={`+${service.tags.length - 3}`} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      )}
                    </Box>
                  )}
                  <Box mb={1} display="flex" gap={1} flexWrap="wrap">
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
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {service.description}
                  </Typography>
                  <Box position="absolute" top={8} right={8}>
                    <IconButton 
                      onClick={() => handleEdit(service)}
                      size="small"
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(service._id)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No services yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start by adding your first service to attract customers
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleAdd}
            disabled={!user?._id}
          >
            Add Your First Service
          </Button>
        </Box>
      )}

      <Dialog 
        open={formOpen} 
        onClose={handleFormClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { maxHeight: '95vh' }
        }}
      >
        <DialogTitle>
          {editService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <DialogContent>
          <EnhancedServiceForm 
            initialData={editService} 
            onSuccess={() => {
              setSnackbar({ open: true, message: 'Service saved successfully!', severity: 'success' });
              handleFormClose();
              if (user?._id) dispatch(fetchSellerServicesAsync(user._id));
            }} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 