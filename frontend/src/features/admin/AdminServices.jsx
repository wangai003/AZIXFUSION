import React, { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllServicesAsync, deleteServiceAsync, selectAdminServices, selectAdminServicesStatus, selectAdminServicesError, selectAdminServiceActionStatus, selectAdminServiceActionError, editServiceAsync, suspendServiceAsync, unsuspendServiceAsync } from './AdminSlice';

export const AdminServices = () => {
  const dispatch = useDispatch();
  const services = useSelector(selectAdminServices);
  // Ensure services is always an array to prevent "not iterable" errors
  const safeServices = Array.isArray(services) ? services : [];
  const loading = useSelector(selectAdminServicesStatus) === 'pending';
  const error = useSelector(selectAdminServicesError);
  const actionStatus = useSelector(selectAdminServiceActionStatus);
  const actionError = useSelector(selectAdminServiceActionError);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sort, setSort] = React.useState('title');
  const [editService, setEditService] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ title: '', price: 0, isActive: true });

  useEffect(() => {
    dispatch(fetchAllServicesAsync());
  }, [dispatch]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Service updated!', severity: 'success' });
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Action failed', severity: 'error' });
    }
  }, [actionStatus, actionError]);

  const handleEdit = (service) => {
    setEditService(service);
    setEditForm({ title: service.title, price: service.price, isActive: service.isActive });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = () => {
    dispatch(editServiceAsync({ id: editService._id, data: editForm }));
    setEditService(null);
  };
  const handleSuspend = (service) => {
    if (service.isActive) {
      dispatch(suspendServiceAsync(service._id));
      setSnackbar({ open: true, message: 'Service suspended!', severity: 'info' });
    } else {
      dispatch(unsuspendServiceAsync(service._id));
      setSnackbar({ open: true, message: 'Service unsuspended!', severity: 'info' });
    }
  };
  const handleDelete = (id) => {
    dispatch(deleteServiceAsync(id));
  };
  const filteredServices = safeServices
    .filter(s => (!search || s.title.toLowerCase().includes(search.toLowerCase())))
    .filter(s => (!statusFilter || (statusFilter === 'active' ? s.isActive : !s.isActive)))
    .sort((a, b) => a[sort]?.toString().localeCompare(b[sort]?.toString()));

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /> </Box>;
  if (error) return <Alert severity="error">{error.message || error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>All Services</Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} size="small" />
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
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="price">Price</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredServices.map((service) => (
              <TableRow key={service._id}>
                <TableCell>{service.title}</TableCell>
                <TableCell>${service.price}</TableCell>
                <TableCell>{service.isActive ? 'Active' : 'Suspended'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(service)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleSuspend(service)}>
                    {service.isActive ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="error" />}
                  </IconButton>
                  <IconButton onClick={() => handleDelete(service._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!editService} onClose={() => setEditService(null)}>
        <DialogTitle>Edit Service</DialogTitle>
        <DialogContent>
          <TextField label="Title" name="title" value={editForm.title} onChange={handleEditChange} fullWidth margin="dense" />
          <TextField label="Price" name="price" value={editForm.price} onChange={handleEditChange} fullWidth margin="dense" type="number" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditService(null)}>Cancel</Button>
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