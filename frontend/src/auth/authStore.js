import { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await loadUserFromToken(token);
      } else {
        setLoading(false);
      }
    };
    
    initAuth();
  }, [token]); // Only depend on token, not the function

  const loadUserFromToken = async (tokenToUse = null) => {
    try {
      const currentToken = tokenToUse || token;
      if (!currentToken) {
        setLoading(false);
        return;
      }
      
      const response = await api.get('auth/me/', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login to:', api.defaults.baseURL + 'auth/login/');
      const response = await api.post('auth/login/', { email, password });
      console.log('Login response:', response);
      const newToken = response.data.access;
      
      // Set token first
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Then load user data with the new token
      const userResponse = await api.get('auth/me/', {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      setUser(userResponse.data);
      
      // Return user data for immediate use
      return userResponse.data;
    } catch (error) {
      console.error('Login error details:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData.error) {
          throw errorData.error;
        } else if (typeof errorData === 'string') {
          // Check if it's HTML error
          if (errorData.includes('<!doctype') || errorData.includes('<html')) {
            throw 'Server error: Login endpoint not found. Please contact support.';
          }
          throw errorData;
        } else {
          throw 'Invalid credentials. Please try again.';
        }
      } else if (error.request) {
        // Request made but no response
        throw 'Cannot connect to server. Please check your connection.';
      } else {
        // Something else happened
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
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isAdmin = () => {
    return user?.is_admin || false;
  };

  const isSuperAdmin = () => {
    return user?.is_super_admin || false;
  };

  const isBusinessOwner = () => {
    return user?.is_business_owner || false;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isBusinessOwner
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};