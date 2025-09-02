import React from 'react';
import { Container, Typography } from '@mui/material';
import { ServiceList } from '../features/services/ServiceList';

const ServicesPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3} align="center">
        Explore Freelance Services
      </Typography>
      <ServiceList />
    </Container>
  );
};

export default ServicesPage; 