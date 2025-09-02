import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { BuyerOrderManagement } from '../features/buyer/BuyerOrderManagement';
import { BuyerWishlist } from '../features/buyer/BuyerWishlist';
import { BuyerMessaging } from '../features/buyer/BuyerMessaging';
import { MyRequests } from '../features/buyer/MyRequests';

export const BuyerDashboardPage = () => {
  const [tab, setTab] = useState(0);
  return (
    <Box maxWidth={900} mx="auto" mt={6} p={3}>
      <Typography variant="h4" fontWeight={700} mb={4}>Buyer Dashboard</Typography>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 4 }}>
        <Tab label="Orders" />
        <Tab label="Wishlist" />
        <Tab label="Messages" />
        <Tab label="My Requests" />
      </Tabs>
      {tab === 0 && <BuyerOrderManagement />}
      {tab === 1 && <BuyerWishlist />}
      {tab === 2 && <BuyerMessaging />}
      {tab === 3 && <MyRequests />}
    </Box>
  );
}; 