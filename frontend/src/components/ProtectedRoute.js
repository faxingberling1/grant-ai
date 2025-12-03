// src/components/ProtectedRoute.js - UPDATED VERSION
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './Common/LoadingScreen';

const ProtectedRoute = ({ 
  children, 
  requireVerification = true, 
  requireApproval = true,
  showLoading = true 
}) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  // Refs for tracking state
  const lastPathRef = useRef(location.pathname);
  const redirectAttemptsRef = useRef(0);
  const authCheckComplete = useRef(false);
  const timeoutRef = useRef(null);

  // Effect to handle authentication state changes
  useEffect(() => {
    console.log('🔐 ProtectedRoute: Auth state changed', {
      loading,
      isAuthenticated,
      hasUser: !!currentUser,
      path: location.pathname
    });

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If not loading, we can proceed with checks
    if (!loading) {
      setIsChecking(false);
      
      // Small delay to ensure state is stable
      timeoutRef.current = setTimeout(() => {
        authCheckComplete.current = true;
        setHasChecked(true);
      }, 100);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, isAuthenticated, currentUser, location.pathname]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isChecking) {
        console.warn('⏱️ ProtectedRoute: Safety timeout triggered - forcing check completion');
        setIsChecking(false);
        setHasChecked(true);
        authCheckComplete.current = true;
      }
    }, 10000); // 10 second timeout (increased from 5)

    return () => clearTimeout(safetyTimeout);
  }, [isChecking]);

  // Track navigation loops
  useEffect(() => {
    if (location.pathname === lastPathRef.current && hasChecked) {
      redirectAttemptsRef.current += 1;
      setRedirectAttempts(prev => prev + 1);
      
      if (redirectAttemptsRef.current > 3) {
        console.error('🔄 ProtectedRoute: Navigation loop detected!', {
          path: location.pathname,
          attempts: redirectAttemptsRef.current
        });
        
        // Break the loop by redirecting to a safe page
        if (location.pathname !== '/login') {
          navigate('/login', { 
            replace: true,
            state: { 
              from: location.pathname,
              error: 'Navigation loop detected. Please log in again.'
            }
          });
        }
      }
    } else {
      redirectAttemptsRef.current = 0;
      setRedirectAttempts(0);
    }
    
    lastPathRef.current = location.pathname;
  }, [location.pathname, hasChecked, navigate]);

  // Show loading state if still checking
  if (loading || isChecking) {
    if (showLoading) {
      return <LoadingScreen message="Checking authentication..." />;
    }
    return null; // Or a minimal loading indicator
  }

  // Debug log for current state
  console.log('🔐 ProtectedRoute: Check complete', {
    hasUser: !!currentUser,
    isAuthenticated,
    emailVerified: currentUser?.emailVerified,
    approved: currentUser?.approved,
    role: currentUser?.role,
    path: location.pathname
  });

  // If not authenticated, redirect to login
  if (!currentUser || !isAuthenticated) {
    console.log('🔐 ProtectedRoute: Not authenticated, redirecting to login');
    
    // Prevent redirect loops
    if (location.pathname === '/login') {
      console.log('🔐 ProtectedRoute: Already on login page');
      return children; // Should not happen, but safety check
    }
    
    // Store the attempted path for redirect after login
    const redirectPath = location.pathname !== '/login' && location.pathname !== '/' 
      ? location.pathname 
      : '/dashboard';
    
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: redirectPath,
          message: 'Please log in to access this page.',
          timestamp: Date.now() // Add timestamp to prevent caching issues
        }} 
        replace 
      />
    );
  }

  // Mark that we've completed our checks
  if (!hasChecked) {
    setHasChecked(true);
  }

  // For demo user, skip all additional checks
  if (currentUser.email === 'demo@grantfunds.com') {
    console.log('🔐 ProtectedRoute: Demo user detected, bypassing checks');
    return children;
  }

  // Define verification-related paths
  const verificationPaths = [
    '/verify-email',
    '/verification-sent',
    '/verify',
    '/verify-email/*',
    '/email-verification',
    '/verify-email-success',
    '/verify-email-pending'
  ];

  // Check if current path is a verification path
  const isOnVerificationPath = verificationPaths.some(path => {
    const basePath = path.replace('/*', '');
    return location.pathname.startsWith(basePath);
  });

  // Check email verification if required
  if (requireVerification && !currentUser.emailVerified) {
    console.log('🔐 ProtectedRoute: Email verification required but not verified');
    
    if (!isOnVerificationPath) {
      console.log('🔐 ProtectedRoute: Redirecting to verify-email');
      return (
        <Navigate 
          to="/verify-email" 
          state={{ 
            email: currentUser.email,
            name: currentUser.name,
            from: location.pathname,
            message: 'Please verify your email to access the dashboard.',
            timestamp: Date.now()
          }} 
          replace 
        />
      );
    }
    // If already on verification path, allow access
    console.log('🔐 ProtectedRoute: Already on verification path, allowing access');
  }

  // Define approval-related paths
  const approvalPaths = [
    '/pending-approval',
    '/approval-pending',
    '/waiting-for-approval',
    '/account-pending',
    '/admin-approval-pending'
  ];

  // Check if current path is an approval path
  const isOnApprovalPath = approvalPaths.some(path => 
    location.pathname.startsWith(path)
  );

  // Check account approval if required (skip for admins)
  if (requireApproval && !currentUser.approved && currentUser.role !== 'admin') {
    console.log('🔐 ProtectedRoute: Account approval required but not approved');
    
    if (!isOnApprovalPath) {
      console.log('🔐 ProtectedRoute: Redirecting to pending-approval');
      return (
        <Navigate 
          to="/pending-approval" 
          state={{ 
            email: currentUser.email,
            name: currentUser.name,
            from: location.pathname,
            message: 'Your account is pending approval. Please wait for an administrator to approve your account.',
            timestamp: Date.now()
          }} 
          replace 
        />
      );
    }
    // If already on approval path, allow access
    console.log('🔐 ProtectedRoute: Already on approval path, allowing access');
  }

  // All checks passed - render the protected content
  console.log('🔐 ProtectedRoute: All checks passed, rendering protected content');
  return children;
};

// Add display name for debugging
ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;