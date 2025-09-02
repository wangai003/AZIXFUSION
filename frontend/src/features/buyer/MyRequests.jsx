import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchServiceRequestsAsync, fetchApplicationsAsync, updateApplicationAsync, selectServiceRequests, selectServiceRequestsStatus, selectServiceRequestsError, selectApplications, selectApplicationsStatus, selectApplicationsError, selectApplicationActionStatus, selectApplicationActionError } from '../serviceRequests/ServiceRequestSlice';
import { selectUserInfo } from '../user/UserSlice';

export const MyRequests = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUserInfo);
  const requests = useSelector(selectServiceRequests);
  const requestsStatus = useSelector(selectServiceRequestsStatus);
  const requestsError = useSelector(selectServiceRequestsError);
  const applications = useSelector(selectApplications);
  const applicationsStatus = useSelector(selectApplicationsStatus);
  const applicationsError = useSelector(selectApplicationsError);
  const actionStatus = useSelector(selectApplicationActionStatus);
  const actionError = useSelector(selectApplicationActionError);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user?._id) dispatch(fetchServiceRequestsAsync({ buyer: user._id }));
  }, [dispatch, user]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Action successful!', severity: 'success' });
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Action failed', severity: 'error' });
    }
  }, [actionStatus, actionError]);

  const handleView = (request) => {
    setSelectedRequest(request);
    dispatch(fetchApplicationsAsync(request._id));
  };
  const handleClose = () => setSelectedRequest(null);
  const handleHire = (applicationId) => {
    dispatch(updateApplicationAsync({ id: applicationId, data: { status: 'accepted' } }));
  };

  if (requestsStatus === 'pending') return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (requestsError) return <Alert severity="error">{requestsError.message || 'Failed to load requests'}</Alert>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>My Service Requests</Typography>
      <Grid container spacing={2}>
        {requests.map((request) => (
          <Grid item xs={12} md={6} key={request._id}>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1">{request.title}</Typography>
                <Typography variant="body2">Status: {request.status}</Typography>
                <Typography variant="body2">Budget: ${request.budget}</Typography>
              </Box>
              <Button variant="outlined" onClick={() => handleView(request)}>View</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog 
        open={!!selectedRequest} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        aria-labelledby="request-details-title"
        aria-describedby="request-details-description"
        disableRestoreFocus
        keepMounted={false}
      >
        <DialogTitle id="request-details-title">Request Details & Applications</DialogTitle>
        <DialogContent id="request-details-description">
          {selectedRequest && (
            <>
              <Typography variant="h6">{selectedRequest.title}</Typography>
              <Typography>{selectedRequest.description}</Typography>
              <Typography variant="body2">Budget: ${selectedRequest.budget}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Applications</Typography>
              {applicationsStatus === 'pending' ? <CircularProgress /> :
                applicationsError ? <Alert severity="error">{applicationsError.message || 'Failed to load applications'}</Alert> :
                  applications.map((app) => (
                    <Paper key={app._id} sx={{ p: 2, mt: 1 }}>
                      <Typography variant="subtitle1">{app.provider?.name}</Typography>
                      <Typography variant="body2">{app.proposal}</Typography>
                      <Typography variant="body2">Bid: ${app.bid}</Typography>
                      {app.status === 'pending' && (
                        <Button variant="contained" onClick={() => handleHire(app._id)} sx={{ mt: 1 }}>
                          Hire
                        </Button>
                      )}
                    </Paper>
                  ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
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