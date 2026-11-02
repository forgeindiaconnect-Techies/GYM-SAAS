import React, { createContext, useContext, useState } from 'react';
import { setAuthToken } from '../api/client';

export type UserRole = 'GYM_OWNER' | 'TRAINER' | 'CUSTOMER';

export interface MobileUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gymName?: string;
  avatarLetter: string;
}

interface AuthContextType {
  user: MobileUser;
  activeRole: UserRole;
  token: string | null;
  setRole: (role: UserRole) => void;
  loginDemo: (role: UserRole) => void;
  logout: () => void;
}

const DEMO_USERS: Record<UserRole, MobileUser> = {
  GYM_OWNER: {
    id: 'owner-1',
    name: 'Rajesh Sharma',
    email: 'owner@gymora.com',
    role: 'GYM_OWNER',
    gymName: 'Gymora Flagship Arena',
    avatarLetter: 'R',
  },
  TRAINER: {
    id: 'trainer-1',
    name: 'Vikram Malhotra',
    email: 'vikram.trainer@gymora.com',
    role: 'TRAINER',
    gymName: 'Gymora Flagship Arena',
    avatarLetter: 'V',
  },
  CUSTOMER: {
    id: 'customer-1',
    name: 'Naveen Kumar',
    email: 'naveen.k@gmail.com',
    role: 'CUSTOMER',
    gymName: 'Gymora Flagship Arena',
    avatarLetter: 'N',
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('GYM_OWNER');
  const [user, setUser] = useState<MobileUser>(DEMO_USERS['GYM_OWNER']);
  const [token, setToken] = useState<string | null>('demo_mobile_jwt_token');

  const setRole = (role: UserRole) => {
    setActiveRole(role);
    setUser(DEMO_USERS[role]);
  };

  const loginDemo = (role: UserRole) => {
    setActiveRole(role);
    setUser(DEMO_USERS[role]);
    setToken('demo_mobile_jwt_token');
    setAuthToken('demo_mobile_jwt_token');
  };

  const logout = () => {
    setToken(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, activeRole, token, setRole, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

