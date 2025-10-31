import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardHeader = ({ onToggleSidebar, sidebarOpen, currentPage }) => {
  const { currentUser, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

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
    help: 'Help & Support'
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        
        <div className="page-info">
          <h1>{pageTitles[currentPage] || 'Dashboard'}</h1>
          <p>
            {currentPage === 'dashboard' 
              ? `Welcome back, ${currentUser?.name}! 👋`
              : `Manage your ${currentPage} efficiently`
            }
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Search Bar */}
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search grants, clients, or documents..." />
        </div>

        {/* Notifications */}
        <div className="notification-bell">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">3</span>
        </div>

        {/* User Menu */}
        <div className="user-menu" ref={userMenuRef}>
          <button 
            className="user-trigger"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <img src={currentUser?.avatar} alt={currentUser?.name} className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{currentUser?.name}</span>
              <span className="user-role">{currentUser?.role}</span>
            </div>
            <i className={`fas fa-chevron-${userMenuOpen ? 'up' : 'down'}`}></i>
          </button>

          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <img src={currentUser?.avatar} alt={currentUser?.name} />
                <div className="user-details">
                  <div className="user-name">{currentUser?.name}</div>
                  <div className="user-email">{currentUser?.email}</div>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <a href="#profile" className="dropdown-item">
                <i className="fas fa-user"></i>
                My Profile
              </a>
              <a href="#settings" className="dropdown-item">
                <i className="fas fa-cog"></i>
                Settings
              </a>
              <a href="#help" className="dropdown-item">
                <i className="fas fa-question-circle"></i>
                Help & Support
              </a>
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item logout-btn" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;