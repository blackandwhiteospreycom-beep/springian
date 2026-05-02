import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Initialize: check if user is already logged in
  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          // Token invalid or user deleted
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    // Response: { success: true, data: { id, email, role, token, ... } }
    const loginData = res.data;
    const { token: newToken, ...userData } = loginData;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password, company) => {
    const res = await authAPI.register({ name, email, password, company });
    // Auto-login after registration
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    const res = await authAPI.googleAuth(idToken);
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const completeOnboarding = useCallback(async (data) => {
    const res = await authAPI.completeOnboarding(data);
    const { token: newToken } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Refresh user profile
    const profileRes = await authAPI.getMe();
    const updatedUser = profileRes.data;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    googleLogin,
    logout,
    completeOnboarding,
    isAuthenticated: !!token,
    isSuperAdmin: user?.role === 'super_admin',
    isOrgAdmin: user?.role === 'org_admin',
    isManager: user?.role === 'manager',
    hasOrg: !!user?.org_id,
    services: user?.services || [],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
