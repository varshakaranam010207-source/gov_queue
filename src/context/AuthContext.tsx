import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@shared/types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  internalLogin: (credentials: { email: string; password: string; portalHint?: 'STAFF' | 'ADMIN' }) => Promise<{ user: User; redirectUrl: string }>;
  register: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isCitizen: boolean;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await api.login(credentials);
    setUser(res.user);
    return res.user;
  };

  const internalLogin = async (credentials: { email: string; password: string; portalHint?: 'STAFF' | 'ADMIN' }): Promise<{ user: User; redirectUrl: string }> => {
    const res = await api.internalLogin(credentials);
    setUser(res.user);
    return res;
  };

  const register = async (data: { full_name: string; email: string; phone: string; password: string }): Promise<User> => {
    const res = await api.register(data);
    setUser(res.user);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const isCitizen = user?.role === 'CITIZEN';
  const isStaff = user?.role === 'STAFF';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        internalLogin,
        register,
        logout,
        refreshUser,
        isCitizen,
        isStaff,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
