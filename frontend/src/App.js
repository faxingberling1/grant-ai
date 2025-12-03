// src/App.js - COMPLETE UPDATED VERSION
import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClientsProvider } from './context/ClientsContext';
import { TemplatesProvider } from './context/TemplatesContext';
import { NotificationProvider } from './context/NotificationContext';
import { DocumentsProvider } from './context/DocumentsContext';
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import VerifyEmail from './components/Login/VerifyEmail';
import PendingApproval from './components/Login/PendingApproval';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ClientsProvider>
          <TemplatesProvider>
            <NotificationProvider>
              <DocumentsProvider>
                <div className="App">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/pending-approval" element={<PendingApproval />} />
                    
                    {/* Protected Routes */}
                    <Route 
                      path="/dashboard/*" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </div>
              </DocumentsProvider>
            </NotificationProvider>
          </TemplatesProvider>
        </ClientsProvider>
      </AuthProvider>
    </Router>
  );
}

// Enhanced Protected Route Component with infinite loop prevention
function ProtectedRoute({ children }) {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Refs to track state without causing re-renders
  const hasRedirectedRef = useRef(false);
  const lastPathRef = useRef(location.pathname);
  const redirectCountRef = useRef(0);
  const authCheckCompleteRef = useRef(false);

  // Reset redirected flag when location changes (unless it's the same path)
  useEffect(() => {
    if (location.pathname !== lastPathRef.current) {
      hasRedirectedRef.current = false;
      lastPathRef.current = location.pathname;
      redirectCountRef.current = 0;
    }
  }, [location.pathname]);

  // Track redirect loops
  useEffect(() => {
    if (location.pathname === lastPathRef.current && authCheckCompleteRef.current) {
      redirectCountRef.current += 1;
      
      // If we've tried to redirect to the same path multiple times, break the loop
      if (redirectCountRef.current > 2) {
        console.error('🔄 INFINITE REDIRECT LOOP DETECTED at:', location.pathname);
        console.error('🔄 Breaking loop by forcing auth state reset');
        
        // Force clear auth state to break the loop
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?error=loop_detected';
        return;
      }
    }
    
    authCheckCompleteRef.current = true;
  }, [location.pathname]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <i className="fas fa-hand-holding-usd fa-3x"></i>
          <h2>Grant Funds CRM</h2>
          <p>Loading your dashboard...</p>
          <div className="loading-spinner"></div>
          <div className="loading-tip">
            <i className="fas fa-lightbulb"></i>
            <span>Email verification is required for full access</span>
          </div>
        </div>
      </div>
    );
  }

  // After loading is complete, check authentication
  // Check if user is authenticated
  if (!currentUser || !isAuthenticated) {
    // Prevent redirect loops
    if (location.pathname === '/login' || hasRedirectedRef.current) {
      // If we're already on login page or have already redirected, show a message
      return (
        <div className="loading-screen">
          <div className="loading-content">
            <i className="fas fa-exclamation-triangle fa-3x"></i>
            <h2>Authentication Required</h2>
            <p>Please log in to continue</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/login'}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: 'white',
                color: '#1a472a',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    
    console.log('🔐 ProtectedRoute: Not authenticated, redirecting to login');
    hasRedirectedRef.current = true;
    
    return (
      <Navigate 
        to="/login" 
        replace
        state={{ 
          from: location.pathname,
          message: 'Please login to access this page.',
          type: 'info'
        }} 
      />
    );
  }

  // Reset redirect tracking since we passed authentication check
  hasRedirectedRef.current = false;
  redirectCountRef.current = 0;

  // Check if email is verified
  if (!currentUser.emailVerified) {
    // Check if user is demo (demo accounts are auto-verified)
    if (currentUser.email === 'demo@grantfunds.com') {
      console.log('🔐 ProtectedRoute: Demo user detected, bypassing verification');
      return children;
    }
    
    // Don't redirect if we're already on the verification page
    if (location.pathname === '/verify-email') {
      console.log('🔐 ProtectedRoute: Already on verification page');
      return children;
    }
    
    console.log('🔐 ProtectedRoute: Email not verified, redirecting to verify-email');
    
    return (
      <Navigate 
        to="/verify-email" 
        replace
        state={{ 
          from: 'protected',
          email: currentUser.email,
          name: currentUser.name,
          message: 'Please verify your email to access the dashboard.'
        }} 
      />
    );
  }
  
  // Check if account is approved (for non-admin users)
  if (!currentUser.approved && currentUser.role !== 'admin') {
    // Don't redirect if we're already on the approval page
    if (location.pathname === '/pending-approval') {
      console.log('🔐 ProtectedRoute: Already on approval page');
      return children;
    }
    
    console.log('🔐 ProtectedRoute: Account not approved, redirecting to pending-approval');
    
    return (
      <Navigate 
        to="/pending-approval" 
        replace
        state={{ 
          email: currentUser.email,
          name: currentUser.name,
          message: 'Your account is pending admin approval.'
        }} 
      />
    );
  }
  
  // All checks passed - render the protected component
  console.log('🔐 ProtectedRoute: All checks passed, rendering content');
  return children;
}

export default App;