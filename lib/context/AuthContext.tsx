'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, signup as apiSignup, pharmacySignup as apiPharmacySignup, logout as apiLogout } from '@/lib/api';

interface User {
  id: string;
  phone: string;
  name: string;
  role: 'user' | 'pharmacy' | 'admin';
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, phone: string, email: string, password: string) => Promise<void>;
  pharmacySignup: (
    name: string,
    phone: string,
    email: string,
    password: string,
    address: string,
    city: string,
    licenseNumber: string,
    latitude: number,
    longitude: number,
    captchaId: string,
    captchaAnswer: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with true to handle initial check
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const cachedUser = localStorage.getItem('user');

        if (token && cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
      } catch (e) {
        console.error('[AuthContext] Session restore failed:', e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin(email, password);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, phone: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiSignup(name, phone, email, password);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pharmacySignup = useCallback(async (
    name: string,
    phone: string,
    email: string,
    password: string,
    address: string,
    city: string,
    licenseNumber: string,
    latitude: number,
    longitude: number,
    captchaId: string,
    captchaAnswer: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPharmacySignup(
        name, phone, email, password, address, city, 
        licenseNumber, latitude, longitude, captchaId, captchaAnswer
      );
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Pharmacy registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('[AuthContext] API logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    signup,
    pharmacySignup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
