import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

export type UserRole = 'GYM_OWNER' | 'TRAINER' | 'CUSTOMER';

export interface MobileUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'GYM_OWNER' | 'ADMIN' | 'TRAINER' | 'MEMBER' | 'CUSTOMER';
  gymId?: string;
  gymName?: string;
  branchId?: string;
  branchName?: string;
  mobile?: string;
  phone?: string;
  profilePhoto?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  qrCode?: string;
}

interface AuthContextType {
  user: MobileUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole;
  login: (userData: MobileUser, token: string) => void;
  logout: () => void;
  updateUser: (fields: Partial<MobileUser>) => void;
  setRoleOverride: (role: UserRole) => void;
  loginAsDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);

  // Restore stored session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('gymora_mobile_token');
    const storedUser = localStorage.getItem('gymora_mobile_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored mobile user session', e);
      }
    }
    setIsLoading(false);

    // Listen for global 401 unauthorized events
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('gymora_mobile_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('gymora_mobile_unauthorized', handleUnauthorized);
  }, []);

  const login = (userData: MobileUser, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('gymora_mobile_token', newToken);
    localStorage.setItem('gymora_mobile_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRoleOverride(null);
    localStorage.removeItem('gymora_mobile_token');
    localStorage.removeItem('gymora_mobile_user');
  };

  const updateUser = (fields: Partial<MobileUser>) => {
    if (!user) return;
    const updated = { ...user, ...fields };
    setUser(updated);
    localStorage.setItem('gymora_mobile_user', JSON.stringify(updated));
  };

  // Quick Demo Logins for instant end-to-end testing
  const loginAsDemo = (role: UserRole) => {
    let demoUser: MobileUser;
    if (role === 'GYM_OWNER') {
      demoUser = {
        id: 'owner_demo_01',
        firstName: 'Vikram',
        lastName: 'Malhotra',
        email: 'owner@gymora.com',
        role: 'GYM_OWNER',
        gymId: 'gym_demo_01',
        gymName: 'Gymora Iron Arena',
        branchId: 'branch_demo_01',
        branchName: 'Downtown Flagship',
        mobile: '+91 98765 43210',
        subscriptionPlan: 'ENTERPRISE',
        subscriptionStatus: 'ACTIVE',
      };
    } else if (role === 'TRAINER') {
      demoUser = {
        id: 'trainer_demo_01',
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.trainer@gymora.com',
        role: 'TRAINER',
        gymId: 'gym_demo_01',
        gymName: 'Gymora Iron Arena',
        mobile: '+91 98223 11223',
        subscriptionPlan: 'PRO_COACH',
      };
    } else {
      demoUser = {
        id: 'customer_demo_01',
        firstName: 'Ananth',
        lastName: 'Kumar',
        email: 'ananth@gmail.com',
        role: 'MEMBER',
        gymId: 'gym_demo_01',
        gymName: 'Gymora Iron Arena',
        branchName: 'Downtown Flagship',
        mobile: '+91 94455 66778',
        subscriptionPlan: 'GOLD',
        subscriptionStatus: 'ACTIVE',
        qrCode: 'GYMORA-MEM-884920',
      };
    }
    const mockToken = `demo_jwt_token_${role.toLowerCase()}_${Date.now()}`;
    login(demoUser, mockToken);
  };

  // Determine active normalized role
  let activeRole: UserRole = 'CUSTOMER';
  if (roleOverride) {
    activeRole = roleOverride;
  } else if (user) {
    if (user.role === 'ADMIN' || user.role === 'GYM_OWNER') {
      activeRole = 'GYM_OWNER';
    } else if (user.role === 'TRAINER') {
      activeRole = 'TRAINER';
    } else {
      activeRole = 'CUSTOMER';
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        activeRole,
        login,
        logout,
        updateUser,
        setRoleOverride,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useMobileAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useMobileAuth must be used within an AuthProvider');
  }
  return context;
};

