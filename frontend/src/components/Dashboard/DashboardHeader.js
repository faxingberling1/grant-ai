import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationBell from './Notifications/NotificationBell';
import './DashboardHeader.css';

// Helper function to generate initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

// Helper function to generate a consistent color based on name
const getAvatarColor = (name) => {
  if (!name) return '#6b8c6d';
  
  const colors = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#d35400', '#c0392b', '#16a085'
  ];
  
  const index = name.length % colors.length;
  return colors[index];
};

const DashboardHeader = ({ onToggleSidebar, sidebarOpen, currentPage }) => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const pageTitles = {
    dashboard: 'Dashboard Overview',
    clients: 'Client Management',
    grants: 'Grant Management',
    submissions: 'Grant Submissions',
    sources: 'Grant Sources',
    matching: 'AI Grant Matching',
    'ai-writing': 'AI Grant Writing',
    reports: 'Reports & Analytics',
    profile: 'My Profile',
    settings: 'Settings',
    help: 'Help & Support',
    notifications: 'Notifications'
  };

  // Generate user initials and color
  const userInitials = getInitials(currentUser?.name);
  const userAvatarColor = getAvatarColor(currentUser?.name);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    setSearchOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Search submitted');
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        
        <div className="page-info">
          <h1>{pageTitles[currentPage] || 'Dashboard'}</h1>
          <p className="welcome-message">
            {currentPage === 'dashboard' 
              ? `Welcome back, ${currentUser?.name || 'User'}! 👋`
              : `Manage your ${currentPage} efficiently`
            }
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Search Bar */}
        <div 
          className={`search-container ${searchOpen ? 'search-open' : ''}`}
          ref={searchRef}
        >
          <form onSubmit={handleSearchSubmit} className="search-bar">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search grants, clients, or documents..." 
              onFocus={handleSearchFocus}
              className="search-input"
            />
            {searchOpen && (
              <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </form>
          
          {/* Search Results Dropdown */}
          {searchOpen && (
            <div className="search-results">
              <div className="search-suggestions">
                <div className="suggestion-header">Quick Access</div>
                <a href="/clients" className="suggestion-item">
                  <i className="fas fa-users"></i>
                  Client Management
                </a>
                <a href="/grants" className="suggestion-item">
                  <i className="fas fa-file-invoice-dollar"></i>
                  Grant Applications
                </a>
                <a href="/ai-writing" className="suggestion-item">
                  <i className="fas fa-robot"></i>
                  AI Writing Assistant
                </a>
              </div>
              
              <div className="recent-searches">
                <div className="suggestion-header">Recent Searches</div>
                <button className="suggestion-item">
                  <i className="fas fa-history"></i>
                  Foundation grants 2024
                </button>
                <button className="suggestion-item">
                  <i className="fas fa-history"></i>
                  Client: Johnson Foundation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell with Real-time Updates */}
        <NotificationBell />

        {/* User Menu */}
        <div className="user-menu" ref={userMenuRef}>
          <button 
            className="user-trigger"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="user-avatar-container">
              <div 
                className="user-avatar-initials"
                style={{ backgroundColor: userAvatarColor }}
              >
                {userInitials}
              </div>
              {unreadCount > 0 && (
                <div className="user-status-indicator"></div>
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser?.name || 'User'}</span>
              <span className="user-role">{currentUser?.role || 'User'}</span>
            </div>
            <i className={`fas fa-chevron-${userMenuOpen ? 'up' : 'down'} dropdown-arrow`}></i>
          </button>

          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div 
                  className="dropdown-avatar-initials"
                  style={{ backgroundColor: userAvatarColor }}
                >
                  {userInitials}
                </div>
                <div className="user-details">
                  <div className="user-name">{currentUser?.name || 'User'}</div>
                  <div className="user-email">{currentUser?.email || 'user@example.com'}</div>
                  <div className="user-plan">Premium Plan</div>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <a href="/profile" className="dropdown-item">
                <i className="fas fa-user"></i>
                <span>My Profile</span>
                <i className="fas fa-chevron-right"></i>
              </a>
              <a href="/settings" className="dropdown-item">
                <i className="fas fa-cog"></i>
                <span>Settings</span>
                <i className="fas fa-chevron-right"></i>
              </a>
              <a href="/notifications" className="dropdown-item">
                <i className="fas fa-bell"></i>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="notification-indicator">{unreadCount}</span>
                )}
              </a>
              <a href="/help" className="dropdown-item">
                <i className="fas fa-question-circle"></i>
                <span>Help & Support</span>
                <i className="fas fa-chevron-right"></i>
              </a>
              
              <div className="dropdown-divider"></div>

              <div className="dropdown-section">
                <div className="section-title">Workspace</div>
                <a href="/team" className="dropdown-item">
                  <i className="fas fa-users"></i>
                  <span>Team Members</span>
                </a>
                <a href="/billing" className="dropdown-item">
                  <i className="fas fa-credit-card"></i>
                  <span>Billing & Plans</span>
                </a>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item logout-btn" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;