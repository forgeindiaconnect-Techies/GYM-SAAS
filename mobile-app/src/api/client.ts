import axios from 'axios';

// Dynamically resolve backend API URL from environment configuration (.env)
// Expo automatically exposes EXPO_PUBLIC_* variables to the mobile runtime
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (process.env.EXPO_PUBLIC_BACKEND_URL ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/api` : '') ||
  'http://localhost:5600/api';

console.log(`[Gymora Mobile API] Active Base URL: ${BASE_URL}`);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let userToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  userToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.request.use((config) => {
  if (userToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('[Gymora Mobile API Error]:', error?.response?.status || error.message);
    return Promise.reject(error);
  }
);

// Health check utility to verify active connection
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await api.get('/health');
    return res.status === 200;
  } catch (err) {
    console.warn('[Gymora Mobile] Backend health check failed:', err);
    return false;
  }
};

export default api;
