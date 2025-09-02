import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { createServiceRequestAsync, selectServiceRequestActionStatus, selectServiceRequestActionError } from '../features/serviceRequests/ServiceRequestSlice';
import { selectUserInfo } from '../features/user/UserSlice';
import { useNavigate } from 'react-router-dom';

export const ServiceRequestPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUserInfo);
  const actionStatus = useSelector(selectServiceRequestActionStatus);
  const actionError = useSelector(selectServiceRequestActionError);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  React.useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Service request posted successfully!', severity: 'success' });
      setTimeout(() => navigate('/buyer/dashboard'), 2000);
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Failed to post request', severity: 'error' });
    }
  }, [actionStatus, actionError, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createServiceRequestAsync({ ...form, buyer: user._id }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box maxWidth={600} mx="auto" mt={6} p={3}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} mb={3}>Post a Service Request</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Budget"
              name="budget"
              type="number"
              value={form.budget}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Deadline"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              disabled={actionStatus === 'pending'}
            >
              {actionStatus === 'pending' ? <CircularProgress size={24} /> : 'Post Request'}
            </Button>
          </form>
        </Paper>
      </motion.div>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 