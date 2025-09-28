import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Chip, Stack, Tabs, Tab, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSellerDashboardAsync, selectSellerDashboard, selectSellerDashboardStatus } from '../features/user/UserSlice';
import { ProductManagement } from '../features/seller/ProductManagement';
import { ServiceManagement } from '../features/seller/ServiceManagement';
import { OrderManagement } from '../features/seller/OrderManagement';
import { SellerMessaging } from '../features/seller/SellerMessaging';
import { selectLoggedInUser } from '../features/auth/AuthSlice';
import { refreshUserDataAsync } from '../features/auth/AuthSlice';

export const SellerDashboardPage = () => {
  const dispatch = useDispatch();
  const dashboard = useSelector(selectSellerDashboard);
  const dashboardStatus = useSelector(selectSellerDashboardStatus);
  const loggedInUser = useSelector(selectLoggedInUser);
  const [tab, setTab] = useState(0);

  // Debug: Log user data when accessing seller dashboard
  console.log('SellerDashboardPage - loggedInUser:', loggedInUser);
  console.log('SellerDashboardPage - user roles:', loggedInUser?.roles);
  console.log('SellerDashboardPage - sellerType:', loggedInUser?.sellerType);
  console.log('SellerDashboardPage - is seller:', loggedInUser?.roles?.includes('seller'));
  
  // Move useEffect before any early returns
  useEffect(() => { 
    dispatch(fetchSellerDashboardAsync()); 
  }, [dispatch]);

  // Reset tab if current tab is out of bounds - move this useEffect up as well
  useEffect(() => {
    if (dashboard && dashboardStatus === 'fulfilled') {
      // Determine seller type and available tabs
      const isServiceSeller = loggedInUser?.sellerType === 'service';
      const isProductSeller = loggedInUser?.sellerType === 'product';
      
      // Define tabs based on seller type
      const getTabs = () => {
        if (isServiceSeller) {
          return 3; // Services, Orders, Messages
        } else if (isProductSeller) {
          return 3; // Products, Orders, Messages
        } else {
          return 4; // Products, Services, Orders, Messages
        }
      };
      
      const maxTabs = getTabs();
      if (tab >= maxTabs) {
        setTab(0);
      }
    }
  }, [tab, dashboard, dashboardStatus, loggedInUser]);

  // Check if user is actually a seller
  if (!loggedInUser?.roles?.includes('seller')) {
    const handleRefreshUserData = () => {
      dispatch(refreshUserDataAsync());
    };

    return (
      <Box mt={6} textAlign="center">
        <Typography variant="h5" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography>
          You need to be a seller to access this dashboard.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Current user roles: {loggedInUser?.roles?.join(', ') || 'none'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          User ID: {loggedInUser?._id}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRefreshUserData}
          sx={{ mt: 2 }}
        >
          Refresh User Data
        </Button>
      </Box>
    );
  }

  if (dashboardStatus === 'pending') return <Box mt={6} textAlign="center"><Typography>Loading dashboard...</Typography></Box>;
  if (dashboardStatus === 'rejected') return <Box mt={6} textAlign="center"><Typography color="error">Failed to load dashboard.</Typography></Box>;
  if (!dashboard) return null;

  // Determine seller type and available tabs
  const isServiceSeller = loggedInUser?.sellerType === 'service';
  const isProductSeller = loggedInUser?.sellerType === 'product';
  const isBothSeller = !loggedInUser?.sellerType || loggedInUser?.sellerType === 'both';

  // Define tabs based on seller type
  const getTabs = () => {
    if (isServiceSeller) {
      return [
        { label: 'Services', component: <ServiceManagement /> },
        { label: 'Orders', component: <OrderManagement /> },
        { label: 'Messages', component: <SellerMessaging /> }
      ];
    } else if (isProductSeller) {
      return [
        { label: 'Products', component: <ProductManagement /> },
        { label: 'Orders', component: <OrderManagement /> },
        { label: 'Messages', component: <SellerMessaging /> }
      ];
    } else {
      // Both or undefined - show all tabs
      return [
        { label: 'Products', component: <ProductManagement /> },
        { label: 'Services', component: <ServiceManagement /> },
        { label: 'Orders', component: <OrderManagement /> },
        { label: 'Messages', component: <SellerMessaging /> }
      ];
    }
  };

  const tabs = getTabs();

  return (
    <Box maxWidth={900} mx="auto" mt={6} p={3}>
      <Typography variant="h4" fontWeight={700} mb={4}>Seller Dashboard</Typography>
      
      {/* Seller Type Indicator */}
      <Box mb={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6">Seller Type:</Typography>
          <Chip 
            label={isServiceSeller ? 'Service Provider' : isProductSeller ? 'Product Seller' : 'Multi-Vendor'} 
            color="primary" 
            variant="filled"
          />
          <Chip 
            label={dashboard.verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'} 
            color="warning" 
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 4 }}>
        {tabs.map((tabItem, index) => (
          <Tab key={index} label={tabItem.label} />
        ))}
      </Tabs>

      {/* Tab Content */}
      {tabs[tab]?.component}

      {/* Dashboard Stats */}
      <Grid container spacing={3} mt={4}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Total Sales</Typography>
              <Typography variant="h4" color="primary.main">${dashboard.totalSales || 0}</Typography>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Total Earnings</Typography>
              <Typography variant="h4" color="success.main">${dashboard.totalEarnings || 0}</Typography>
            </Paper>
          </motion.div>
        </Grid>
        {!isServiceSeller && (
          <Grid item xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">Active Products</Typography>
                <Typography variant="h4">{dashboard.activeProducts || 0}</Typography>
              </Paper>
            </motion.div>
          </Grid>
        )}
        {!isProductSeller && (
          <Grid item xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">Active Services</Typography>
                <Typography variant="h4">{dashboard.activeServices || 0}</Typography>
              </Paper>
            </motion.div>
          </Grid>
        )}
      </Grid>

      {/* Status Information */}
      <Stack direction="row" spacing={2} mt={4} alignItems="center">
        <Typography variant="h6">KYC Status:</Typography>
        <Chip 
          label={dashboard.kycStatus || 'Not Started'} 
          color={dashboard.kycStatus === 'verified' ? 'success' : dashboard.kycStatus === 'pending' ? 'warning' : 'default'} 
        />
      </Stack>
      
      <Stack direction="row" spacing={2} mt={2} alignItems="center">
        <Typography variant="h6">Verification Status:</Typography>
        <Chip 
          label={dashboard.verificationStatus === 'verified' ? 'Verified Seller' : dashboard.verificationStatus === 'rejected' ? 'Rejected' : 'Pending Verification'} 
          color={dashboard.verificationStatus === 'verified' ? 'success' : dashboard.verificationStatus === 'rejected' ? 'error' : 'warning'} 
        />
        {dashboard.verificationStatus === 'pending' && (
          <Typography variant="body2" color="text.secondary">
            You can start selling while waiting for admin verification
          </Typography>
        )}
      </Stack>
    </Box>
  );
}; 