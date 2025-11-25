import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the apiService instead of direct fetch
      const response = await apiService.getUsers();
      
      // Handle different response formats
      if (response.success && Array.isArray(response.users)) {
        setUsers(response.users);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.warn('Unexpected response format:', response);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setError('');
      setSuccess('');
      
      // Use the admin approve endpoint
      const response = await apiService.request(`/api/admin/users/${userId}/approve`, {
        method: 'POST'
      });

      if (response.success) {
        // Update the user in the list
        setUsers(users.map(user => 
          user._id === userId ? { ...user, approved: true } : user
        ));
        setSuccess('User approved successfully!');
      } else {
        throw new Error(response.message || 'Failed to approve user');
      }
    } catch (err) {
      console.error('Error approving user:', err);
      setError(err.message);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject and delete this user?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await apiService.request(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        data: {
          reason: 'Rejected by administrator'
        }
      });

      if (response.success) {
        // Remove the user from the list
        setUsers(users.filter(user => user._id !== userId));
        setSuccess('User rejected successfully!');
      } else {
        throw new Error(response.message || 'Failed to reject user');
      }
    } catch (err) {
      console.error('Error rejecting user:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await apiService.deleteUser(userId);

      if (response.success) {
        // Remove the user from the list
        setUsers(users.filter(user => user._id !== userId));
        setSuccess('User deleted successfully!');
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message);
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await apiService.request(`/api/admin/users/${userId}/make-admin`, {
        method: 'POST'
      });

      if (response.success) {
        // Update the user in the list
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: 'admin' } : user
        ));
        setSuccess('User promoted to admin successfully!');
      } else {
        throw new Error(response.message || 'Failed to make user admin');
      }
    } catch (err) {
      console.error('Error making user admin:', err);
      setError(err.message);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  const pendingUsers = users.filter(user => !user.approved);
  const approvedUsers = users.filter(user => user.approved && user.role !== 'admin');
  const adminUsers = users.filter(user => user.role === 'admin');

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h1>User Management</h1>
        <p>Manage user registrations and permissions</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Success:</strong> {success}
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      <div className="users-stats">
        <div className="stat-card total">
          <h3>Total Users</h3>
          <p className="stat-number">{users.length}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending Approval</h3>
          <p className="stat-number">{pendingUsers.length}</p>
        </div>
        <div className="stat-card approved">
          <h3>Approved Users</h3>
          <p className="stat-number">{approvedUsers.length}</p>
        </div>
        <div className="stat-card admin">
          <h3>Admin Users</h3>
          <p className="stat-number">{adminUsers.length}</p>
        </div>
      </div>

      <div className="users-section">
        <div className="section-header">
          <h2>Pending Approval ({pendingUsers.length})</h2>
          {pendingUsers.length > 0 && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={fetchUsers}
            >
              Refresh
            </button>
          )}
        </div>
        {pendingUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No users pending approval</p>
          </div>
        ) : (
          <div className="users-grid">
            {pendingUsers.map(user => (
              <UserCard 
                key={user._id} 
                user={user} 
                onApprove={handleApprove}
                onReject={handleReject}
                onMakeAdmin={handleMakeAdmin}
                showActions={true}
                type="pending"
              />
            ))}
          </div>
        )}
      </div>

      <div className="users-section">
        <div className="section-header">
          <h2>Approved Users ({approvedUsers.length})</h2>
          {approvedUsers.length > 0 && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={fetchUsers}
            >
              Refresh
            </button>
          )}
        </div>
        {approvedUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>No approved users</p>
          </div>
        ) : (
          <div className="users-grid">
            {approvedUsers.map(user => (
              <UserCard 
                key={user._id} 
                user={user} 
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onMakeAdmin={handleMakeAdmin}
                showActions={true}
                type="approved"
              />
            ))}
          </div>
        )}
      </div>

      <div className="users-section">
        <div className="section-header">
          <h2>Admin Users ({adminUsers.length})</h2>
          {adminUsers.length > 0 && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={fetchUsers}
            >
              Refresh
            </button>
          )}
        </div>
        {adminUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👑</div>
            <p>No admin users</p>
          </div>
        ) : (
          <div className="users-grid">
            {adminUsers.map(user => (
              <UserCard 
                key={user._id} 
                user={user} 
                onDelete={handleDelete}
                showActions={false}
                type="admin"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const UserCard = ({ user, onApprove, onReject, onDelete, onMakeAdmin, showActions, type }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`user-card ${type}`}>
      <div className="user-header">
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }} />
          ) : null}
          <div className={`avatar-placeholder ${user.avatar ? 'hidden' : ''}`}>
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="user-main-info">
          <h3>{user.name || 'Unnamed User'}</h3>
          <p className="user-email">{user.email}</p>
          <div className="user-badges">
            <span className={`badge role ${user.role || 'user'}`}>
              {user.role || 'User'}
            </span>
            <span className={`badge status ${user.approved ? 'approved' : 'pending'}`}>
              {user.approved ? 'Approved' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="user-details">
        <p className="user-meta">
          <strong>Registered:</strong> {formatDate(user.createdAt)}
        </p>
        {user.approvedAt && (
          <p className="user-meta">
            <strong>Approved:</strong> {formatDate(user.approvedAt)}
          </p>
        )}
        {user.approvedBy && (
          <p className="user-meta">
            <strong>Approved By:</strong> {user.approvedBy.name || 'Admin'}
          </p>
        )}
      </div>

      {showActions && (
        <div className="user-actions">
          {type === 'pending' && (
            <>
              <button 
                className="btn btn-success btn-sm"
                onClick={() => onApprove(user._id)}
                title="Approve User"
              >
                Approve
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => onReject(user._id)}
                title="Reject User"
              >
                Reject
              </button>
            </>
          )}
          
          {type === 'approved' && user.role !== 'admin' && (
            <button 
              className="btn btn-warning btn-sm"
              onClick={() => onMakeAdmin(user._id)}
              title="Make Admin"
            >
              Make Admin
            </button>
          )}
          
          {(type === 'approved' || type === 'admin') && (
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={() => onDelete(user._id)}
              title="Delete User"
            >
              Delete
            </button>
          )}
        </div>
      )}

      {type === 'admin' && (
        <div className="admin-badge">
          <span className="badge admin">Administrator</span>
        </div>
      )}
    </div>
  );
};

export default UserManagement;