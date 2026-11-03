import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../api/client';

export type UserRole = 'GYM_OWNER' | 'TRAINER' | 'CUSTOMER';

export interface MobileUser {
  id: string;
  _id?: string;
  firstName: string;
  lastName?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  rawRole: string;
  gymId?: string;
  gymName?: string;
  branchId?: string;
  branchName?: string;
  avatarLetter: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  weight?: number;
  height?: number;
  fitnessGoal?: string;
}

interface AuthContextType {
  user: MobileUser | null;
  token: string | null;
  isAuthenticated: boolean;
  activeRole: UserRole | null;
  selectedPortalRole: UserRole;
  isLoading: boolean;
  setSelectedPortalRole: (role: UserRole) => void;
  login: (email: string, password: string, portalRole?: UserRole) => Promise<{ success: boolean; message?: string }>;
  registerCustomer: (data: any) => Promise<{ success: boolean; message?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  confirmPasswordReset: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const STORAGE_KEYS = {
  TOKEN: '@gymora_auth_token',
  USER: '@gymora_auth_user',
  PORTAL_ROLE: '@gymora_portal_role',
};

// Map backend role enum (Role.MEMBER, Role.TRAINER, Role.GYM_OWNER, Role.ADMIN) to Mobile UserRole
export const mapBackendRoleToMobile = (rawRole: string): UserRole => {
  const upper = (rawRole || '').toUpperCase();
  if (upper === 'MEMBER' || upper === 'CUSTOMER') return 'CUSTOMER';
  if (upper === 'TRAINER') return 'TRAINER';
  if (upper === 'GYM_OWNER' || upper === 'ADMIN' || upper === 'SUPER_ADMIN' || upper === 'GYM_MANAGER') return 'GYM_OWNER';
  return 'CUSTOMER';
};

export const mapMobileRoleToHuman = (role: UserRole): string => {
  switch (role) {
    case 'GYM_OWNER': return 'Gym Owner';
    case 'TRAINER': return 'Trainer';
    case 'CUSTOMER': return 'Customer';
  }
};

const formatMobileUser = (rawUser: any): MobileUser => {
  const role = mapBackendRoleToMobile(rawUser.role);
  const firstName = rawUser.firstName || rawUser.name?.split(' ')[0] || 'Member';
  const lastName = rawUser.lastName || (rawUser.name ? rawUser.name.split(' ').slice(1).join(' ') : '');
  const fullName = rawUser.name || `${firstName} ${lastName}`.trim();
  const avatarLetter = (firstName ? firstName.charAt(0) : 'G').toUpperCase();

  return {
    id: rawUser.id || rawUser._id || 'unknown',
    _id: rawUser._id || rawUser.id || 'unknown',
    firstName,
    lastName,
    name: fullName,
    email: rawUser.email || '',
    phone: rawUser.mobile || rawUser.phone || '',
    role,
    rawRole: rawUser.role || 'MEMBER',
    gymId: rawUser.gymId,
    gymName: rawUser.gymName || (rawUser.gymId ? 'Gymora Arena' : undefined),
    branchId: rawUser.branchId,
    branchName: rawUser.branchName,
    avatarLetter,
    subscriptionPlan: rawUser.subscriptionPlan || (role === 'CUSTOMER' ? 'Gold Annual Pass' : undefined),
    subscriptionStatus: rawUser.subscriptionStatus || 'Active',
    weight: rawUser.weight,
    height: rawUser.height,
    fitnessGoal: rawUser.fitnessGoal || rawUser.goal,
  };
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedPortalRole, setSelectedPortalRole] = useState<UserRole>('CUSTOMER');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from AsyncStorage on app mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedToken, savedUser, savedPortalRole] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.PORTAL_ROLE),
        ]);

        if (savedPortalRole && (savedPortalRole === 'GYM_OWNER' || savedPortalRole === 'TRAINER' || savedPortalRole === 'CUSTOMER')) {
          setSelectedPortalRole(savedPortalRole as UserRole);
        }

        if (savedToken && savedUser) {
          const parsedUser: MobileUser = JSON.parse(savedUser);
          setAuthToken(savedToken);
          setToken(savedToken);
          setUser(parsedUser);

          // Verify token validity in background with server
          api.get('/auth/me', { timeout: 7000 })
            .then(res => {
              if (res.data?.user) {
                const updated = formatMobileUser(res.data.user);
                setUser(updated);
                AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated)).catch(() => {});
              }
            })
            .catch(err => {
              if (err.response?.status === 401 || err.response?.status === 403) {
                console.warn('[Gymora Auth] Stored session is invalid or expired. Logging out.');
                logout();
              }
            });
        }
      } catch (err) {
        console.warn('[Gymora Auth] Session restoration error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleSetPortalRole = (role: UserRole) => {
    setSelectedPortalRole(role);
    AsyncStorage.setItem(STORAGE_KEYS.PORTAL_ROLE, role).catch(() => {});
  };

  const login = async (
    email: string, 
    password: string, 
    portalRole?: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res.data?.success || !res.data?.token || !res.data?.user) {
        return {
          success: false,
          message: res.data?.message || 'Login failed. Invalid response from server.',
        };
      }

      const rawUser = res.data.user;
      const userRole = mapBackendRoleToMobile(rawUser.role);
      const mobileUser = formatMobileUser(rawUser);

      // Save token and session
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mobileUser));
      await AsyncStorage.setItem(STORAGE_KEYS.PORTAL_ROLE, userRole);

      setAuthToken(res.data.token);
      setToken(res.data.token);
      setUser(mobileUser);
      setSelectedPortalRole(userRole);

      return { success: true };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        (err.message === 'Network Error' || !err.response
          ? 'Cannot connect to server. Please check your internet or Render backend.'
          : 'Login failed. Please verify your credentials.');

      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const registerCustomer = async (formData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.post('/auth/register', formData);

      if (!res.data?.success) {
        return {
          success: false,
          message: res.data?.message || 'Registration failed.',
        };
      }

      // If server returned direct login token
      if (res.data.token && res.data.user) {
        const mobileUser = formatMobileUser(res.data.user);
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mobileUser));

        setAuthToken(res.data.token);
        setToken(res.data.token);
        setUser(mobileUser);
        setSelectedPortalRole('CUSTOMER');
      }

      return { success: true, message: res.data.message || 'Registration successful!' };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        (err.message === 'Network Error' || !err.response
          ? 'Cannot connect to server. Please check your internet.'
          : 'Registration failed. Please check your details.');

      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/auth/forgot-password', { email: email.toLowerCase().trim() });
      return {
        success: true,
        message: res.data?.message || 'If an eligible account exists, you’ll receive password-reset instructions.'
      };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        (err.message === 'Network Error' || !err.response
          ? 'Cannot connect to authentication server. Please check your internet connection.'
          : 'Unable to process reset request. Please check email address.');
      return {
        success: false,
        message: errorMsg
      };
    }
  };

  const confirmPasswordReset = async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
        newPassword
      });
      return {
        success: true,
        message: res.data?.message || 'Password reset successfully. You can now log in with your new password.'
      };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        (err.message === 'Network Error' || !err.response
          ? 'Cannot connect to authentication server. Please check your internet connection.'
          : 'Failed to reset password. Please verify the code and try again.');
      return {
        success: false,
        message: errorMsg
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (err) {
      console.warn('[Gymora Auth] Logout storage clean error:', err);
    } finally {
      setAuthToken(null);
      setToken(null);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        const updated = formatMobileUser(res.data.user);
        setUser(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      }
    } catch (err) {
      console.warn('[Gymora Auth] Failed to refresh profile:', err);
    }
  };

  const isAuthenticated = Boolean(token && user);
  const activeRole = user ? user.role : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        activeRole,
        selectedPortalRole,
        isLoading,
        setSelectedPortalRole: handleSetPortalRole,
        login,
        registerCustomer,
        requestPasswordReset,
        confirmPasswordReset,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
