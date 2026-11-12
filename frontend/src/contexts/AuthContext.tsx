import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface AuthUser {
  id: string;
  customerId?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gymId?: string;
  gymName?: string;
  branchId?: string;
  branchName?: string;
  trainerId?: string;
  trainerCode?: string;
  trainerStatus?: string;
  approvalStatus: string;
  subscriptionStatus: string;
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
  subscriptionStartDate?: string;
  subscriptionExpiryDate?: string;
  phone?: string;
  mobile?: string;
  profilePhoto?: string;
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
        setUser(parsed);

        // Sync with backend
        import('../utils/api').then(({ default: api }) => {
          api.get('/auth/me')
            .then(res => {
              if (res.data?.user) {
                const refreshed = { ...parsed, ...res.data.user };
                if (refreshed.mobile && !refreshed.phone) refreshed.phone = refreshed.mobile;
                if (refreshed.phone && !refreshed.mobile) refreshed.mobile = refreshed.phone;
                if (!refreshed.id && refreshed._id) refreshed.id = refreshed._id;

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
    if (authUser.mobile && !authUser.phone) authUser.phone = authUser.mobile;
    if (authUser.phone && !authUser.mobile) authUser.mobile = authUser.phone;
    if (!authUser.id && (authUser as any)._id) authUser.id = (authUser as any)._id;

    // Always clear both storages first to avoid stale token conflicts
    localStorage.removeItem('aigym_token');
    localStorage.removeItem('aigym_user');
    sessionStorage.removeItem('aigym_token');
    sessionStorage.removeItem('aigym_user');

    // Always use localStorage so token survives navigation (sessionStorage can lose data on navigate)
    localStorage.setItem('aigym_token', authToken);
    localStorage.setItem('aigym_user', JSON.stringify(authUser));
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
      if (updates.mobile && !updates.phone) updates.phone = updates.mobile;
      if (updates.phone && !updates.mobile) updates.mobile = updates.phone;
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
