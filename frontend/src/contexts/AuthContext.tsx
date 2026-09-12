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
  approvalStatus: string;
  subscriptionStatus: string;
  subscriptionPlan?: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string, remember?: boolean) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
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
        setUser(JSON.parse(storedUser));
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

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
