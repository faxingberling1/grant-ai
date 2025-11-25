import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Use the same API URL as your API service
  const API_URL = process.env.REACT_APP_API_URL || 'https://grant-ai.onrender.com';

  useEffect(() => {
    // Use 'token' and 'user' to match API service expectations
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setIsAuthenticated(true);
      } else {
        // If backend verification fails, check if we have demo data
        const user = localStorage.getItem('user');
        if (user) {
          console.log('Using existing session - backend may be unavailable');
          setIsAuthenticated(true);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // For deployment, don't auto-logout on network errors
      // Allow demo mode to work
      const user = localStorage.getItem('user');
      if (user) {
        console.log('Backend unavailable, using existing session');
        setIsAuthenticated(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Handle non-JSON responses (like 502 errors from Render)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        // Use 'token' and 'user' to match API service expectations
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // For deployment: provide demo login when backend is down
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('non-JSON response') ||
          error.message.includes('Route not found')) {
        console.warn('Backend unavailable - using demo login');
        
        const demoUser = {
          _id: 'demo-user-' + Date.now(),
          name: 'Demo User',
          email: email,
          role: 'user'
        };
        const demoToken = 'demo-token-' + Date.now();
        
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setCurrentUser(demoUser);
        setIsAuthenticated(true);
        
        return { 
          success: true, 
          message: 'Logged in successfully (demo mode - backend unavailable)' 
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        // Use 'token' and 'user' to match API service expectations
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      // For deployment: provide demo registration when backend is down
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('non-JSON response') ||
          error.message.includes('Route not found')) {
        console.warn('Backend unavailable - using demo registration');
        
        const demoUser = {
          _id: 'demo-user-' + Date.now(),
          name: name,
          email: email,
          role: 'user'
        };
        const demoToken = 'demo-token-' + Date.now();
        
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setCurrentUser(demoUser);
        setIsAuthenticated(true);
        
        return { 
          success: true, 
          message: 'Registered successfully (demo mode - backend unavailable)' 
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.' 
      };
    }
  };

  const logout = () => {
    // Use 'token' and 'user' to match API service expectations
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}