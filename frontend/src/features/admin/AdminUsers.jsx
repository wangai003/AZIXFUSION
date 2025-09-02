import React, { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllUsersAsync, deleteUserAsync, selectAdminUsers, selectAdminUsersStatus, selectAdminUsersError, selectAdminUserActionStatus, selectAdminUserActionError, editUserAsync, suspendUserAsync, unsuspendUserAsync } from './AdminSlice';
import { ErrorBoundary } from 'react-error-boundary';
import { axiosi } from '../../config/axios';

export const AdminUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAdminUsers);
  // Ensure users is always an array to prevent "not iterable" errors
  const safeUsers = Array.isArray(users) ? users : [];
  const loading = useSelector(selectAdminUsersStatus) === 'pending';
  const error = useSelector(selectAdminUsersError);
  const actionStatus = useSelector(selectAdminUserActionStatus);
  const actionError = useSelector(selectAdminUserActionError);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sort, setSort] = React.useState('name');
  const [editUser, setEditUser] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ name: '', email: '', roles: [], active: true });
  const [approveDialog, setApproveDialog] = React.useState(null);
  const [rejectDialog, setRejectDialog] = React.useState({ open: false, user: null, reason: '' });

  useEffect(() => {
    dispatch(fetchAllUsersAsync());
  }, [dispatch]);

  useEffect(() => {
    if (actionStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'User deleted!', severity: 'success' });
    } else if (actionStatus === 'rejected') {
      setSnackbar({ open: true, message: actionError?.message || 'Delete failed', severity: 'error' });
    }
  }, [actionStatus, actionError]);

  const handleDelete = (id) => {
    dispatch(deleteUserAsync(id));
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, roles: user.roles, active: user.active });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = () => {
    dispatch(editUserAsync({ id: editUser._id, data: editForm }));
    setSnackbar({ open: true, message: 'User updated!', severity: 'success' });
    setEditUser(null);
  };
  const handleSuspend = (user) => {
    if (user.active) {
      dispatch(suspendUserAsync(user._id));
      setSnackbar({ open: true, message: 'User suspended!', severity: 'info' });
    } else {
      dispatch(unsuspendUserAsync(user._id));
      setSnackbar({ open: true, message: 'User unsuspended!', severity: 'info' });
    }
  };
  const handleApprove = async (user) => {
    try {
      await axiosi.post(`/users/${user._id}/approve-seller`);
      setSnackbar({ open: true, message: 'Seller approved!', severity: 'success' });
      dispatch(fetchAllUsersAsync());
    } catch (err) {
      setSnackbar({ open: true, message: 'Approval failed', severity: 'error' });
    }
  };
  const handleReject = async () => {
    try {
      await axiosi.post(`/users/${rejectDialog.user._id}/reject-seller`, { reason: rejectDialog.reason });
      setSnackbar({ open: true, message: 'Seller rejected.', severity: 'info' });
      setRejectDialog({ open: false, user: null, reason: '' });
      dispatch(fetchAllUsersAsync());
    } catch (err) {
      setSnackbar({ open: true, message: 'Rejection failed', severity: 'error' });
    }
  };

  // Filtering and sorting
  const filteredUsers = safeUsers
    .filter(u => (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())))
    .filter(u => (!roleFilter || u.roles?.includes(roleFilter)))
    .filter(u => (!statusFilter || (statusFilter === 'active' ? u.active : !u.active)))
    .sort((a, b) => a[sort]?.localeCompare(b[sort]));

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message || error}</Alert>;

  return (
    <ErrorBoundary FallbackComponent={({ error }) => <Box color="error.main" p={2}>Error: {error.message}</Box>}>
      <Box>
        <Typography variant="h6" mb={2}>All Users</Typography>
        <Box display="flex" gap={2} mb={2}>
          <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} size="small" />
          <FormControl size="small">
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} label="Role">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="buyer">Buyer</MenuItem>
              <MenuItem value="seller">Seller</MenuItem>
              <MenuItem value="provider">Provider</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
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
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Verification</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow><TableCell colSpan={5}><Box p={2} textAlign="center">No users found.</Box></TableCell></TableRow>
              ) : filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.roles?.join(', ')}</TableCell>
                  <TableCell>{user.active ? 'Active' : 'Suspended'}</TableCell>
                  <TableCell>{user.sellerVerificationStatus}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(user)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleSuspend(user)}>
                      {user.active ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="error" />}
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user._id)}><DeleteIcon /></IconButton>
                    {user.sellerVerificationStatus === 'pending' && (
                      <>
                        <IconButton color="success" onClick={() => handleApprove(user)}><CheckCircleIcon /></IconButton>
                        <IconButton color="error" onClick={() => setRejectDialog({ open: true, user, reason: '' })}><CancelIcon /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <TextField label="Name" name="name" value={editForm.name} onChange={handleEditChange} fullWidth margin="dense" />
            <TextField label="Email" name="email" value={editForm.email} onChange={handleEditChange} fullWidth margin="dense" />
            <FormControl fullWidth margin="dense">
              <InputLabel>Roles</InputLabel>
              <Select name="roles" value={editForm.roles} onChange={handleEditChange} multiple>
                <MenuItem value="buyer">Buyer</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
                <MenuItem value="provider">Provider</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, user: null, reason: '' })}>
          <DialogTitle>Reject Seller Application</DialogTitle>
          <DialogContent>
            <TextField label="Reason for rejection" fullWidth value={rejectDialog.reason} onChange={e => setRejectDialog({ ...rejectDialog, reason: e.target.value })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialog({ open: false, user: null, reason: '' })}>Cancel</Button>
            <Button onClick={handleReject} variant="contained" color="error">Reject</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
}; 