import axios from 'axios';
const baseURL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
const instance = axios.create({
  baseURL:  `${baseURL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    try {
      
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem('token'); 
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      
      console.error('axios request interceptor - token read error:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response) {
      const { status, data } = error.response;
      
      console.warn(`API response error: ${status}`, data);

    
    }
    return Promise.reject(error);
  }
);

export default instance;
