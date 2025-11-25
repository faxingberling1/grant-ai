import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './DashboardSidebar.css'

const DashboardSidebar = ({ isOpen, activePage, onPageChange, onToggle }) => {
  const { currentUser } = useAuth();
  const [openDropdown, setOpenDropdown] = useState('communication'); // Open by default

  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard', badge: null },
    { id: 'clients', icon: 'fas fa-users', label: 'Clients', badge: '3' },
    { id: 'grants', icon: 'fas fa-file-alt', label: 'Grants', badge: '24' },
    { id: 'submissions', icon: 'fas fa-paper-plane', label: 'Submissions', badge: '18' },
    { id: 'sources', icon: 'fas fa-database', label: 'Grant Sources', badge: null },
    { id: 'matching', icon: 'fas fa-robot', label: 'AI Matching', badge: 'New' },
    { id: 'ai-writing', icon: 'fas fa-pen-fancy', label: 'AI Writing', badge: null },
    { 
      id: 'calendar', 
      icon: 'fas fa-calendar-alt', 
      label: 'Calendar', 
      badge: '5',
      hasDropdown: true,
      children: [
        { id: 'calendar', icon: 'fas fa-calendar-alt', label: 'Calendar View' },
        { id: 'upcoming', icon: 'fas fa-list', label: 'Upcoming Meetings', badge: '5' },
        { id: 'list', icon: 'fas fa-th-list', label: 'All Meetings', badge: '12' },
        { id: 'schedule-meeting', icon: 'fas fa-plus', label: 'Schedule Meeting' }
      ]
    },
    { 
      id: 'communication', 
      icon: 'fas fa-envelope', 
      label: 'Communication Hub', 
      badge: null,
      hasDropdown: true,
      children: [
        { id: 'email-templates', icon: 'fas fa-file-alt', label: 'Email Templates' },
        { id: 'email-composer', icon: 'fas fa-edit', label: 'Compose New Email' },
        { id: 'inbox', icon: 'fas fa-inbox', label: 'Inbox', badge: '5' },
        { id: 'sent', icon: 'fas fa-paper-plane', label: 'Sent' },
        { id: 'starred', icon: 'fas fa-star', label: 'Starred' },
        { id: 'spam', icon: 'fas fa-exclamation-triangle', label: 'Spam' },
        { id: 'trash', icon: 'fas fa-trash', label: 'Trash' },
        { id: 'drafts', icon: 'fas fa-file', label: 'Drafts', badge: '2' }
      ]
    },
    { id: 'reports', icon: 'fas fa-chart-bar', label: 'Reports', badge: null },
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { 
      id: 'user-management', 
      icon: 'fas fa-user-shield', 
      label: 'User Management', 
      badge: 'New',
      adminOnly: true
    }
  ];

  const bottomMenuItems = [
    { id: 'profile', icon: 'fas fa-user', label: 'My Profile' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' },
    { id: 'help', icon: 'fas fa-question-circle', label: 'Help & Support' },
  ];

  const handleDropdownToggle = (itemId) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  const handleSubItemClick = (itemId) => {
    onPageChange(itemId);
    // Optionally close the dropdown when a sub-item is selected on mobile
    if (window.innerWidth < 768) {
      setOpenDropdown(null);
    }
  };

  const isCommunicationActive = activePage && menuItems
    .find(item => item.id === 'communication')
    ?.children?.some(child => child.id === activePage);

  const isCalendarActive = activePage && menuItems
    .find(item => item.id === 'calendar')
    ?.children?.some(child => child.id === activePage);

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'admin@deleuxedesign.com';

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
          <div className="profile-role">
            {currentUser?.role}
            {isAdmin && <span className="admin-badge">Admin</span>}
          </div>
        </div>
        <div className="profile-status online"></div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-label">MAIN MENU</div>
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item.id} className={`nav-item ${item.hasDropdown ? 'has-dropdown' : ''}`}>
                <button
                  className={`nav-link ${activePage === item.id || 
                    (item.id === 'communication' && isCommunicationActive) || 
                    (item.id === 'calendar' && isCalendarActive) ? 'active' : ''}`}
                  onClick={() => item.hasDropdown ? handleDropdownToggle(item.id) : onPageChange(item.id)}
                >
                  <i className={item.icon}></i>
                  <span className="nav-text">{item.label}</span>
                  {item.badge && (
                    <span className={`nav-badge ${item.badge === 'New' ? 'new' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.hasDropdown && (
                    <i className={`dropdown-arrow fas fa-chevron-${openDropdown === item.id ? 'up' : 'down'}`}></i>
                  )}
                </button>
                
                {/* Dropdown Menu for Calendar */}
                {item.hasDropdown && item.id === 'calendar' && openDropdown === item.id && (
                  <div className="dropdown-container">
                    <ul className="dropdown-menu">
                      {item.children.map((child) => (
                        <li key={child.id} className="dropdown-item">
                          <button
                            className={`dropdown-link ${activePage === child.id ? 'active' : ''}`}
                            onClick={() => handleSubItemClick(child.id)}
                          >
                            <i className={child.icon}></i>
                            <span className="dropdown-text">{child.label}</span>
                            {child.badge && (
                              <span className="dropdown-badge">
                                {child.badge}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Dropdown Menu for Communication Hub */}
                {item.hasDropdown && item.id === 'communication' && openDropdown === item.id && (
                  <div className="dropdown-container">
                    <ul className="dropdown-menu">
                      {item.children.map((child) => (
                        <li key={child.id} className="dropdown-item">
                          <button
                            className={`dropdown-link ${activePage === child.id ? 'active' : ''}`}
                            onClick={() => handleSubItemClick(child.id)}
                          >
                            <i className={child.icon}></i>
                            <span className="dropdown-text">{child.label}</span>
                            {child.badge && (
                              <span className="dropdown-badge">
                                {child.badge}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
            
            {/* Admin-only menu items */}
            {isAdmin && adminMenuItems.map((item) => (
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