import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Star,
  Category,
  Search,
  Add
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllServicesAsync, selectAllServices, selectAllServicesStatus, selectAllServicesError } from '../features/services/ServiceSlice';
import { ServiceSearchFilter } from '../components/forms/ServiceSearchFilter';
import { SERVICE_CATEGORIES } from '../config/serviceCategories';

const ServiceCard = ({ service, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          height: '100%', 
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: 8
          }
        }}
        onClick={onClick}
      >
        {service.media && service.media.length > 0 && (
          <CardMedia
            component="img"
            height="200"
            image={service.media[0].url}
            alt={service.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {service.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
            {service.description?.slice(0, 100)}...
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary.main" fontWeight={700}>
              From ${service.price || (service.packages && service.packages[0]?.price) || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {service.subcategory && (
              <Chip 
                label={service.subcategory} 
                size="small" 
                variant="outlined" 
                color="primary"
              />
            )}
            {service.serviceLevel && (
              <Chip 
                label={service.serviceLevel} 
                size="small" 
                variant="outlined" 
                color="secondary"
              />
            )}
            {service.isFeatured && (
              <Chip 
                label="Featured" 
                size="small" 
                variant="filled" 
                color="success"
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              by {service.providerName || 'Unknown Provider'}
            </Typography>
            <Button size="small" variant="outlined">
              View Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CategoryCard = ({ category, icon, subcategories, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          height: '100%', 
          cursor: 'pointer',
          textAlign: 'center',
          '&:hover': {
            boxShadow: 4
          }
        }}
        onClick={onClick}
      >
        <CardContent>
          <Typography variant="h1" sx={{ mb: 2, fontSize: '3rem' }}>
            {icon}
          </Typography>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {category}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subcategories.length} subcategories
          </Typography>
          <Button variant="outlined" size="small">
            Explore Services
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ServiceMarketplacePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const services = useSelector(selectAllServices);
  const status = useSelector(selectAllServicesStatus);
  const error = useSelector(selectAllServicesError);

  const [activeTab, setActiveTab] = useState(0);
  const [searchFilters, setSearchFilters] = useState({});
  const [filteredServices, setFilteredServices] = useState([]);

  useEffect(() => {
    dispatch(fetchAllServicesAsync());
  }, [dispatch]);

  useEffect(() => {
    if (services && services.length > 0) {
      applyFilters(services, searchFilters);
    }
  }, [services, searchFilters]);

  const applyFilters = (servicesToFilter, filters) => {
    let filtered = [...servicesToFilter];

    // Apply search query filter
    if (filters.q) {
      const searchTerm = filters.q.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm) ||
        (service.tags && service.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(service => service.category === filters.category);
    }

    // Apply subcategory filter
    if (filters.subcategory) {
      filtered = filtered.filter(service => service.subcategory === filters.subcategory);
    }

    // Apply pricing model filter
    if (filters.pricingModel) {
      filtered = filtered.filter(service => service.pricingModel === filters.pricingModel);
    }

    // Apply service level filter
    if (filters.serviceLevel) {
      filtered = filtered.filter(service => service.serviceLevel === filters.serviceLevel);
    }

    // Apply price range filter
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(service => {
        const minPrice = Math.min(...(service.packages?.map(p => p.price) || [service.price || 0]));
        if (filters.minPrice && minPrice < filters.minPrice) return false;
        if (filters.maxPrice && minPrice > filters.maxPrice) return false;
        return true;
      });
    }

    // Apply featured filter
    if (filters.isFeatured) {
      filtered = filtered.filter(service => service.isFeatured);
    }

    setFilteredServices(filtered);
  };

  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };

  const handleClear = () => {
    setSearchFilters({});
  };

  const handleCategoryClick = (category) => {
    setSearchFilters({ category });
    setActiveTab(0);
  };

  const handleServiceClick = (service) => {
    navigate(`/services/${service._id}`);
  };

  const tabs = [
    { label: 'All Services', icon: <Search /> },
    { label: 'Categories', icon: <Category /> },
    { label: 'Featured', icon: <Star /> },
    { label: 'Trending', icon: <TrendingUp /> }
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 0: // All Services
        return (
          <Box>
            <ServiceSearchFilter 
              onSearch={handleSearch}
              onClear={handleClear}
              initialFilters={searchFilters}
            />
            
            {status === 'pending' ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error.message || 'Failed to load services'}
              </Alert>
            ) : filteredServices.length > 0 ? (
              <Grid container spacing={3}>
                <AnimatePresence>
                  {filteredServices.map((service, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={service._id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ServiceCard 
                          service={service} 
                          onClick={() => handleServiceClick(service)}
                        />
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No services found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria or browse by category
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 1: // Categories
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Browse Services by Category
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(SERVICE_CATEGORIES).map(([category, { icon, subcategories }], index) => (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <CategoryCard 
                      category={category}
                      icon={icon}
                      subcategories={subcategories}
                      onClick={() => handleCategoryClick(category)}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2: // Featured
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Featured Services
            </Typography>
            {status === 'pending' ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {services
                  .filter(service => service.isFeatured)
                  .slice(0, 12)
                  .map((service, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={service._id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ServiceCard 
                          service={service} 
                          onClick={() => handleServiceClick(service)}
                        />
                      </motion.div>
                    </Grid>
                  ))}
              </Grid>
            )}
          </Box>
        );

      case 3: // Trending
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Trending Services
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Popular services based on views and engagement
            </Typography>
            {/* Add trending logic here */}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Service Marketplace
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Discover professional services from verified providers
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/seller/dashboard')}
            sx={{ px: 4, py: 1.5 }}
          >
            Offer Your Service
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/services')}
            sx={{ px: 4, py: 1.5 }}
          >
            Browse All Services
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label} 
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {getTabContent()}
      </Box>
    </Container>
  );
};
