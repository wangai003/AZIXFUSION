import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchServiceRequestsAsync, createApplicationAsync, selectServiceRequests, selectServiceRequestsStatus, selectServiceRequestsError, selectApplicationActionStatus, selectApplicationActionError } from '../serviceRequests/ServiceRequestSlice';
import { selectUserInfo } from '../user/UserSlice';

export const ServiceRequestsList = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUserInfo);
  const requests = useSelector(selectServiceRequests);
  const status = useSelector(selectServiceRequestsStatus);
  const error = useSelector(selectServiceRequestsError);
  const actionStatus = useSelector(selectApplicationActionStatus);
  const actionError = useSelector(selectApplicationActionError);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form, setForm] = useState({ proposal: '', bid: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchServiceRequestsAsync({ status: 'open' }));
  }, [dispatch]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Application submitted successfully!', severity: 'success' });
      setSelectedRequest(null);
      setForm({ proposal: '', bid: '' });
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Failed to submit application', severity: 'error' });
    }
  }, [actionStatus, actionError]);

  const handleView = (request) => {
    setSelectedRequest(request);
    setForm({ proposal: '', bid: '' });
  };
  const handleClose = () => setSelectedRequest(null);
  const handleApply = () => {
    if (selectedRequest) {
      dispatch(createApplicationAsync({ id: selectedRequest._id, data: { ...form, provider: user._id } }));
    }
  };

  if (status === 'pending') return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message || 'Failed to load requests'}</Alert>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>Open Service Requests</Typography>
      <Grid container spacing={2}>
        {requests.map((request) => (
          <Grid item xs={12} md={6} key={request._id}>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1">{request.title}</Typography>
                <Typography variant="body2">Budget: ${request.budget}</Typography>
                <Typography variant="body2">Category: {request.category}</Typography>
              </Box>
              <Button variant="outlined" onClick={() => handleView(request)}>Apply</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog 
        open={!!selectedRequest} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        aria-labelledby="service-request-title"
        aria-describedby="service-request-description"
        disableRestoreFocus
        keepMounted={false}
      >
        <DialogTitle id="service-request-title">Apply for Service Request</DialogTitle>
        <DialogContent id="service-request-description">
          {selectedRequest && (
            <>
              <Typography variant="h6">{selectedRequest.title}</Typography>
              <Typography>{selectedRequest.description}</Typography>
              <Typography variant="body2">Budget: ${selectedRequest.budget}</Typography>
              <TextField
                fullWidth
                label="Proposal"
                multiline
                rows={4}
                value={form.proposal}
                onChange={(e) => setForm({ ...form, proposal: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Bid Amount"
                type="number"
                value={form.bid}
                onChange={(e) => setForm({ ...form, bid: e.target.value })}
                margin="normal"
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleApply} variant="contained" disabled={actionStatus === 'pending'}>
            {actionStatus === 'pending' ? <CircularProgress size={20} /> : 'Submit Application'}
          </Button>
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