import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { googleSignIn, googleSignOut } from './AuthApi';
import { auth } from './firebase';

const initialState = {
  loginStatus: 'idle',
  loginError: null,
  signupStatus: 'idle',
  signupError: null,
  loggedInUser: null,
  isAuthChecked: false,
  resendOtpStatus: 'idle',
  resendOtpError: null,
  resendOtpSuccessMessage: null,
  otpVerificationStatus: 'idle',
  otpVerificationError: null,
};

export const googleLoginAsync = createAsyncThunk('auth/googleLoginAsync', async () => {
  const res = await googleSignIn();
  return res;
});

export const googleLogoutAsync = createAsyncThunk('auth/googleLogoutAsync', async () => {
  await googleSignOut();
  return null;
});

export const checkAuthAsync = createAsyncThunk('auth/checkAuthAsync', async () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe(); // Unsubscribe after first check
      if (user) {
        try {
          console.log('checkAuthAsync - Firebase user:', user);
          
          // Get the Firebase ID token
          const idToken = await user.getIdToken();
          console.log('checkAuthAsync - Got ID token');
          
          // Fetch complete user data from backend
          const apiUrl = `https://azixfusion.vercel.app/users/check-auth`;
          console.log('checkAuthAsync - Calling API:', apiUrl);
          
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('checkAuthAsync - Response status:', response.status);
          
          if (response.ok) {
            const userData = await response.json();
            console.log('checkAuthAsync - User data from backend:', userData);
            console.log('checkAuthAsync - User data type:', typeof userData);
            console.log('checkAuthAsync - User data keys:', Object.keys(userData));
            console.log('checkAuthAsync - User roles:', userData?.roles);
            console.log('checkAuthAsync - User is seller:', userData?.roles?.includes('seller'));
            resolve(userData);
          } else {
            console.log('checkAuthAsync - Backend call failed, using Firebase data');
            // Fallback to basic Firebase data if backend call fails
            resolve({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            });
          }
        } catch (error) {
          console.error('checkAuthAsync - Error:', error);
          // Fallback to basic Firebase data
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        }
      } else {
        resolve(null);
      }
    });
  });
});

export const resendOtpAsync = createAsyncThunk('auth/resendOtpAsync', async () => {
  // Placeholder for OTP functionality - not needed with Google Auth
  return null;
});

export const verifyOtpAsync = createAsyncThunk('auth/verifyOtpAsync', async () => {
  // Placeholder for OTP functionality - not needed with Google Auth
  return null;
});

