import React, { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllServiceRequestsAsync, deleteServiceRequestAsync, selectAdminServiceRequests, selectAdminServiceRequestsStatus, selectAdminServiceRequestsError, selectAdminServiceRequestActionStatus, selectAdminServiceRequestActionError, editServiceRequestAsync } from './AdminSlice';

export const AdminServiceRequests = () => {
  const dispatch = useDispatch();
  const requests = useSelector(selectAdminServiceRequests);
  // Ensure requests is always an array to prevent "not iterable" errors
  const safeRequests = Array.isArray(requests) ? requests : [];
  const loading = useSelector(selectAdminServiceRequestsStatus) === 'pending';
  const error = useSelector(selectAdminServiceRequestsError);
  const actionStatus = useSelector(selectAdminServiceRequestActionStatus);
  const actionError = useSelector(selectAdminServiceRequestActionError);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sort, setSort] = React.useState('status');
  const [editRequest, setEditRequest] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ status: '' });

  useEffect(() => {
    dispatch(fetchAllServiceRequestsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Service request updated!', severity: 'success' });
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Action failed', severity: 'error' });
    }
  }, [actionStatus, actionError]);

  const handleEdit = (request) => {
    setEditRequest(request);
    setEditForm({ status: request.status });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = () => {
    dispatch(editServiceRequestAsync({ id: editRequest._id, data: editForm }));
    setEditRequest(null);
  };
  const handleDelete = (id) => {
    dispatch(deleteServiceRequestAsync(id));
  };
  const filteredRequests = safeRequests
    .filter(r => (!search || r.title.toLowerCase().includes(search.toLowerCase())))
    .filter(r => (!statusFilter || r.status === statusFilter))
    .sort((a, b) => a[sort]?.toString().localeCompare(b[sort]?.toString()));

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /> </Box>;
  if (error) return <Alert severity="error">{error.message || error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>All Service Requests</Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField label="Search by Title" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Status">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="hired">Hired</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Sort</InputLabel>
          <Select value={sort} onChange={e => setSort(e.target.value)} label="Sort">
            <MenuItem value="status">Status</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>{request.title}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(request)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(request._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!editRequest} onClose={() => setEditRequest(null)}>
        <DialogTitle>Edit Service Request Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={editForm.status} onChange={handleEditChange} label="Status">
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
              <MenuItem value="hired">Hired</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRequest(null)}>Cancel</Button>
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