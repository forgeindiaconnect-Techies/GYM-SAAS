import axios from 'axios';

const getMobileBaseUrl = () => {
  // Check for custom API url in environment
  if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }
  // When running in browser or mobile web preview
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Local dev: connect directly to backend port 5600
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) {
      return `http://${host}:5600/api`;
    }
  }
  return 'http://localhost:5600/api';
};

export const api = axios.create({
  baseURL: getMobileBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token automatically to every outgoing mobile request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gymora_mobile_token') || sessionStorage.getItem('gymora_mobile_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor: auto-handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gymora_mobile_token');
      localStorage.removeItem('gymora_mobile_user');
      // Dispatch custom event so AuthContext can handle logout smoothly
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('gymora_mobile_unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

