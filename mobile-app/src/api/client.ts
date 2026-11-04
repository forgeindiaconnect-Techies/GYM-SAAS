import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LIVE_RENDER_API_URL = 'https://gym-saas-35l3.onrender.com/api';
export const LOCAL_WIFI_API_URL = 'http://192.168.1.29:5600/api';
export const LOCALHOST_API_URL = 'http://localhost:5600/api';

export const BACKEND_STORAGE_KEY = '@gymora_custom_backend_url';

export const BACKEND_PRESETS = [
  {
    id: 'render',
    name: 'Cloud Render (Live DB)',
    url: LIVE_RENDER_API_URL,
    desc: 'Shared Atlas MongoDB (ai-gym)',
    isProduction: true,
  },
  {
    id: 'local_wifi',
    name: 'Local PC on Wi-Fi (Port 5600)',
    url: LOCAL_WIFI_API_URL,
    desc: 'Same Wi-Fi network (192.168.1.29:5600)',
    isProduction: false,
  },
  {
    id: 'localhost',
    name: 'Localhost (Port 5600)',
    url: LOCALHOST_API_URL,
    desc: 'For Web browser / Local simulator',
    isProduction: false,
  },
];

// Dynamically resolve initial backend API URL
const INITIAL_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (process.env.EXPO_PUBLIC_BACKEND_URL ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/api` : '') ||
  LIVE_RENDER_API_URL;

console.log(`[Gymora Mobile API] Initial Base URL: ${INITIAL_BASE_URL}`);

export const api = axios.create({
  baseURL: INITIAL_BASE_URL,
  timeout: 60000, // 60s allowance for Render free-tier cold start wakeups
  headers: {
    'Content-Type': 'application/json',
  },
});

// Restore custom backend URL if saved by user
AsyncStorage.getItem(BACKEND_STORAGE_KEY)
  .then((savedUrl) => {
    if (savedUrl && typeof savedUrl === 'string' && savedUrl.trim().startsWith('http')) {
      api.defaults.baseURL = savedUrl.trim();
      console.log(`[Gymora Mobile API] Restored Custom Base URL: ${savedUrl}`);
    }
  })
  .catch((err) => {
    console.warn('[Gymora Mobile API] Failed to read saved backend URL:', err);
  });

export const getActiveBaseUrl = (): string => {
  return api.defaults.baseURL || INITIAL_BASE_URL;
};

export const setActiveBaseUrl = async (newUrl: string): Promise<void> => {
  const cleaned = newUrl.trim().replace(/\/+$/, '');
  const finalUrl = cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  api.defaults.baseURL = finalUrl;
  await AsyncStorage.setItem(BACKEND_STORAGE_KEY, finalUrl);
  console.log(`[Gymora Mobile API] Updated Active Base URL: ${finalUrl}`);
};

export const resetDefaultBaseUrl = async (): Promise<void> => {
  api.defaults.baseURL = LIVE_RENDER_API_URL;
  await AsyncStorage.removeItem(BACKEND_STORAGE_KEY);
  console.log(`[Gymora Mobile API] Reset Base URL to default: ${LIVE_RENDER_API_URL}`);
};

let userToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  userToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.request.use(async (config) => {
  try {
    if (!config.headers.Authorization) {
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      } else {
        const storedToken = await AsyncStorage.getItem('@gymora_auth_token');
        if (storedToken) {
          userToken = storedToken;
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
      }
    }
  } catch (storageErr) {
    console.warn('[Gymora API] Interceptor storage token read warning:', storageErr);
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
