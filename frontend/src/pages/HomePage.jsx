import React, { useState, useEffect } from 'react';
import { Navbar } from '../features/navigation/components/Navbar';
import { Footer } from '../features/footer/Footer';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Grid, 
  Stack, 
  useTheme, 
  useMediaQuery,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { banner1, banner2, banner3, banner4 } from '../assets';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useSelector, useDispatch } from 'react-redux';
import { selectLoggedInUser } from '../features/auth/AuthSlice';
import { ProductBanner } from '../features/products/components/ProductBanner';
import { 
  fetchFeaturedProductsAsync, 
  selectFeaturedProducts, 
  selectFeaturedProductsStatus 
} from '../features/products/ProductSlice';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarIcon from '@mui/icons-material/Star';

const heroImages = [banner1, banner2, banner3, banner4];

// Mock data for featured products (fallback)
const mockFeaturedProducts = [
  { id: 1, name: 'Premium Headphones', price: 199.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', category: 'Electronics' },
  { id: 2, name: 'Designer Watch', price: 299.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1099&q=80', category: 'Fashion' },
  { id: 3, name: 'Smart Home Hub', price: 129.99, image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc0d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80', category: 'Smart Home' },
  { id: 4, name: 'Wireless Earbuds', price: 89.99, image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1078&q=80', category: 'Audio' },
];

// Mock data for featured services
const featuredServices = [
  { id: 1, name: 'Web Development', price: 'From $499', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80', category: 'Development' },
  { id: 2, name: 'Graphic Design', price: 'From $99', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80', category: 'Design' },
  { id: 3, name: 'Digital Marketing', price: 'From $299', image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', category: 'Marketing' },
];

// Features list
const features = [
  {
    icon: <ShoppingBagOutlinedIcon fontSize="large" />,
    title: 'Easy Shopping',
    description: 'Browse and purchase products with a seamless checkout experience.'
  },
  {
    icon: <StorefrontOutlinedIcon fontSize="large" />,
    title: 'Marketplace',
    description: 'Connect with trusted sellers offering quality products and services.'
  },
  {
    icon: <HandymanOutlinedIcon fontSize="large" />,
    title: 'Service Booking',
    description: 'Find and book professional services with verified providers.'
  },
  {
    icon: <SellOutlinedIcon fontSize="large" />,
    title: 'Local Experiences',
    description: 'Discover authentic local adventures and cultural experiences with expert hosts.'
  },
];

export const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [activeTab, setActiveTab] = useState('products');
  const loggedInUser = useSelector(selectLoggedInUser);
  
  // Featured products from Redux
  const featuredProducts = useSelector(selectFeaturedProducts);
  const featuredProductsStatus = useSelector(selectFeaturedProductsStatus);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch featured products on component mount
  useEffect(() => {
    dispatch(fetchFeaturedProductsAsync(8));
  }, [dispatch]);

  const nextHeroImage = () => {
    setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
  };

  const prevHeroImage = () => {
    setCurrentHeroImage((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <>
      <Navbar isProductList={false} />
      
      {/* Hero Section */}
      <Box 
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 6, md: 8 }
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Typography 
                    component="h1"
                    variant={isMobile ? 'h3' : 'h2'} 
                    fontWeight={700} 
                    gutterBottom
                    sx={{ 
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}
                  >
                    The Ultimate Marketplace for Products & Services
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 4,
                      fontWeight: 400,
                      lineHeight: 1.6
                    }}
                  >
                    Buy, sell, and hire with confidence. B2B, B2C, and freelance services—all in one ultra-modern platform.
                  </Typography>
                  
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={{ xs: 2, sm: 3 }}
                    sx={{ mb: { xs: 4, md: 6 } }}
                  >
                    <Button 
                      component={Link} 
                      to="/goods-marketplace" 
                      variant="contained" 
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        py: 1.5,
                        px: 3,
                        borderRadius: 3,
                        fontWeight: 600,
                        boxShadow: '0 8px 20px rgba(58, 134, 255, 0.3)'
                      }}
                    >
                      Explore Marketplace
                    </Button>
                    
                    <Button
                      component={Link}
                      to="/services"
                      variant="outlined"
                      size="large"
                      sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 3,
                        fontWeight: 600,
                        borderWidth: 2
                      }}
                    >
                      Find Services
                    </Button>

                    <Button
                      component={Link}
                      to="/experiences"
                      variant="outlined"
                      size="large"
                      sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 3,
                        fontWeight: 600,
                        borderWidth: 2
                      }}
                    >
                      Local Experiences
                    </Button>
                    
                    <Button 
                      component={Link} 
                      to="/become-seller" 
                      variant="text" 
                      size="large"
                      sx={{ 
                        py: 1.5,
                        px: 3,
                        fontWeight: 600
                      }}
                    >
                      Become a Seller
                    </Button>
                  </Stack>
                  
                  {/* Stats */}
                  <Box 
                    sx={{ 
                      display: { xs: 'none', md: 'flex' },
                      gap: 4,
                      mt: 2
                    }}
                  >
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary.main">10K+</Typography>
                      <Typography variant="body2" color="text.secondary">Products</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary.main">5K+</Typography>
                      <Typography variant="body2" color="text.secondary">Services</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary.main">8K+</Typography>
                      <Typography variant="body2" color="text.secondary">Users</Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  position: 'relative',
                  height: { xs: '300px', sm: '400px', md: '500px' },
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHeroImage}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    style={{ 
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Box
                      component="img"
                      src={heroImages[currentHeroImage]}
                      alt={`Hero image ${currentHeroImage + 1}`}
                      sx={{
                        width: '90%',
                        height: '90%',
                        objectFit: 'cover',
                        borderRadius: 4,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Image navigation controls */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: '10%', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 2,
                    zIndex: 2
                  }}
                >
                  <IconButton 
                    onClick={prevHeroImage}
                    sx={{ 
                      bgcolor: 'background.paper',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.1)' }
                    }}
                  >
                    <KeyboardArrowLeftIcon />
                  </IconButton>
                  
                  <IconButton 
                    onClick={nextHeroImage}
                    sx={{ 
                      bgcolor: 'background.paper',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.1)' }
                    }}
                  >
                    <KeyboardArrowRightIcon />
                  </IconButton>
                </Box>
                
                {/* Dots indicator */}
                <Stack 
                  direction="row" 
                  spacing={1} 
                  sx={{ 
                    position: 'absolute', 
                    bottom: '2%', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    zIndex: 2
                  }}
                >
                  {heroImages.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentHeroImage(index)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: index === currentHeroImage ? 'primary.main' : 'grey.300',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.2)',
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
        
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.palette.primary.light}20, transparent 70%)`,
            zIndex: 0
          }} 
        />
        
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.palette.secondary.light}20, transparent 70%)`,
            zIndex: 0
          }} 
        />
      </Box>
      
      {/* Features Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 10 },
          background: theme.palette.background.paper
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight={700} 
              gutterBottom
              sx={{ mb: 2 }}
            >
              Why Choose Our Platform
            </Typography>
            
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: '700px',
                mx: 'auto',
                mb: 6
              }}
            >
              We provide a comprehensive ecosystem for buyers and sellers with powerful features
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      borderRadius: 4,
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                      },
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: `${theme.palette.primary.main}15`,
                        color: 'primary.main',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Featured Products & Services Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 10 },
          background: theme.palette.background.default
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight={700} 
              gutterBottom
              sx={{ mb: 2 }}
            >
              Featured Items
            </Typography>
            
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: '700px',
                mx: 'auto',
                mb: 4
              }}
            >
              Discover our top products and services
            </Typography>
            
            {/* Tabs */}
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              <Button
                variant={activeTab === 'products' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('products')}
                sx={{ 
                  px: 4,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 600
                }}
              >
                Products
              </Button>
              
              <Button
                variant={activeTab === 'services' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('services')}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 600
                }}
              >
                Services
              </Button>

              <Button
                variant={activeTab === 'experiences' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('experiences')}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 600
                }}
              >
                Experiences
              </Button>
            </Stack>
          </Box>
          
          <AnimatePresence mode="wait">
            {activeTab === 'products' ? (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {featuredProductsStatus === 'pending' ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : featuredProducts && featuredProducts.length > 0 ? (
                  <Grid container spacing={3}>
                    {featuredProducts.map((product) => (
                      <Grid item xs={12} sm={6} md={3} key={product._id || product.id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                            },
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="200"
                              image={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                              alt={product.title || product.name}
                              sx={{ objectFit: 'cover' }}
                            />
                            <Chip
                              label={product.category || 'Uncategorized'}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                bgcolor: 'background.paper',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                            {product.featured && (
                              <Chip
                                label="Featured"
                                color="warning"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 12,
                                  right: 12,
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            )}
                            {product.rating && product.rating > 0 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 12,
                                  right: 12,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                <StarIcon sx={{ fontSize: '1rem', color: '#FFD700' }} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {product.rating.toFixed(1)}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
                              {product.title || product.name}
                            </Typography>

                            <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mb: 2 }}>
                              ${product.price || 'N/A'}
                            </Typography>

                            <Button
                              variant="outlined"
                              fullWidth
                              component={Link}
                              to={`/product-details/${product._id || product.id}`}
                              sx={{
                                mt: 'auto',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                              }}
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No featured products available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check back later for our top-rated products
                    </Typography>
                  </Box>
                )}
              </motion.div>
            ) : activeTab === 'services' ? (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Grid container spacing={3}>
                  {featuredServices.map((service) => (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                          },
                          borderRadius: 3,
                          overflow: 'hidden'
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={service.image}
                            alt={service.name}
                            sx={{ objectFit: 'cover' }}
                          />
                          <Chip
                            label={service.category}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              bgcolor: 'background.paper',
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>

                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
                            {service.name}
                          </Typography>

                          <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mb: 2 }}>
                            {service.price}
                          </Typography>

                          <Button
                            variant="outlined"
                            fullWidth
                            component={Link}
                            to={`/services`}
                            sx={{
                              mt: 'auto',
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            ) : (
              <motion.div
                key="experiences"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Grid container spacing={3}>
                  {featuredServices.map((experience, index) => (
                    <Grid item xs={12} sm={6} md={4} key={`experience-${index}`}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                          },
                          borderRadius: 3,
                          overflow: 'hidden'
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={experience.image}
                            alt={experience.name}
                            sx={{ objectFit: 'cover' }}
                          />
                          <Chip
                            label="Local Experience"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              bgcolor: 'background.paper',
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>

                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
                            {experience.name}
                          </Typography>

                          <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mb: 2 }}>
                            {experience.price}
                          </Typography>

                          <Button
                            variant="outlined"
                            fullWidth
                            component={Link}
                            to={`/experiences`}
                            sx={{
                              mt: 'auto',
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            Explore Experiences
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={Link}
              to={
                activeTab === 'products' ? '/goods-marketplace' :
                activeTab === 'services' ? '/services' :
                '/experiences'
              }
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 3,
                fontWeight: 600
              }}
            >
              View All {activeTab === 'products' ? 'Products' : activeTab === 'services' ? 'Services' : 'Experiences'}
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 10 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }} 
        />
        
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: '-15%',
            right: '-5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }} 
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Ready to Start Selling?
              </Typography>
              
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
                Join thousands of sellers who have already grown their business on our platform.
              </Typography>
              
              <Button
                component={Link}
                to="/become-seller"
                variant="contained"
                size="large"
                sx={{ 
                  py: 1.5,
                  px: 4,
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                Become a Seller
              </Button>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box 
                sx={{ 
                  p: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Seller Benefits
                </Typography>
                
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />
                
                <Stack spacing={2}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ✓ Global customer reach
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ✓ Secure payment processing
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ✓ Marketing tools and analytics
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ✓ Dedicated seller support
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Seller Dashboard Access Section for Existing Sellers */}
      {loggedInUser?.roles?.includes('seller') && (
        <Box 
          sx={{ 
            py: 8,
            bgcolor: 'grey.50',
            position: 'relative'
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">
                    Welcome Back, Seller!
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
                    Access your seller dashboard to manage products, track orders, and grow your business.
                  </Typography>
                  
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Chip 
                      label={loggedInUser?.sellerVerificationStatus === 'verified' ? 'Verified Seller' : 'Pending Verification'} 
                      color={loggedInUser?.sellerVerificationStatus === 'verified' ? 'success' : 'warning'}
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                    {loggedInUser?.sellerType && (
                      <Chip 
                        label={loggedInUser.sellerType === 'service' ? 'Service Provider' : 'Product Seller'} 
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  
                  <Button
                    component={Link}
                    to="/seller/dashboard"
                    variant="contained"
                    size="large"
                    startIcon={<StorefrontIcon />}
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Go to Seller Dashboard
                  </Button>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Box 
                    sx={{ 
                      p: 4,
                      bgcolor: 'white',
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
                      Quick Actions
                    </Typography>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={2}>
                      <Button
                        component={Link}
                        to="/seller/dashboard"
                        variant="outlined"
                        fullWidth
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                      >
                        Add New Product/Service
                      </Button>
                      
                      <Button
                        component={Link}
                        to="/seller/dashboard"
                        variant="outlined"
                        fullWidth
                        startIcon={<ShoppingBagIcon />}
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                      >
                        View Orders
                      </Button>
                      
                      <Button
                        component={Link}
                        to="/seller/dashboard"
                        variant="outlined"
                        fullWidth
                        startIcon={<BarChartIcon />}
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                      >
                        View Analytics
                      </Button>
                    </Stack>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}
      
      <Footer />
    </>
  );
};
