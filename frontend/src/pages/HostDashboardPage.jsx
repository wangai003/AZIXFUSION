import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { axiosi } from '../config/axios';

const HostDashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalExperiences: 0,
    activeExperiences: 0,
    totalBookings: 0,
    averageRating: 0,
    verificationStatus: 'pending'
  });

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchHostData();
  }, []);

  const fetchHostData = async () => {
    try {
      setLoading(true);

      // Fetch host experiences
      const experiencesResponse = await axiosi.get('/experiences/host/experiences');
      setExperiences(experiencesResponse.data.data);

      // Calculate stats
      const totalExperiences = experiencesResponse.data.data.length;
      const activeExperiences = experiencesResponse.data.data.filter(exp => exp.isActive && exp.verificationStatus === 'verified').length;
      const totalBookings = experiencesResponse.data.data.reduce((sum, exp) => sum + (exp.totalBookings || 0), 0);
      const averageRating = totalExperiences > 0 ?
        experiencesResponse.data.data.reduce((sum, exp) => sum + (exp.averageRating || 4.5), 0) / totalExperiences : 0;

      setStats({
        totalExperiences,
        activeExperiences,
        totalBookings,
        averageRating: Math.round(averageRating * 10) / 10,
        verificationStatus: experiencesResponse.data.data.length > 0 ? experiencesResponse.data.data[0].verificationStatus : 'pending'
      });

      setError('');
    } catch (error) {
      console.error('Error fetching host data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event, experience) => {
    setMenuAnchor(event.currentTarget);
    setSelectedExperience(experience);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedExperience(null);
  };

  const handleEditExperience = () => {
    if (selectedExperience) {
      navigate(`/experiences/${selectedExperience._id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteExperience = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDeleteExperience = async () => {
    if (!selectedExperience) return;

    try {
      await axiosi.delete(`/experiences/${selectedExperience._id}`);
      setDeleteDialogOpen(false);
      setSelectedExperience(null);
      fetchHostData(); // Refresh data
    } catch (error) {
      console.error('Error deleting experience:', error);
      setError('Failed to delete experience');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircleIcon color="success" />;
      case 'pending': return <PendingIcon color="warning" />;
      case 'rejected': return <BlockIcon color="error" />;
      default: return <PendingIcon color="default" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const filteredExperiences = experiences.filter(experience => {
    switch (activeTab) {
      case 0: return true; // All
      case 1: return experience.isActive && experience.verificationStatus === 'verified'; // Active
      case 2: return experience.verificationStatus === 'pending'; // Pending
      case 3: return !experience.isActive || experience.verificationStatus === 'rejected'; // Inactive
      default: return true;
    }
  });

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Host Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your local experiences and track your bookings
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/experiences/create')}
          sx={{ borderRadius: 2 }}
        >
          Create Experience
        </Button>
      </Box>

      {/* Verification Status Alert */}
      {stats.verificationStatus === 'pending' && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body2">
            Your host application is pending verification. You'll be able to create and publish experiences once approved.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Experiences"
            value={stats.totalExperiences}
            icon={<AddIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Experiences"
            value={stats.activeExperiences}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<PeopleIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={stats.averageRating}
            icon={<StarIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Experiences Table */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { fontWeight: 600 }
            }}
          >
            <Tab label="All Experiences" />
            <Tab label="Active" />
            <Tab label="Pending" />
            <Tab label="Inactive" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Experience</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Bookings</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExperiences.map((experience) => (
                  <TableRow key={experience._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={experience.images?.[0] || experience.featuredImage}
                          variant="rounded"
                          sx={{ width: 48, height: 48 }}
                        >
                          {experience.title.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {experience.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {experience.location?.city || 'Local'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {experience.category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {experience.subcategory}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ${experience.basePrice}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {experience.pricingType === 'fixed_group' ? 'per group' : 'per person'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {experience.totalBookings || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(experience.verificationStatus)}
                        label={experience.verificationStatus}
                        color={getStatusColor(experience.verificationStatus)}
                        size="small"
                        variant={experience.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, experience)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredExperiences.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        No experiences found in this category
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditExperience}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Experience
        </MenuItem>
        <MenuItem onClick={handleDeleteExperience} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Experience
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Experience</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedExperience?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteExperience} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HostDashboardPage;