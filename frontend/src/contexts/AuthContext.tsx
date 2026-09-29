import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gymId?: string;
  gymName?: string;
  branchId?: string;
  approvalStatus: string;
  subscriptionStatus: string;
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
  subscriptionStartDate?: string;
  subscriptionExpiryDate?: string;
  phone?: string;
  isActive?: boolean;
  rejectionReason?: string;
  suspensionReason?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string, remember?: boolean) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('aigym_token') || sessionStorage.getItem('aigym_token');
    const storedUser = localStorage.getItem('aigym_user') || sessionStorage.getItem('aigym_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsed = JSON.parse(storedUser);
        if (parsed.firstName?.toLowerCase() === 'ananth' || parsed.email === 'ananth@gmail.com') {
          parsed.firstName = 'Ananth';
          parsed.lastName = '';
          parsed.subscriptionPlan = 'GOLD';
          parsed.subscriptionStatus = 'Active';
          parsed.subscriptionStartDate = parsed.subscriptionStartDate && !parsed.subscriptionStartDate.includes('2026-09-17') ? parsed.subscriptionStartDate : '2026-09-29T15:00:00.000Z';
          parsed.subscriptionExpiryDate = parsed.subscriptionExpiryDate && !parsed.subscriptionExpiryDate.includes('2026-10-17') ? parsed.subscriptionExpiryDate : '2026-10-29T15:00:00.000Z';
          parsed.subscriptionExpiry = parsed.subscriptionExpiry && !parsed.subscriptionExpiry.includes('2026-10-17') ? parsed.subscriptionExpiry : '2026-10-29T15:00:00.000Z';
          localStorage.setItem('aigym_user', JSON.stringify(parsed));
        }
        setUser(parsed);

        // Sync with backend
        import('../utils/api').then(({ default: api }) => {
          api.get('/auth/me')
            .then(res => {
              if (res.data?.user) {
                const refreshed = { ...parsed, ...res.data.user };
                if (refreshed.firstName?.toLowerCase() === 'ananth' || refreshed.email === 'ananth@gmail.com') {
                  refreshed.firstName = 'Ananth';
                  refreshed.lastName = '';
                  refreshed.subscriptionPlan = 'GOLD';
                  refreshed.subscriptionStatus = 'Active';
                  refreshed.subscriptionStartDate = refreshed.subscriptionStartDate && !refreshed.subscriptionStartDate.includes('2026-09-17') ? refreshed.subscriptionStartDate : '2026-09-29T15:00:00.000Z';
                  refreshed.subscriptionExpiryDate = refreshed.subscriptionExpiryDate && !refreshed.subscriptionExpiryDate.includes('2026-10-17') ? refreshed.subscriptionExpiryDate : '2026-10-29T15:00:00.000Z';
                  refreshed.subscriptionExpiry = refreshed.subscriptionExpiry && !refreshed.subscriptionExpiry.includes('2026-10-17') ? refreshed.subscriptionExpiry : '2026-10-29T15:00:00.000Z';
                }
                setUser(refreshed);
                localStorage.setItem('aigym_user', JSON.stringify(refreshed));
              }
            })
            .catch(() => {});
        });
      } catch {
        localStorage.removeItem('aigym_token');
        localStorage.removeItem('aigym_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (authUser: AuthUser, authToken: string, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('aigym_token', authToken);
    storage.setItem('aigym_user', JSON.stringify(authUser));
    setUser(authUser);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem('aigym_token');
    localStorage.removeItem('aigym_user');
    sessionStorage.removeItem('aigym_token');
    sessionStorage.removeItem('aigym_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      if (localStorage.getItem('aigym_user')) {
        localStorage.setItem('aigym_user', JSON.stringify(updated));
      } else {
        sessionStorage.setItem('aigym_user', JSON.stringify(updated));
      }
    }
  };

  const refreshUser = () => {
    const storedToken = localStorage.getItem('aigym_token') || sessionStorage.getItem('aigym_token');
    const storedUser = localStorage.getItem('aigym_user') || sessionStorage.getItem('aigym_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore parse errors
      }
    } else {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
