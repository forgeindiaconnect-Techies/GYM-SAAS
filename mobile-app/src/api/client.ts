import axios from 'axios';

// In Expo development:
// - Android Emulator uses http://10.0.2.2:5600/api
// - iOS Simulator uses http://localhost:5600/api
// - Physical device / Web uses LAN IP or localhost
const BASE_URL = 'http://localhost:5600/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
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
    // Graceful offline fallback logging
    console.log('[Mobile API Error]:', error.message);
    return Promise.reject(error);
  }
);

export default api;

