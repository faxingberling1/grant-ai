// src/context/AuthContext.js - COMPLETE UPDATED VERSION
import React, { createContext, useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasCheckedAuth = useRef(false);
  const isInitialMount = useRef(true);

  // Derived state - use this instead of separate isAuthenticated state
  const authState = useMemo(() => ({
    user: currentUser,
    token: authToken,
    isAuthenticated: !!currentUser && !!authToken,
    loading
  }), [currentUser, authToken, loading]);

  // Memoized checkAuth function
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      // If no token or user in localStorage, we're not authenticated
      if (!token || !userStr) {
        console.log('🔐 No stored auth data');
        setLoading(false);
        return;
      }
      
      setAuthToken(token);
      const parsedUser = JSON.parse(userStr);
      
      // Set user immediately for initial render, but don't set isAuthenticated yet
      setCurrentUser(parsedUser);
      
      // Verify with backend - this will determine if we're truly authenticated
      await verifyTokenWithBackend(token, parsedUser);
      
    } catch (error) {
      console.error('🔐 Auth initialization error:', error);
      // Don't logout on initial check - just mark as not authenticated
      setCurrentUser(null);
      setAuthToken(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const verifyTokenWithBackend = async (token, parsedUser) => {
    try {
      console.log('🔐 Verifying token with backend...');
      const response = await apiService.getCurrentUser();
      
      if (response.success && response.user) {
        console.log('🔐 Token verification successful');
        const updatedUser = {
          ...parsedUser,
          ...response.user,
          emailVerified: response.user.emailVerified !== undefined ? 
            response.user.emailVerified : 
            parsedUser.emailVerified || false,
          approved: response.user.approved !== undefined ? 
            response.user.approved : 
            parsedUser.approved || false
        };
        
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsAuthenticated(true);
      } else {
        console.log('🔐 Token verification failed - invalid token');
        // Token is invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setAuthToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.warn('🔐 Backend unavailable - using stored session:', error.message);
      // Backend is unavailable, use stored session but mark as authenticated
      // (This handles demo/offline mode)
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  // Initial auth check - only runs once
  useEffect(() => {
    if (!hasCheckedAuth.current) {
      console.log('🔐 Initial auth check');
      checkAuth();
      hasCheckedAuth.current = true;
    }
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login for:', email);
      
      const response = await apiService.login({ email, password });
      
      if (response.success) {
        const userData = {
          ...response.user,
          id: response.user?.id || response.user?._id || `user-${Date.now()}`,
          name: response.user?.name || email.split('@')[0],
          email: email,
          role: response.user?.role || 'user',
          emailVerified: response.user?.emailVerified !== undefined ? 
            response.user.emailVerified : 
            true,
          approved: response.user?.approved !== undefined ? 
            response.user.approved : 
            true
        };
        
        console.log('🔐 Login successful, setting user:', userData);
        
        setCurrentUser(userData);
        setAuthToken(response.token);
        setIsAuthenticated(true);
        
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        
        setLoading(false);
        return { 
          success: true, 
          user: userData,
          message: response.message,
          requiresVerification: response.requiresVerification
        };
      } else {
        console.log('🔐 Login failed:', response.message);
        setLoading(false);
        return { 
          success: false, 
          message: response.message,
          requiresVerification: response.requiresVerification
        };
      }
    } catch (error) {
      console.error('🔐 Login error:', error);
      setLoading(false);
      
      // Handle demo mode when backend is unavailable
      if (error.message.includes('Route not found') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network Error')) {
        
        console.warn('🔐 Backend unavailable - using demo mode');
        
        const isDemo = email === 'demo@grantfunds.com';
        
        const demoUser = {
          _id: 'demo-user-' + Date.now(),
          id: 'demo-user-' + Date.now(),
          name: isDemo ? 'Demo User' : email.split('@')[0],
          email: email,
          role: isDemo ? 'Grant Manager' : 'user',
          emailVerified: true,
          approved: true,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          company: isDemo ? 'Demo Organization' : '',
          phone: '',
          timezone: 'UTC',
          notifications: { email: true, reminders: true },
          lastLogin: new Date().toISOString(),
          storageStats: {
            used: isDemo ? 25000000 : 0,
            limit: isDemo ? 500000000 : 100000000,
            available: isDemo ? 475000000 : 100000000,
            percentage: isDemo ? 5 : 0,
            formatted: isDemo ? 
              { used: '25 MB', total: '500 MB', available: '475 MB', percentage: '5.0' } : 
              { used: '0 Bytes', total: '100 MB', available: '100 MB', percentage: '0.0' }
          },
          documentCount: isDemo ? 3 : 0,
          documentPreferences: {
            autoCategorize: true,
            defaultCategory: 'other',
            backupEnabled: true,
            versioningEnabled: true,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar']
          }
        };
        
        const demoToken = 'demo-token-' + Date.now();
        
        console.log('🔐 Demo login successful, setting user:', demoUser);
        
        setCurrentUser(demoUser);
        setAuthToken(demoToken);
        setIsAuthenticated(true);
        
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        return {
          success: true,
          user: demoUser,
          token: demoToken,
          message: 'Logged in successfully (demo mode)'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting registration for:', email);
      
      const response = await apiService.register({ name, email, password });
      
      if (response.success) {
        const userData = {
          ...response.user,
          id: response.user?.id || response.user?._id || `user-${Date.now()}`,
          name: name,
          email: email,
          role: response.user?.role || 'user',
          emailVerified: response.user?.emailVerified !== undefined ? 
            response.user.emailVerified : 
            false,
          approved: response.user?.approved !== undefined ? 
            response.user.approved : 
            false
        };
        
        console.log('🔐 Registration successful, setting user:', userData);
        
        setCurrentUser(userData);
        
        if (response.token) {
          setAuthToken(response.token);
          localStorage.setItem('token', response.token);
          setIsAuthenticated(true);
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        setLoading(false);
        
        return { 
          success: true, 
          user: userData,
          message: response.message,
          requiresVerification: response.requiresVerification,
          token: response.token
        };
      } else {
        console.log('🔐 Registration failed:', response.message);
        setLoading(false);
        return { 
          success: false, 
          message: response.message 
        };
      }
    } catch (error) {
      console.error('🔐 Registration error:', error);
      setLoading(false);
      
      // Handle demo mode when backend is unavailable
      if (error.message.includes('Route not found') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network Error')) {
        
        console.warn('🔐 Backend unavailable - using demo registration');
        
        const isDemo = email === 'demo@grantfunds.com';
        
        const demoUser = {
          _id: 'demo-user-' + Date.now(),
          id: 'demo-user-' + Date.now(),
          name: name,
          email: email,
          role: isDemo ? 'Grant Manager' : 'user',
          emailVerified: isDemo,
          approved: isDemo,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          company: '',
          phone: '',
          timezone: 'UTC',
          notifications: { email: true, reminders: true },
          lastLogin: new Date().toISOString(),
          storageStats: {
            used: 0,
            limit: isDemo ? 500000000 : 100000000,
            available: isDemo ? 500000000 : 100000000,
            percentage: 0,
            formatted: { 
              used: '0 Bytes', 
              total: isDemo ? '500 MB' : '100 MB', 
              available: isDemo ? '500 MB' : '100 MB', 
              percentage: '0.0' 
            }
          },
          documentCount: 0,
          documentPreferences: {
            autoCategorize: true,
            defaultCategory: 'other',
            backupEnabled: true,
            versioningEnabled: true,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar']
          }
        };
        
        const demoToken = 'demo-token-' + Date.now();
        
        console.log('🔐 Demo registration successful, setting user:', demoUser);
        
        setCurrentUser(demoUser);
        setAuthToken(demoToken);
        setIsAuthenticated(true);
        
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        return {
          success: true,
          user: demoUser,
          token: demoToken,
          message: 'Registered successfully (demo mode)',
          requiresVerification: !isDemo
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = useCallback(() => {
    console.log('🔐 Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    setLoading(false);
    
    // Clear any WebSocket connections or other resources
    window.location.href = '/login'; // Force redirect to login page
  }, []);

  const updateUser = useCallback((userData) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...userData };
    console.log('🔐 Updating user:', updatedUser);
    
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update isAuthenticated based on verification status if needed
    if (userData.emailVerified !== undefined || userData.approved !== undefined) {
      const shouldBeAuthenticated = 
        (userData.emailVerified !== undefined ? userData.emailVerified : currentUser.emailVerified) &&
        (userData.approved !== undefined ? userData.approved : currentUser.approved);
      
      setIsAuthenticated(shouldBeAuthenticated);
    }
  }, [currentUser]);

  const checkEmailVerified = useCallback(() => {
    return currentUser?.emailVerified === true;
  }, [currentUser]);

  const checkAccountApproved = useCallback(() => {
    return currentUser?.approved === true;
  }, [currentUser]);

  const getAccountStatus = useCallback(() => {
    if (!currentUser) return 'not_logged_in';
    
    if (!currentUser.emailVerified) return 'pending_verification';
    if (!currentUser.approved) return 'pending_approval';
    return 'active';
  }, [currentUser]);

  const resendVerificationEmail = async (email) => {
    try {
      const response = await apiService.resendVerificationEmail({ email });
      return { success: true, message: response.message };
    } catch (error) {
      console.error('🔐 Resend verification error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to resend verification email.'
      };
    }
  };

  const sendVerificationEmail = async () => {
    try {
      const response = await apiService.sendVerificationEmail();
      return { success: true, message: response.message };
    } catch (error) {
      console.error('🔐 Send verification error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to send verification email.'
      };
    }
  };

  const getVerificationStatus = async () => {
    try {
      const response = await apiService.getVerificationStatus();
      return { success: true, ...response };
    } catch (error) {
      console.error('🔐 Get verification status error:', error);
      return { 
        success: true,
        emailVerified: currentUser?.emailVerified || false,
        approved: currentUser?.approved || false,
        active: true,
        status: getAccountStatus()
      };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await apiService.verifyEmail(token);
      
      if (response.success) {
        const updatedUser = {
          ...currentUser,
          emailVerified: true,
          approved: response.user?.approved || currentUser?.approved || false,
          ...response.user
        };
        
        console.log('🔐 Email verification successful, updating user:', updatedUser);
        
        setCurrentUser(updatedUser);
        
        if (response.token) {
          setAuthToken(response.token);
          localStorage.setItem('token', response.token);
        }
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsAuthenticated(true);
        
        return { 
          success: true, 
          message: response.message,
          user: response.user,
          token: response.token
        };
      }
      
      return { 
        success: false, 
        message: response.message
      };
    } catch (error) {
      console.error('🔐 Verify email error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to verify email.'
      };
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentUser,
    authToken,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkEmailVerified,
    checkAccountApproved,
    getAccountStatus,
    resendVerificationEmail,
    sendVerificationEmail,
    getVerificationStatus,
    verifyEmail,
    // Add authState for components that want the derived state
    authState
  }), [
    currentUser,
    authToken,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkEmailVerified,
    checkAccountApproved,
    getAccountStatus,
    resendVerificationEmail,
    sendVerificationEmail,
    getVerificationStatus,
    verifyEmail,
    authState
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}