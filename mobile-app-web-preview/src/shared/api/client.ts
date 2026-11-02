import axios from 'axios';

// Dynamically resolve live Render URL from environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'https://gym-saas-35l3.onrender.com/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gymora_mobile_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('gymora_mobile_unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
