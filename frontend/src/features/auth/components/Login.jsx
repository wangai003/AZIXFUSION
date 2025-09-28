import { 
  Box, 
  Stack, 
  Typography, 
  useMediaQuery, 
  useTheme, 
  Button, 
  Paper,
  Container,
  CircularProgress
} from '@mui/material';
import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import { ecommerceOutlookAnimation } from '../../../assets';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectLoggedInUser, 
  googleLoginAsync, 
  selectLoginStatus, 
  selectLoginError, 
  clearLoginError, 
  resetLoginStatus 
} from '../AuthSlice';
import { toast } from 'react-toastify';
import { Google } from '@mui/icons-material';
import { motion } from 'framer-motion';

export const Login = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectLoginStatus);
  const error = useSelector(selectLoginError);
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLoading = status === 'pending';

  useEffect(() => {
    if (loggedInUser) {
      navigate('/');
    }
  }, [loggedInUser, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || error);
    }
  }, [error]);

  useEffect(() => {
    if (status === 'fullfilled' && loggedInUser) {
      toast.success(`Login successful`);
    }
    return () => {
      dispatch(clearLoginError());
      dispatch(resetLoginStatus());
    };
  }, [status, loggedInUser, dispatch]);

  const handleGoogleLogin = () => {
    dispatch(googleLoginAsync());
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: theme.palette.background.default
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
          background: `radial-gradient(circle, ${theme.palette.primary.light}10, transparent 70%)`,
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
          background: `radial-gradient(circle, ${theme.palette.secondary.light}10, transparent 70%)`,
          zIndex: 0
        }} 
      />
      
      <Container maxWidth="xl" sx={{ display: 'flex', flex: 1 }}>
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          sx={{ 
            flex: 1,
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Left side - Animation */}
          {!isMobile && (
            <Box 
              flex={1} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              component={motion.div}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  bgcolor: theme.palette.background.dark,
                  borderRadius: 4,
                  overflow: 'hidden',
                  width: '90%',
                  height: '80%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              >
                <Lottie 
                  animationData={ecommerceOutlookAnimation} 
                  style={{ width: '100%', height: '100%' }}
                />
              </Paper>
            </Box>
          )}
          
          {/* Right side - Login */}
          <Box 
            flex={1} 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            py={4}
            component={motion.div}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                width: { xs: '100%', sm: '450px' },
                borderRadius: 4,
                bgcolor: 'background.paper',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src="https://files.catbox.moe/r7gvct.png"
                    alt="AEM Logo"
                    style={{ height: '150px', width: 'auto' }}
                  />
                </motion.div>
                
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  sx={{ 
                    mt: 2,
                    mb: 1,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Welcome Back
                </Typography>
                
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue to your account
                </Typography>
              </Box>
              
              <Box sx={{ width: '100%', mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={isLoading ? null : <Google />}
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)',
                    position: 'relative'
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign in with Google'
                  )}
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary" textAlign="center">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}