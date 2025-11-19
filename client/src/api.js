import axios from 'axios';

// Create a re-usable instance of axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  This "interceptor" is a powerful feature.
  It runs BEFORE every single request.
  It checks if we have a 'token' in localStorage.
  If we do, it adds it to the request header.
  This is how we stay logged in.
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;