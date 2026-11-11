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
      const cleaned = savedUrl.trim().replace(/\/+$/, '');
      const finalUrl = cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
      api.defaults.baseURL = finalUrl;
      console.log(`[Gymora Mobile API] Restored Custom Base URL: ${finalUrl}`);
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
  // Normalize baseURL to ensure it always ends with /api
  if (config.baseURL) {
    const cleanBase = config.baseURL.trim().replace(/\/+$/, '');
    config.baseURL = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;
  }

  // Prevent accidental double /api prefix (e.g. /api/api/...)
  if (config.url && config.url.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '');
  }

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

const recentErrorLogs = new Map<string, number>();

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || 'unknown';
    const method = (error?.config?.method || 'get').toUpperCase();
    const errKey = `${method}:${url}:${status || error.message}`;
    const now = Date.now();
    const lastLogged = recentErrorLogs.get(errKey) || 0;

    // Log the error with method and endpoint, throttling identical repeated calls within 3s
    if (now - lastLogged > 3000) {
      recentErrorLogs.set(errKey, now);
      console.log(`[Gymora Mobile API Error]: ${status || error.message} on ${method} ${url}`);
    }
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

export const getActiveServerOrigin = (): string => {
  return getActiveBaseUrl().replace(/\/api\/?$/, '');
};

export const resolveMediaUrl = (url?: string | null): string | undefined => {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  if (/^(data|file|content|ph|asset):/i.test(trimmed)) {
    return trimmed;
  }

  const origin = getActiveServerOrigin();

  if (trimmed.startsWith('/')) {
    return `${origin}${trimmed}`;
  }

  const localMatch = trimmed.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)$/i);
  if (localMatch) {
    return `${origin}${localMatch[3]}`;
  }

  return trimmed;
};

export default api;
