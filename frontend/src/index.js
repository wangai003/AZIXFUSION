import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '@mui/material';
import theme from './theme/theme';
import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDez-3_pVJepyOkMxvWp5IL5_-cf2fmXdk",
  authDomain: "azix-7ffe4.firebaseapp.com",
  projectId: "azix-7ffe4",
  storageBucket: "azix-7ffe4.appspot.com",
  messagingSenderId: "40354643169",
  appId: "1:40354643169:web:d3cd66059540d3cb36cba0",
};

// Initialize Firebase
initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
        <Provider store={store}>
              <App />
              <ToastContainer position='top-right' autoClose={1500} closeOnClick/>
        </Provider>
    </ThemeProvider>
  </React.StrictMode>
);

