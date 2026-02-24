import { useState, useEffect, useCallback } from 'react';
import { login, signup, logout as apiLogout } from '@/lib/api';

interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (phone: string, password: string) => Promise<void>;
  signup: (name: string, phone: string, password: string) => Promise<void>;
  pharmacySignup: (
    name: string,
    phone: string,
    email: string,
    password: string,
    address: string,
    city: string,
    licenseNumber: string,
    latitude: number,
    longitude: number
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const cachedUser = localStorage.getItem('user');

      if (token && cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          console.error('[v0] Failed to parse cached user:', e);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, []);

  const handleLogin = useCallback(async (phone: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[v0] Attempting login with phone:', phone);
      const response = await login(phone, password);
      console.log('[v0] Login response:', response);

      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (err: any) {
      console.error('[v0] Login error:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignup = useCallback(async (name: string, phone: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[v0] Attempting signup with phone:', phone);
      const response = await signup(name, phone, password);
      console.log('[v0] Signup response:', response);

      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (err: any) {
      console.error('[v0] Signup error:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePharmacySignup = useCallback(
    async (
      name: string,
      phone: string,
      email: string,
      password: string,
      address: string,
      city: string,
      licenseNumber: string,
      latitude: number,
      longitude: number
    ) => {
      setLoading(true);
      setError(null);

      try {
        console.log('[v0] Attempting pharmacy signup with phone:', phone);
        const { pharmacySignup: apiPharmacySignup } = await import('@/lib/api');
        const response = await apiPharmacySignup(
          name,
          phone,
          email,
          password,
          address,
          city,
          licenseNumber,
          latitude,
          longitude
        );
        console.log('[v0] Pharmacy signup response:', response);

        setUser(response.user);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      } catch (err: any) {
        console.error('[v0] Pharmacy signup error:', err);
        const errorMessage = err?.response?.data?.message || err.message || 'Pharmacy registration failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleLogout = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await apiLogout();
      }
    } catch (err) {
      console.error('[v0] Logout API error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login: handleLogin,
    signup: handleSignup,
    pharmacySignup: handlePharmacySignup,
    logout: handleLogout,
    clearError,
  };
}
