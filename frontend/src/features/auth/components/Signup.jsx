import { Stack, Typography, useMediaQuery, useTheme, Button } from '@mui/material';
import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import { ecommerceOutlookAnimation } from '../../../assets';
import { useDispatch, useSelector } from 'react-redux';
import { selectLoggedInUser, googleLoginAsync, selectSignupStatus, selectSignupError, clearSignupError, resetSignupStatus } from '../AuthSlice';
import { toast } from 'react-toastify';
import { Google } from '@mui/icons-material';

export const Signup = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectSignupStatus);
  const error = useSelector(selectSignupError);
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));

  useEffect(() => {
    if (loggedInUser) {
      navigate('/');
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || error);
    }
  }, [error]);

  useEffect(() => {
    if (status === 'fullfilled' && loggedInUser) {
      toast.success(`Signup successful`);
    }
    return () => {
      dispatch(clearSignupError());
      dispatch(resetSignupStatus());
    };
  }, [status]);

  const handleGoogleSignup = () => {
    dispatch(googleLoginAsync());
  };

  return (
    <Stack width={'100vw'} height={'100vh'} flexDirection={'row'} sx={{ overflowY: 'hidden' }}>
      {!is900 && (
        <Stack bgcolor={'black'} flex={1} justifyContent={'center'}>
          <Lottie animationData={ecommerceOutlookAnimation} />
        </Stack>
      )}
      <Stack flex={1} justifyContent={'center'} alignItems={'center'}>
        <Stack flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
          <Stack rowGap={'.4rem'}>
            <img src="https://files.catbox.moe/4l70v0.png" alt="AEM Logo" style={{ height: '130px', width: 'auto' }} />
            <Typography alignSelf={'flex-end'} color={'GrayText'} variant='body2'>- Shop Anything</Typography>
          </Stack>
        </Stack>
        <Stack mt={4} spacing={2} width={'28rem'} alignItems={'center'}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Google />}
            onClick={handleGoogleSignup}
            sx={{ height: '3rem', fontSize: '1.1rem', width: '100%' }}
            disabled={status === 'pending'}
          >
            Sign up with Google
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}