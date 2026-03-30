import React, { createContext, useState, useContext, useCallback } from 'react';
import { login as loginApi, logout as logoutApi } from '../api/auth';
import { getToken, setToken, getUser, setUser, clearAuth } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => getUser());
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await loginApi(credentials);
      debugger;
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      setTokenState(newToken);
      setUserState(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch {}
    clearAuth();
    setTokenState(null);
    setUserState(null);
  }, []);

  const updateUserData = useCallback((userData) => {
    setUser(userData);
    setUserState(userData);
  }, []);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, isManager, login, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
