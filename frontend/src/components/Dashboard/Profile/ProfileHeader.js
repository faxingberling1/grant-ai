// frontend/src/components/Dashboard/Profile/ProfileHeader.js
import React from 'react';

const ProfileHeader = ({ user, onAvatarClick }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Safe defaults for user data
  const safeUser = {
    name: user?.name || 'User',
    title: user?.title || 'Grant Manager',
    organization: user?.organization || 'Organization',
    bio: user?.bio || 'No bio provided',
    stats: user?.stats || {
      grantsSubmitted: 0,
      successRate: 0,
      activeClients: 0
    }
  };

  return (
    <div className="profile-header">
      <div className="profile-header-content">
        <div 
          className="profile-avatar"
          onClick={onAvatarClick}
          title="Click to change avatar"
        >
          {getInitials(safeUser.name)}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{safeUser.name}</h1>
          <p className="profile-title">{safeUser.title} • {safeUser.organization}</p>
          <p>{safeUser.bio}</p>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{safeUser.stats.grantsSubmitted}</span>
              <span className="stat-label">Grants Submitted</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{safeUser.stats.successRate}%</span>
              <span className="stat-label">Success Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{safeUser.stats.activeClients}</span>
              <span className="stat-label">Active Clients</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;