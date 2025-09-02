import React from 'react';
import { 
  Box, 
  Container,
  Grid,
  IconButton, 
  TextField, 
  Typography, 
  useMediaQuery, 
  useTheme,
  Button,
  Divider,
  Link as MuiLink,
  InputAdornment,
  Paper
} from '@mui/material';
import { Stack } from '@mui/material';
import { QRCodePng, appStorePng, googlePlayPng, facebookPng, instagramPng, twitterPng, linkedinPng } from '../../assets';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  const footerLinks = {
    account: [
      { name: 'My Account', to: '/profile' },
      { name: 'Login / Register', to: '/login' },
      { name: 'Cart', to: '/cart' },
      { name: 'Wishlist', to: '/wishlist' },
      { name: 'Shop', to: '/goods-marketplace' },
    ],
    quickLinks: [
      { name: 'Privacy Policy', to: '#' },
      { name: 'Terms Of Use', to: '#' },
      { name: 'FAQ', to: '#' },
      { name: 'Contact', to: '#' },
    ],
  };

  const socialLinks = [
    { icon: facebookPng, name: 'Facebook', url: 'https://facebook.com' },
    { icon: twitterPng, name: 'Twitter', url: 'https://twitter.com' },
    { icon: instagramPng, name: 'Instagram', url: 'https://instagram.com' },
    { icon: linkedinPng, name: 'LinkedIn', url: 'https://linkedin.com' },
  ];

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: theme.palette.background.dark,
        color: 'white',
        pt: { xs: 6, md: 10 },
        pb: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative elements */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: '5%',
          left: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
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
          background: 'rgba(255, 255, 255, 0.03)',
          zIndex: 0
        }} 
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Brand & Subscribe */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <img 
                src="https://files.catbox.moe/4l70v0.png" 
                alt="AEM Logo" 
                style={{ height: "100px", width: "auto", filter: "brightness(0) invert(1)" }} 
              />
            </Box>
            
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Subscribe to Our Newsletter
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
              Get 10% off your first order and stay updated with our latest offers
            </Typography>
            
            <Paper
              component="form"
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 3,
                overflow: 'hidden',
                mb: 4,
                boxShadow: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                bgcolor: 'rgba(255,255,255,0.05)',
              }}
            >
              <TextField
                placeholder="Enter your email"
                variant="outlined"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    py: 1.5,
                    px: 2,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          borderRadius: '50%',
                          minWidth: 'unset',
                          width: 36,
                          height: 36,
                          mr: 0.5,
                        }}
                      >
                        <SendIcon fontSize="small" />
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
            
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              {socialLinks.map((social, index) => (
                <motion.div
                  key={social.name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconButton
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      },
                    }}
                  >
                    <img 
                      src={social.icon} 
                      alt={social.name} 
                      style={{ 
                        width: 20, 
                        height: 20, 
                        filter: "brightness(0) invert(1)" 
                      }} 
                    />
                  </IconButton>
                </motion.div>
              ))}
            </Stack>
          </Grid>
          
          {/* Support */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Support
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOnOutlinedIcon sx={{ color: 'primary.main', mt: 0.3 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Moi Avenue, Nairobi, Kenya
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <EmailOutlinedIcon sx={{ color: 'primary.main', mt: 0.3 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  azix.africa@gmail.com
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <PhoneOutlinedIcon sx={{ color: 'primary.main', mt: 0.3 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  +254 725280695
                </Typography>
              </Box>
            </Stack>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Download App
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                Save $3 with App New User Only
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Box 
                  component="img" 
                  src={QRCodePng} 
                  alt="QR Code"
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: 1,
                    bgcolor: 'white',
                    p: 1
                  }}
                />
                
                <Stack spacing={1}>
                  <Box 
                    component="img" 
                    src={googlePlayPng} 
                    alt="Google Play"
                    sx={{ 
                      height: 32,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.05)' }
                    }}
                  />
                  
                  <Box 
                    component="img" 
                    src={appStorePng} 
                    alt="App Store"
                    sx={{ 
                      height: 32,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.05)' }
                    }}
                  />
                </Stack>
              </Stack>
            </Box>
          </Grid>
          
          {/* Account */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Account
            </Typography>
            
            <Stack spacing={1.5}>
              {footerLinks.account.map((link) => (
                <Box 
                  key={link.name}
                  component={Link}
                  to={link.to}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white',
                    opacity: 0.8,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      opacity: 1,
                      transform: 'translateX(5px)',
                      color: 'primary.main',
                    }
                  }}
                >
                  <KeyboardArrowRightIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                  <Typography variant="body2">{link.name}</Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
          
          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Quick Links
            </Typography>
            
            <Stack spacing={1.5}>
              {footerLinks.quickLinks.map((link) => (
                <Box 
                  key={link.name}
                  component={Link}
                  to={link.to}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white',
                    opacity: 0.8,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      opacity: 1,
                      transform: 'translateX(5px)',
                      color: 'primary.main',
                    }
                  }}
                >
                  <KeyboardArrowRightIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                  <Typography variant="body2">{link.name}</Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />
        
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            &copy; AEM {new Date().getFullYear()}. All rights reserved
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex',
              gap: 3
            }}
          >
            <MuiLink 
              href="#" 
              underline="hover" 
              color="inherit" 
              sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
            >
              <Typography variant="body2">Terms</Typography>
            </MuiLink>
            
            <MuiLink 
              href="#" 
              underline="hover" 
              color="inherit" 
              sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
            >
              <Typography variant="body2">Privacy</Typography>
            </MuiLink>
            
            <MuiLink 
              href="#" 
              underline="hover" 
              color="inherit" 
              sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
            >
              <Typography variant="body2">Cookies</Typography>
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
