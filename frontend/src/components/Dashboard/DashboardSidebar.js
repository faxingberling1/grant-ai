import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardSidebar = ({ isOpen, activePage, onPageChange, onToggle }) => {
  const { currentUser } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard', badge: null },
    { id: 'clients', icon: 'fas fa-users', label: 'Clients', badge: '3' },
    { id: 'grants', icon: 'fas fa-file-alt', label: 'Grants', badge: '24' },
    { id: 'submissions', icon: 'fas fa-paper-plane', label: 'Submissions', badge: '18' },
    { id: 'sources', icon: 'fas fa-database', label: 'Grant Sources', badge: null },
    { id: 'matching', icon: 'fas fa-robot', label: 'AI Matching', badge: 'New' },
    { id: 'ai-writing', icon: 'fas fa-pen-fancy', label: 'AI Writing', badge: null },
    { id: 'reports', icon: 'fas fa-chart-bar', label: 'Reports', badge: null },
  ];

  const bottomMenuItems = [
    { id: 'profile', icon: 'fas fa-user', label: 'My Profile' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' },
    { id: 'help', icon: 'fas fa-question-circle', label: 'Help & Support' },
  ];

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fas fa-hand-holding-usd"></i>
          <span className="logo-text">GrantFlow</span>
        </div>
        <button className="sidebar-close" onClick={onToggle}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* User Profile */}
      <div className="sidebar-profile">
        <img src={currentUser?.avatar} alt={currentUser?.name} className="profile-avatar" />
        <div className="profile-info">
          <div className="profile-name">{currentUser?.name}</div>
          <div className="profile-role">{currentUser?.role}</div>
        </div>
        <div className="profile-status online"></div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-label">MAIN MENU</div>
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => onPageChange(item.id)}
                >
                  <i className={item.icon}></i>
                  <span className="nav-text">{item.label}</span>
                  {item.badge && (
                    <span className={`nav-badge ${item.badge === 'New' ? 'new' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <div className="nav-label">ACCOUNT</div>
          <ul className="nav-menu">
            {bottomMenuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => onPageChange(item.id)}
                >
                  <i className={item.icon}></i>
                  <span className="nav-text">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="upgrade-banner">
          <div className="upgrade-icon">
            <i className="fas fa-crown"></i>
          </div>
          <div className="upgrade-content">
            <h4>Upgrade to Pro</h4>
            <p>Get advanced AI features</p>
            <button className="upgrade-btn">Upgrade Now</button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;