import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) {
      return `http://${host}:5600/api`;
    }
    return 'https://gym-saas-35l3.onrender.com/api';
  }
  return 'http://localhost:5600/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aigym_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 and deactivated account 403 globally — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;
    if (
      status === 401 ||
      (status === 403 && (errorCode === 'ACCOUNT_INACTIVE' || errorCode === 'TRAINER_INACTIVE' || errorCode === 'TRAINER_NOT_FOUND'))
    ) {
      // Clear auth tokens but preserve sessionStorage (e.g. checkout_intent)
      localStorage.removeItem('aigym_token');
      localStorage.removeItem('aigym_user');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
