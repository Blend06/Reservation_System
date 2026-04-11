import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // Schedule a silent token refresh 30 minutes before expiry (10h - 30min = 9.5h)
  const scheduleRefresh = (accessToken) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const REFRESH_IN_MS = (10 * 60 - 30) * 60 * 1000; // 9.5 hours
    refreshTimerRef.current = setTimeout(() => silentRefresh(), REFRESH_IN_MS);
  };

  const silentRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) { logout(); return; }
    try {
      const res = await api.post('auth/refresh/', { refresh: refreshToken });
      const newAccess = res.data.access;
      localStorage.setItem('token', newAccess);
      setToken(newAccess);
      scheduleRefresh(newAccess);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const appVersion = localStorage.getItem('appVersion');
      const currentVersion = '1.0.1'; // Increment this to force logout on all clients
      
      // Force logout if version mismatch (clears stale tokens)
      if (appVersion !== currentVersion) {
        console.log('App version changed, clearing old session');
        localStorage.clear();
        localStorage.setItem('appVersion', currentVersion);
        setLoading(false);
        return;
      }
      
      console.log('Initializing auth, token exists:', !!storedToken);
      
      if (storedToken) {
        await loadUserFromToken(storedToken);
        scheduleRefresh(storedToken);
      } else {
        console.log('No token found, skipping auth check');
        setLoading(false);
      }
    };
    initAuth();
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserFromToken = async (tokenToUse = null) => {
    try {
      const currentToken = tokenToUse || token;
      if (!currentToken) { setLoading(false); return; }
      const response = await api.get('auth/me/', {
        headers: { Authorization: `Bearer ${currentToken}` },
        timeout: 30000 // 30 second timeout for auth check (handles cold starts)
      });
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error.message);
      // Try silent refresh before giving up
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await api.post('auth/refresh/', { refresh: refreshToken }, { timeout: 30000 });
          const newAccess = res.data.access;
          localStorage.setItem('token', newAccess);
          setToken(newAccess);
          const userRes = await api.get('auth/me/', {
            headers: { Authorization: `Bearer ${newAccess}` },
            timeout: 30000
          });
          setUser(userRes.data);
          scheduleRefresh(newAccess);
          return;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError.message);
          // If refresh fails, clear everything and let user login fresh
          console.log('Clearing invalid tokens');
        }
      }
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('auth/login/', { email, password });
      const newToken = response.data.access;
      const newRefresh = response.data.refresh;

      localStorage.setItem('token', newToken);
      if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
      setToken(newToken);
      scheduleRefresh(newToken);

      const userResponse = await api.get('auth/me/', {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      setUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData.error) throw errorData.error;
        else if (typeof errorData === 'string') {
          if (errorData.includes('<!doctype') || errorData.includes('<html'))
            throw 'Server error: Login endpoint not found. Please contact support.';
          throw errorData;
        } else throw 'Invalid credentials. Please try again.';
      } else if (error.request) {
        throw 'Cannot connect to server. Please check your connection.';
      } else {
        throw 'Login failed. Please try again.';
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('auth/register/', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const logout = () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const isAuthenticated = () => !!token && !!user;
  const isAdmin = () => user?.is_admin || false;
  const isSuperAdmin = () => user?.is_super_admin || false;
  const isBusinessOwner = () => user?.is_business_owner || false;

  const value = {
    user, token, loading,
    login, register, logout,
    isAuthenticated, isAdmin, isSuperAdmin, isBusinessOwner
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};