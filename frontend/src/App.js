// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClientsProvider } from './context/ClientsContext';
import { TemplatesProvider } from './context/TemplatesContext';
import { NotificationProvider } from './context/NotificationContext';
import { DocumentsProvider } from './context/DocumentsContext';
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ClientsProvider>
        <TemplatesProvider>
          <NotificationProvider>
            <DocumentsProvider>
              <Router>
                <div className="App">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route 
                      path="/dashboard/*" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </div>
              </Router>
            </DocumentsProvider>
          </NotificationProvider>
        </TemplatesProvider>
      </ClientsProvider>
    </AuthProvider>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <i className="fas fa-hand-holding-usd"></i>
          <h2>GrantFlow CRM</h2>
          <p>Loading...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default App;