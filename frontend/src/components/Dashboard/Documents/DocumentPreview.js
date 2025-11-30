import React, { useState, useEffect } from 'react';
import { useDocuments } from '../../../context/DocumentsContext';
import { useAuth } from '../../../context/AuthContext';
import './DocumentPreview.css';

const DocumentPreview = ({ document, onClose, onDownload, onDelete, onShare }) => {
  const { updateDocument } = useDocuments();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    description: document.description || '',
    category: document.category || 'other',
    tags: document.tags?.join(', ') || '',
    visibility: document.visibility || 'private',
    sensitivityLevel: document.sensitivityLevel || 'internal'
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'sharing', 'versions'
  const [shareData, setShareData] = useState({
    targetUserId: '',
    permission: 'view',
    expiresAt: ''
  });

  // Categories for editing
  const categories = [
    { value: 'proposals', label: 'Grant Proposals', icon: 'fas fa-handshake' },
    { value: 'financial', label: 'Financial Documents', icon: 'fas fa-chart-line' },
    { value: 'guidelines', label: 'Guidelines', icon: 'fas fa-book' },
    { value: 'planning', label: 'Planning Documents', icon: 'fas fa-project-diagram' },
    { value: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' },
    { value: 'templates', label: 'Templates', icon: 'fas fa-copy' },
    { value: 'grants', label: 'Grant Documents', icon: 'fas fa-file-contract' },
    { value: 'contracts', label: 'Contracts', icon: 'fas fa-handshake' },
    { value: 'other', label: 'Other Documents', icon: 'fas fa-file' }
  ];

  // Permission options
  const permissionOptions = [
    { value: 'view', label: 'View Only', description: 'Can view but not download' },
    { value: 'download', label: 'View & Download', description: 'Can view and download' },
    { value: 'edit', label: 'Edit', description: 'Can edit metadata and download' },
    { value: 'manage', label: 'Manage', description: 'Full access except deletion' }
  ];

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get file icon based on type
  const getFileIcon = () => {
    const mimeType = document.mimeType?.toLowerCase() || '';
    const fileName = document.originalName?.toLowerCase() || '';
    
    if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('document') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return 'fas fa-file-word';
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return 'fas fa-file-excel';
    }
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      return 'fas fa-file-powerpoint';
    }
    if (mimeType.includes('image')) return 'fas fa-file-image';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'fas fa-file-archive';
    if (mimeType.includes('text')) return 'fas fa-file-alt';
    return 'fas fa-file';
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : 'Other';
  };

  // Get permission label
  const getPermissionLabel = (permission) => {
    const found = permissionOptions.find(opt => opt.value === permission);
    return found ? found.label : permission;
  };

  // Handle edit save
  const handleSaveEdit = async () => {
    if (!document._id) return;

    setSaving(true);
    try {
      const updateData = {
        ...editedData,
        tags: editedData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await updateDocument(document._id, updateData);
      setIsEditing(false);
      // You might want to refresh the document data here
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Failed to update document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedData({
      description: document.description || '',
      category: document.category || 'other',
      tags: document.tags?.join(', ') || '',
      visibility: document.visibility || 'private',
      sensitivityLevel: document.sensitivityLevel || 'internal'
    });
    setIsEditing(false);
  };

  // Handle share submission
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareData.targetUserId) {
      alert('Please enter a user ID to share with');
      return;
    }

    try {
      await onShare(document._id, shareData.targetUserId, shareData.permission);
      setShareData({
        targetUserId: '',
        permission: 'view',
        expiresAt: ''
      });
      // Show success message
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Failed to share document. Please try again.');
    }
  };

  // Check if user is owner
  const isOwner = user && document.userId === user.id;

  // Render file preview based on type
  const renderFilePreview = () => {
    if (document.mimeType?.includes('image')) {
      return (
        <div className="file-preview-image">
          <img 
            src={`/api/documents/${document._id}/preview`} 
            alt={document.originalName}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="preview-fallback">
            <i className="fas fa-file-image"></i>
            <p>Image preview not available</p>
          </div>
        </div>
      );
    }

    if (document.mimeType === 'application/pdf') {
      return (
        <div className="file-preview-pdf">
          <iframe
            src={`/api/documents/${document._id}/preview`}
            title={document.originalName}
            className="pdf-iframe"
          />
          <div className="preview-fallback">
            <i className="fas fa-file-pdf"></i>
            <p>PDF preview not available</p>
            <button 
              className="download-preview-btn"
              onClick={() => onDownload(document)}
            >
              <i className="fas fa-download"></i>
              Download PDF
            </button>
          </div>
        </div>
      );
    }

    // Default preview for other file types
    return (
      <div className="file-preview-default">
        <div className="preview-icon">
          <i className={getFileIcon()}></i>
        </div>
        <div className="preview-info">
          <h4>{document.originalName}</h4>
          <p>Preview not available for this file type</p>
          <button 
            className="download-preview-btn"
            onClick={() => onDownload(document)}
          >
            <i className="fas fa-download"></i>
            Download File
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="document-preview-overlay">
      <div className="document-preview-container">
        {/* Header */}
        <div className="preview-header">
          <div className="preview-header-content">
            <div className="preview-title-section">
              <div className="file-icon-large">
                <i className={getFileIcon()}></i>
              </div>
              <div className="preview-title">
                <h2>{document.originalName}</h2>
                <div className="preview-subtitle">
                  <span className="file-size">{formatFileSize(document.fileSize)}</span>
                  <span className="file-type">• {document.mimeType}</span>
                  <span className="file-category">• {getCategoryLabel(document.category)}</span>
                </div>
              </div>
            </div>
            
            <div className="preview-actions">
              <button 
                className="preview-action-btn"
                onClick={() => onDownload(document)}
                title="Download"
              >
                <i className="fas fa-download"></i>
              </button>
              
              {isOwner && (
                <>
                  <button 
                    className="preview-action-btn"
                    onClick={() => setIsEditing(!isEditing)}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  
                  <button 
                    className="preview-action-btn danger"
                    onClick={() => onDelete(document._id)}
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </>
              )}
              
              <button 
                className="preview-close-btn"
                onClick={onClose}
                title="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="preview-content">
          {/* Left Panel - File Preview */}
          <div className="preview-left-panel">
            <div className="preview-section">
              <h3 className="preview-section-title">
                <i className="fas fa-eye"></i>
                Preview
              </h3>
              <div className="file-preview-container">
                {renderFilePreview()}
              </div>
            </div>
          </div>

          {/* Right Panel - Details & Actions */}
          <div className="preview-right-panel">
            {/* Tabs */}
            <div className="preview-tabs">
              <button 
                className={`preview-tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                <i className="fas fa-info-circle"></i>
                Details
              </button>
              
              {isOwner && (
                <button 
                  className={`preview-tab ${activeTab === 'sharing' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sharing')}
                >
                  <i className="fas fa-share-alt"></i>
                  Sharing
                </button>
              )}
              
              <button 
                className={`preview-tab ${activeTab === 'versions' ? 'active' : ''}`}
                onClick={() => setActiveTab('versions')}
              >
                <i className="fas fa-history"></i>
                Versions
              </button>
            </div>

            {/* Tab Content */}
            <div className="preview-tab-content">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="tab-panel">
                  {isEditing ? (
                    <div className="edit-form">
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                          value={editedData.description}
                          onChange={(e) => setEditedData(prev => ({ ...prev, description: e.target.value }))}
                          className="form-textarea"
                          rows="3"
                          placeholder="Enter document description..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                          value={editedData.category}
                          onChange={(e) => setEditedData(prev => ({ ...prev, category: e.target.value }))}
                          className="form-select"
                        >
                          {categories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Tags</label>
                        <input
                          type="text"
                          value={editedData.tags}
                          onChange={(e) => setEditedData(prev => ({ ...prev, tags: e.target.value }))}
                          className="form-input"
                          placeholder="Enter tags separated by commas..."
                        />
                        <div className="form-hint">Separate multiple tags with commas</div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Visibility</label>
                          <select
                            value={editedData.visibility}
                            onChange={(e) => setEditedData(prev => ({ ...prev, visibility: e.target.value }))}
                            className="form-select"
                          >
                            <option value="private">Private</option>
                            <option value="shared">Shared</option>
                            <option value="public">Public</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Sensitivity</label>
                          <select
                            value={editedData.sensitivityLevel}
                            onChange={(e) => setEditedData(prev => ({ ...prev, sensitivityLevel: e.target.value }))}
                            className="form-select"
                          >
                            <option value="public">Public</option>
                            <option value="internal">Internal</option>
                            <option value="confidential">Confidential</option>
                            <option value="restricted">Restricted</option>
                          </select>
                        </div>
                      </div>

                      <div className="edit-actions">
                        <button 
                          className="cancel-btn"
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button 
                          className="save-btn"
                          onClick={handleSaveEdit}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="details-content">
                      <div className="detail-item">
                        <label>Description</label>
                        <p>{document.description || 'No description provided'}</p>
                      </div>

                      <div className="detail-item">
                        <label>Category</label>
                        <p>{getCategoryLabel(document.category)}</p>
                      </div>

                      <div className="detail-item">
                        <label>Tags</label>
                        <div className="tags-list">
                          {document.tags && document.tags.length > 0 ? (
                            document.tags.map((tag, index) => (
                              <span key={index} className="tag">{tag}</span>
                            ))
                          ) : (
                            <span className="no-tags">No tags</span>
                          )}
                        </div>
                      </div>

                      <div className="detail-row">
                        <div className="detail-item">
                          <label>Visibility</label>
                          <p className={`visibility-badge ${document.visibility}`}>
                            {document.visibility?.charAt(0).toUpperCase() + document.visibility?.slice(1)}
                          </p>
                        </div>

                        <div className="detail-item">
                          <label>Sensitivity</label>
                          <p className={`sensitivity-badge ${document.sensitivityLevel}`}>
                            {document.sensitivityLevel?.charAt(0).toUpperCase() + document.sensitivityLevel?.slice(1)}
                          </p>
                        </div>
                      </div>

                      <div className="detail-item">
                        <label>Uploaded</label>
                        <p>{formatDate(document.createdAt)}</p>
                      </div>

                      <div className="detail-item">
                        <label>Last Modified</label>
                        <p>{formatDate(document.updatedAt)}</p>
                      </div>

                      <div className="detail-item">
                        <label>Views</label>
                        <p>{document.viewCount || 0} times</p>
                      </div>

                      <div className="detail-item">
                        <label>Downloads</label>
                        <p>{document.downloadCount || 0} times</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sharing Tab */}
              {activeTab === 'sharing' && isOwner && (
                <div className="tab-panel">
                  <div className="sharing-section">
                    <h4>Share Document</h4>
                    <form onSubmit={handleShareSubmit} className="share-form">
                      <div className="form-group">
                        <label className="form-label">User ID</label>
                        <input
                          type="text"
                          value={shareData.targetUserId}
                          onChange={(e) => setShareData(prev => ({ ...prev, targetUserId: e.target.value }))}
                          className="form-input"
                          placeholder="Enter user ID to share with..."
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Permission Level</label>
                        <select
                          value={shareData.permission}
                          onChange={(e) => setShareData(prev => ({ ...prev, permission: e.target.value }))}
                          className="form-select"
                        >
                          {permissionOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label} - {option.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Expires At (Optional)</label>
                        <input
                          type="datetime-local"
                          value={shareData.expiresAt}
                          onChange={(e) => setShareData(prev => ({ ...prev, expiresAt: e.target.value }))}
                          className="form-input"
                        />
                      </div>

                      <button type="submit" className="share-btn">
                        <i className="fas fa-share"></i>
                        Share Document
                      </button>
                    </form>
                  </div>

                  <div className="shared-with-section">
                    <h4>Currently Shared With</h4>
                    {document.sharedWith && document.sharedWith.length > 0 ? (
                      <div className="shared-users-list">
                        {document.sharedWith.map((share, index) => (
                          <div key={index} className="shared-user-item">
                            <div className="user-info">
                              <span className="user-name">{share.userId?.name || 'Unknown User'}</span>
                              <span className="user-permission">{getPermissionLabel(share.permission)}</span>
                            </div>
                            <span className="share-date">
                              {formatDate(share.sharedAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-sharing">This document is not shared with anyone.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Versions Tab */}
              {activeTab === 'versions' && (
                <div className="tab-panel">
                  <div className="versions-section">
                    <h4>Document Versions</h4>
                    {document.versionHistory && document.versionHistory.length > 0 ? (
                      <div className="versions-list">
                        {document.versionHistory.map((version, index) => (
                          <div key={index} className="version-item">
                            <div className="version-header">
                              <span className="version-number">v{version.version}</span>
                              <span className="version-date">{formatDate(version.createdAt)}</span>
                            </div>
                            <div className="version-meta">
                              <span className="version-size">{formatFileSize(version.fileSize)}</span>
                              {version.changes && (
                                <span className="version-changes">• {version.changes}</span>
                              )}
                            </div>
                            <div className="version-actions">
                              <button className="version-action-btn">
                                <i className="fas fa-eye"></i>
                                View
                              </button>
                              <button className="version-action-btn">
                                <i className="fas fa-download"></i>
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-versions">No previous versions found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;