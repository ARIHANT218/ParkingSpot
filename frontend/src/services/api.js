import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust this to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the JWT token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Admin Login
export const adminLogin = (credentials) => api.post('/admin/login', credentials);

// Parking Lot Management (CRUD)
export const getParkingLots = () => api.get('/parking');
export const createParkingLot = (data) => api.post('/parking', data);
export const updateParkingLot = (id, data) => api.put(`/parking/${id}`, data);
export const deleteParkingLot = (id) => api.delete(`/parking/${id}`);

// Fetch all bookings (for the dashboard)
export const getAllBookings = () => api.get('/bookings/all'); // Assuming you have this admin route

export default api;
