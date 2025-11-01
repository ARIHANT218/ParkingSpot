// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL:'http://localhost:5000/api', // backend API
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers (safe access to localStorage)
instance.interceptors.request.use(
  (config) => {
    try {
      // Guard for environments where window/localStorage may be undefined
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem('token'); // change key if your app uses a different key
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      // Don't block requests on storage/read errors — just log for debugging
      // eslint-disable-next-line no-console
      console.error('axios request interceptor - token read error:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to help debug auth / server errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response) {
      const { status, data } = error.response;
      // helpful debug logs
      // eslint-disable-next-line no-console
      console.warn(`API response error: ${status}`, data);

      // Optional behavior (uncomment if you want automatic client-side handling)
      // if (status === 401) {
      //   // token invalid/expired — you might want to redirect to login or clear token
      //   localStorage.removeItem('token');
      //   window.location.href = '/login';
      // }
    }
    return Promise.reject(error);
  }
);

export default instance;
