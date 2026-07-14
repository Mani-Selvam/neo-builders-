import { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken, setUnauthorizedHandler } from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  const initStarted = useRef(false);

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    (async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, [clearSession]);

  // Periodic status check to log out inactive company accounts instantly
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await authApi.me();
      } catch (err) {
        if (err.response?.status === 401) {
          clearSession();
        }
      }
    }, 10000); // Check status every 10 seconds

    return () => clearInterval(interval);
  }, [user, clearSession]);

  const login = async (payload) => {
    const { data } = await authApi.login(payload);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const signup = async (payload) => {
    const { data } = await authApi.signup(payload);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  };

  const refreshUser = async () => {
    const { data } = await authApi.me();
    setUser(data.data);
    return data.data;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
