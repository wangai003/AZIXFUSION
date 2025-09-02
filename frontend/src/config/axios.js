import axios from 'axios';
import { getFirebaseIdToken } from '../utils/getFirebaseIdToken';

export const axiosi = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
});

axiosi.interceptors.request.use(async (config) => {
  const idToken = await getFirebaseIdToken();
  if (idToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
}, (error) => Promise.reject(error));