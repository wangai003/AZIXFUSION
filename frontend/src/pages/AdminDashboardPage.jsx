import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectLoggedInUser } from '../features/auth/AuthSlice';
import { AdminUsers } from '../features/admin/AdminUsers';
import { AdminProducts } from '../features/admin/AdminProducts';
import { AdminServices } from '../features/admin/AdminServices';
import { AdminOrders } from '../features/admin/AdminOrders';
import { AdminServiceRequests } from '../features/admin/AdminServiceRequests';
import { AdminReviews } from '../features/admin/AdminReviews';

export const AdminDashboardPage = () => {
  const [tab, setTab] = useState(0);
  const loggedInUser = useSelector(selectLoggedInUser);
  
  // Check if user is a goods seller (not full admin)
  const isGoodsSeller = loggedInUser?.roles?.includes('seller') && loggedInUser?.sellerType === 'goods' && !loggedInUser?.isAdmin;
  
  // Define tabs based on user role
  const adminTabs = [
    { label: "Users", component: <AdminUsers /> },
    { label: "Products", component: <AdminProducts /> },
    { label: "Services", component: <AdminServices /> },
    { label: "Orders", component: <AdminOrders /> },
    { label: "Service Requests", component: <AdminServiceRequests /> },
    { label: "Reviews", component: <AdminReviews /> }
  ];
  
  const goodsSellerTabs = [
    { label: "Products", component: <AdminProducts /> },
    { label: "Reviews", component: <AdminReviews /> }
  ];
  
  const tabs = isGoodsSeller ? goodsSellerTabs : adminTabs;
  
  return (
    <Box maxWidth={1200} mx="auto" mt={6} p={3}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        {isGoodsSeller ? 'Product Management Dashboard' : 'Admin Dashboard'}
      </Typography>
      
      {isGoodsSeller && (
        <Typography variant="body1" color="text.secondary" mb={4}>
          Manage your products and view customer reviews. You have access to product-related admin functions only.
        </Typography>
      )}
      
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 4 }}>
        {tabs.map((tabItem, index) => (
          <Tab key={index} label={tabItem.label} />
        ))}
      </Tabs>
      
      {tabs[tab]?.component}
    </Box>
  );
};