export const refreshUserDataAsync = createAsyncThunk('auth/refreshUserDataAsync', async () => {
  try {
    console.log('refreshUserDataAsync - Starting refresh');
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    console.log('refreshUserDataAsync - Current user:', user);
    const idToken = await user.getIdToken();
    console.log('refreshUserDataAsync - Got ID token');

    const apiUrl = `https://azixfusion.vercel.app/users/check-auth`;
    console.log('refreshUserDataAsync - Calling API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('refreshUserDataAsync - Response status:', response.status);
    
    if (response.ok) {
      const userData = await response.json();
      console.log('refreshUserDataAsync - User data from backend:', userData);
      console.log('refreshUserDataAsync - User data type:', typeof userData);
      console.log('refreshUserDataAsync - User data keys:', Object.keys(userData));
      console.log('refreshUserDataAsync - User roles:', userData?.roles);
      console.log('refreshUserDataAsync - User is seller:', userData?.roles?.includes('seller'));
      return userData;
    } else {
      throw new Error('Failed to fetch user data');
    }
  } catch (error) {
    console.error('refreshUserDataAsync - Error:', error);
    throw error;
  }
});

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    clearLoginError: (state) => {
      state.loginError = null;
    },
    resetLoginStatus: (state) => {
      state.loginStatus = 'idle';
    },
    clearSignupError: (state) => {
      state.signupError = null;
    },
    resetSignupStatus: (state) => {
      state.signupStatus = 'idle';
    },
    clearResendOtpError: (state) => {
      state.resendOtpError = null;
    },
    clearResendOtpSuccessMessage: (state) => {
      state.resendOtpSuccessMessage = null;
    },
    clearOtpVerificationError: (state) => {
      state.otpVerificationError = null;
    },
    resetResendOtpStatus: (state) => {
      state.resendOtpStatus = 'idle';
    },
    resetOtpVerificationStatus: (state) => {
      state.otpVerificationStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(googleLoginAsync.pending, (state) => {
        state.loginStatus = 'pending';
        state.signupStatus = 'pending';
      })
      .addCase(googleLoginAsync.fulfilled, (state, action) => {
        state.loginStatus = 'fullfilled';
        state.signupStatus = 'fullfilled';
        state.loggedInUser = action.payload;
      })
      .addCase(googleLoginAsync.rejected, (state, action) => {
        state.loginStatus = 'rejected';
        state.signupStatus = 'rejected';
        state.loginError = action.error;
        state.signupError = action.error;
      })
      .addCase(googleLogoutAsync.fulfilled, (state) => {
        state.loggedInUser = null;
        state.loginStatus = 'idle';
        state.signupStatus = 'idle';
      })
      .addCase(checkAuthAsync.pending, (state) => {
        state.isAuthChecked = false;
      })
      .addCase(checkAuthAsync.fulfilled, (state, action) => {
        state.isAuthChecked = true;
        state.loggedInUser = action.payload;
      })
      .addCase(checkAuthAsync.rejected, (state) => {
        state.isAuthChecked = true; // Set to true even on rejection to prevent white screen
      })
      .addCase(resendOtpAsync.pending, (state) => {
        state.resendOtpStatus = 'pending';
      })
      .addCase(resendOtpAsync.fulfilled, (state) => {
        state.resendOtpStatus = 'fulfilled';
        state.resendOtpSuccessMessage = 'OTP sent successfully';
      })
      .addCase(resendOtpAsync.rejected, (state, action) => {
        state.resendOtpStatus = 'rejected';
        state.resendOtpError = action.error;
      })
      .addCase(verifyOtpAsync.pending, (state) => {
        state.otpVerificationStatus = 'pending';
      })
      .addCase(verifyOtpAsync.fulfilled, (state) => {
        state.otpVerificationStatus = 'fulfilled';
      })
      .addCase(verifyOtpAsync.rejected, (state, action) => {
        state.otpVerificationStatus = 'rejected';
        state.otpVerificationError = action.error;
      })
      .addCase(refreshUserDataAsync.fulfilled, (state, action) => {
        state.loggedInUser = action.payload;
      });
  },
});

export const { 
  clearLoginError, 
  resetLoginStatus, 
  clearSignupError, 
  resetSignupStatus,
  clearResendOtpError,
  clearResendOtpSuccessMessage,
  clearOtpVerificationError,
  resetResendOtpStatus,
  resetOtpVerificationStatus
} = authSlice.actions;

export const selectLoggedInUser = (state) => state.AuthSlice.loggedInUser;
export const selectLoginStatus = (state) => state.AuthSlice.loginStatus;
export const selectLoginError = (state) => state.AuthSlice.loginError;
export const selectSignupStatus = (state) => state.AuthSlice.signupStatus;
export const selectSignupError = (state) => state.AuthSlice.signupError;
export const selectIsAuthChecked = (state) => state.AuthSlice.isAuthChecked;
export const selectResendOtpStatus = (state) => state.AuthSlice.resendOtpStatus;
export const selectResendOtpError = (state) => state.AuthSlice.resendOtpError;
export const selectResendOtpSuccessMessage = (state) => state.AuthSlice.resendOtpSuccessMessage;
export const selectOtpVerificationStatus = (state) => state.AuthSlice.otpVerificationStatus;
export const selectOtpVerificationError = (state) => state.AuthSlice.otpVerificationError;

export default authSlice.reducer;

