import React from 'react';
import { Fab, Tooltip, Badge } from '@mui/material';
import { Storefront, Dashboard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLoggedInUser } from '../../features/auth/AuthSlice';
import { motion } from 'framer-motion';

export const SellerFAB = () => {
  const navigate = useNavigate();
  const user = useSelector(selectLoggedInUser);
  
  // Debug logging
  console.log('SellerFAB - User data:', user);
  console.log('SellerFAB - User data type:', typeof user);
  console.log('SellerFAB - User data keys:', user ? Object.keys(user) : 'null');
  console.log('SellerFAB - User roles:', user?.roles);
  console.log('SellerFAB - User _id:', user?._id);
  console.log('SellerFAB - Is seller:', user?.roles?.includes('seller'));
  
  // Don't render if user data is not loaded yet
  if (!user) {
    console.log('SellerFAB - Not showing, user data not loaded yet');
    return null;
  }
  
  // Check if user is a seller
  const isSeller = user?.roles?.includes('seller');
  
  if (!isSeller) {
    console.log('SellerFAB - Not showing, user is not a seller');
    return null;
  }
  
  console.log('SellerFAB - Showing FAB for seller');
  
  const handleClick = () => {
    navigate('/seller/dashboard');
  };
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <Tooltip 
        title="Seller Dashboard" 
        placement="left"
        arrow
      >
        <Fab
          color="primary"
          size="large"
          onClick={handleClick}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <Badge
            badgeContent={user?.sellerVerificationStatus === 'pending' ? '!' : 0}
            color={user?.sellerVerificationStatus === 'pending' ? 'warning' : 'default'}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: 20,
                minWidth: 20,
              }
            }}
          >
            <Storefront />
          </Badge>
        </Fab>
      </Tooltip>
    </motion.div>
  );
};
