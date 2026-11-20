import axios from 'axios';
import type { AxiosResponse } from 'axios';

export const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) {
      return `http://${host}:5600/api`;
    }
    return 'https://gym-saas-vu70.onrender.com/api';
  }
  return 'http://localhost:5600/api';
};

export const getServerOrigin = () => getBaseUrl().replace(/\/api\/?$/, '');

export const getAssetUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `${getServerOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aigym_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cache structures for ultra-fast sidebar navigation (0ms instant response)
interface CacheEntry {
  data: any;
  status: number;
  statusText: string;
  headers: any;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<AxiosResponse<any>>>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes max freshness
const STALE_AFTER_MS = 15 * 1000; // 15 seconds: serve instant cached data, revalidate silently in background

const getSessionCache = (key: string): CacheEntry | null => {
  try {
    const raw = sessionStorage.getItem(`@gym_cache_${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(`@gym_cache_${key}`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const setSessionCache = (key: string, entry: CacheEntry) => {
  try {
    sessionStorage.setItem(`@gym_cache_${key}`, JSON.stringify(entry));
  } catch {
    // If quota exceeded, clean up half of the oldest cache entries to free up space
    try {
      const keys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('@gym_cache_')) keys.push(k);
      }
      keys.slice(0, Math.ceil(keys.length / 2)).forEach(k => sessionStorage.removeItem(k));
      sessionStorage.setItem(`@gym_cache_${key}`, JSON.stringify(entry));
    } catch {
      // Quota limits ignored
    }
  }
};

const getCacheKey = (url: string, config?: any) => {
  const paramsKey = config?.params ? JSON.stringify(config.params) : '';
  return `${url}::${paramsKey}`;
};

// Invalidate cache on mutations (POST, PUT, PATCH, DELETE)
const invalidateByUrl = (url: string) => {
  const cleanUrl = url.replace(/^\/api/, '');
  const match = cleanUrl.match(/^\/([a-zA-Z0-9_-]+)/);
  if (!match) return;
  const prefix = match[1];

  for (const k of memoryCache.keys()) {
    if (k.includes(prefix)) {
      memoryCache.delete(k);
    }
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('@gym_cache_') && k.includes(prefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {}
};

// Handle 401 and deactivated account 403 globally
api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toLowerCase();
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      invalidateByUrl(response.config?.url || '');
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;
    if (
      status === 401 ||
      (status === 403 && (errorCode === 'ACCOUNT_INACTIVE' || errorCode === 'TRAINER_INACTIVE' || errorCode === 'TRAINER_NOT_FOUND'))
    ) {
      localStorage.removeItem('aigym_token');
      localStorage.removeItem('aigym_user');
      sessionStorage.removeItem('aigym_token');
      sessionStorage.removeItem('aigym_user');
      sessionStorage.removeItem('gymora_active_path');
      sessionStorage.removeItem('gymora_nav_permitted');
      sessionStorage.removeItem('gymora_nav_timestamp');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        const path = window.location.pathname;
        let loginUrl = '/login';
        if (path.startsWith('/super-admin')) loginUrl = '/login?portal=super-admin';
        else if (path.startsWith('/member')) loginUrl = '/login?portal=customer';
        else if (path.startsWith('/admin')) loginUrl = '/login?portal=gym-owner';
        else if (path.startsWith('/trainer')) loginUrl = '/login?portal=trainer';
        window.location.href = loginUrl;
      }
    }
    return Promise.reject(error);
  }
);

// High-performance Stale-While-Revalidate GET wrapper
const originalGet = api.get.bind(api);

api.get = function <T = any, R = AxiosResponse<T>, D = any>(
  url: string,
  config?: any
): Promise<any> {
  const skipCache = config?.skipCache || config?.headers?.['x-skip-cache'];
  if (skipCache) {
    return originalGet(url, config);
  }

  const cacheKey = getCacheKey(url, config);
  const now = Date.now();

  // 1. Check memory cache or session cache for instant 0ms return
  let cached = memoryCache.get(cacheKey);
  if (!cached) {
    cached = getSessionCache(cacheKey) || undefined;
    if (cached) memoryCache.set(cacheKey, cached);
  }

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    const cachedResponse: any = {
      data: cached.data,
      status: cached.status,
      statusText: cached.statusText,
      headers: { ...cached.headers, 'x-from-cache': 'true' },
      config: config || {},
      request: {},
    };

    // If data is getting older than STALE_AFTER_MS, silently update in background
    if (now - cached.timestamp > STALE_AFTER_MS && !inFlightRequests.has(cacheKey)) {
      const bgPromise = originalGet(url, config)
        .then((freshRes) => {
          const entry: CacheEntry = {
            data: freshRes.data,
            status: freshRes.status,
            statusText: freshRes.statusText,
            headers: freshRes.headers,
            timestamp: Date.now(),
          };
          memoryCache.set(cacheKey, entry);
          setSessionCache(cacheKey, entry);
          return freshRes;
        })
        .catch(() => {})
        .finally(() => {
          inFlightRequests.delete(cacheKey);
        });
      inFlightRequests.set(cacheKey, bgPromise as any);
    }

    // Immediately resolve with cached data
    return Promise.resolve(cachedResponse as R);
  }

  // 2. If a request for this exact endpoint is already in flight, reuse the promise
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<R>;
  }

  // 3. Make real network request, store in cache, and return
  const reqPromise = originalGet(url, config)
    .then((res) => {
      const entry: CacheEntry = {
        data: res.data,
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        timestamp: Date.now(),
      };
      memoryCache.set(cacheKey, entry);
      setSessionCache(cacheKey, entry);
      return res;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, reqPromise);
  return reqPromise as Promise<R>;
};

// Expose cache utilities
(api as any).prefetch = (url: string, config?: any) => {
  api.get(url, config).catch(() => {});
};

(api as any).invalidateCache = (pattern: string) => {
  for (const k of memoryCache.keys()) {
    if (k.includes(pattern)) memoryCache.delete(k);
  }
};

(api as any).clearCache = () => {
  memoryCache.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('@gym_cache_')) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {}
};

export default api;
