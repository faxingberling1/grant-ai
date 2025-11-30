import React, { useState, useMemo, useEffect } from 'react';
import { useDocuments } from '../../../context/DocumentsContext';
import { useAuth } from '../../../context/AuthContext';
import './DocumentList.css';

const DocumentList = ({ 
  onDocumentSelect, 
  onShare,
  searchQuery = '',
  selectedCategory = 'all',
  sortBy = 'newest'
}) => {
  const { currentUser } = useAuth();
  const { 
    documents, 
    loading, 
    error, 
    storageInfo,
    downloadDocument, 
    deleteDocument, 
    refreshDocuments, 
  } = useDocuments();
  
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Enhanced debug logs
  useEffect(() => {
    console.log('📄 DocumentList - documents:', documents);
    console.log('👤 DocumentList - user:', currentUser);
    console.log('🔍 DocumentList - filters:', { searchQuery, selectedCategory, sortBy });
  }, [documents, currentUser, searchQuery, selectedCategory, sortBy]);

  // Enhanced isOwner function with better error handling and fallbacks
  const isOwner = (document) => {
    if (!currentUser || !document) {
      console.log('❌ isOwner: Missing user or document', { currentUser, document });
      return false;
    }
    
    const userId = currentUser.id || currentUser._id || currentUser.userId;
    const documentUserId = document.userId || document.ownerId || document.uploadedBy || document.uploadedById;
    
    console.log('🔐 Ownership check details:', {
      userId,
      documentUserId,
      documentId: document._id,
      documentName: document.originalName || document.name
    });
    
    if (!documentUserId) {
      console.log('⚠️ Document has no owner ID field, using fallback logic');
      return true;
    }
    
    const owns = userId === documentUserId.toString();
    console.log('🔐 Ownership result:', owns);
    
    return owns;
  };

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Documents', icon: 'fas fa-folder', count: documents?.length || 0 },
    { value: 'proposals', label: 'Grant Proposals', icon: 'fas fa-handshake', count: documents?.filter(doc => doc.category === 'proposals').length || 0 },
    { value: 'financial', label: 'Financial Documents', icon: 'fas fa-chart-line', count: documents?.filter(doc => doc.category === 'financial').length || 0 },
    { value: 'guidelines', label: 'Guidelines', icon: 'fas fa-book', count: documents?.filter(doc => doc.category === 'guidelines').length || 0 },
    { value: 'planning', label: 'Planning Documents', icon: 'fas fa-project-diagram', count: documents?.filter(doc => doc.category === 'planning').length || 0 },
    { value: 'reports', label: 'Reports', icon: 'fas fa-chart-bar', count: documents?.filter(doc => doc.category === 'reports').length || 0 },
    { value: 'templates', label: 'Templates', icon: 'fas fa-copy', count: documents?.filter(doc => doc.category === 'templates').length || 0 },
    { value: 'grants', label: 'Grant Documents', icon: 'fas fa-file-contract', count: documents?.filter(doc => doc.category === 'grants').length || 0 },
    { value: 'contracts', label: 'Contracts', icon: 'fas fa-handshake', count: documents?.filter(doc => doc.category === 'contracts').length || 0 },
    { value: 'other', label: 'Other Documents', icon: 'fas fa-file', count: documents?.filter(doc => doc.category === 'other').length || 0 }
  ];

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    console.log('🔄 Filtering and sorting documents...');
    
    if (!documents || !Array.isArray(documents)) {
      console.warn('⚠️ No documents array provided');
      return [];
    }

    let filtered = documents.filter(doc => {
      if (!doc) return false;

      const docName = doc.originalName || doc.name || doc.filename || '';
      const docDescription = doc.description || '';
      const docTags = doc.tags || [];

      const matchesSearch = 
        docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        docDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        docTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    console.log(`📊 After filtering: ${filtered.length} documents`);

    // Sort documents
    filtered.sort((a, b) => {
      const aDate = a.createdAt || a.uploadDate || a.updatedAt || 0;
      const bDate = b.createdAt || b.uploadDate || b.updatedAt || 0;
      const aName = a.originalName || a.name || a.filename || '';
      const bName = b.originalName || b.name || b.filename || '';
      const aSize = a.fileSize || a.size || 0;
      const bSize = b.fileSize || b.size || 0;

      switch (sortBy) {
        case 'newest':
          return new Date(bDate) - new Date(aDate);
        case 'oldest':
          return new Date(aDate) - new Date(bDate);
        case 'name-asc':
          return aName.localeCompare(bName);
        case 'name-desc':
          return bName.localeCompare(aName);
        case 'size-asc':
          return aSize - bSize;
        case 'size-desc':
          return bSize - aSize;
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, selectedCategory, sortBy]);

  // Get file icon based on type
  const getFileIcon = (document) => {
    if (!document) return 'fas fa-file';
    
    const mimeType = document.mimeType?.toLowerCase() || document.fileType?.toLowerCase() || '';
    const fileName = document.originalName?.toLowerCase() || document.name?.toLowerCase() || document.filename?.toLowerCase() || '';
    
    if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) return 'fas fa-file-pdf';
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : 'Other';
  };

  // Handle document selection
  const handleDocumentSelect = (documentId, event) => {
    if (event.shiftKey) {
      const newSelected = new Set(selectedDocuments);
      if (newSelected.has(documentId)) {
        newSelected.delete(documentId);
      } else {
        newSelected.add(documentId);
      }
      setSelectedDocuments(newSelected);
    } else {
      if (onDocumentSelect) {
        const document = documents.find(doc => doc._id === documentId || doc.id === documentId);
        if (document) {
          onDocumentSelect(document);
        }
      }
    }
  };

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedDocuments.size === filteredAndSortedDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredAndSortedDocuments.map(doc => doc._id || doc.id)));
    }
  };

  // Handle single document delete with better error handling
  const handleDeleteDocument = async (documentId, documentName) => {
    console.log('🗑️ Delete requested for:', { documentId, documentName, currentUser });
    
    if (!currentUser) {
      alert('You must be logged in to delete documents');
      return;
    }
    
    const document = documents.find(doc => doc._id === documentId);
    if (document && !isOwner(document)) {
      alert('You can only delete your own documents');
      return;
    }
    
    setDeleteConfirm({ id: documentId, name: documentName });
    setDeleteError(null);
  };

  // Confirm and execute delete with better error handling
  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    console.log('✅ Confirming delete for:', deleteConfirm);

    try {
      setLocalLoading(true);
      await deleteDocument(deleteConfirm.id);
      console.log('🗑️ Document deleted successfully');
      setDeleteConfirm(null);
      setDeleteError(null);
      
      setSelectedDocuments(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(deleteConfirm.id);
        return newSelected;
      });
      
      await refreshDocuments();
      
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      setDeleteError(error.message || 'Failed to delete document. Please check your permissions.');
    } finally {
      setLocalLoading(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    console.log('❌ Delete cancelled');
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedDocuments.size === 0) return;

    const selectedDocs = documents.filter(doc => selectedDocuments.has(doc._id || doc.id));
    
    try {
      setLocalLoading(true);
      
      switch (bulkAction) {
        case 'download':
          for (const doc of selectedDocs) {
            await downloadDocument(doc._id || doc.id);
          }
          break;
        case 'share':
          if (onShare) {
            console.log('Bulk share:', selectedDocs);
          }
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedDocuments.size} document(s)? This action cannot be undone.`)) {
            for (const doc of selectedDocs) {
              await deleteDocument(doc._id || doc.id);
            }
            setSelectedDocuments(new Set());
            await refreshDocuments();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert(`Bulk action failed: ${error.message}`);
    } finally {
      setBulkAction('');
      setLocalLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      await refreshDocuments();
    } catch (error) {
      console.error('Error refreshing documents:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Safe download handler
  const handleDownload = async (documentId, documentName) => {
    try {
      console.log('📥 Handling download for:', { documentId, documentName });
      await downloadDocument(documentId);
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert(`Download failed: ${error.message}`);
    }
  };

  // Enhanced Grid View Component
  const GridView = () => (
    <div className="documents-grid-enhanced">
      {filteredAndSortedDocuments.map((document) => {
        const documentId = document._id || document.id;
        const documentName = document.originalName || document.name || document.filename || 'Unnamed Document';
        const userIsOwner = currentUser ? isOwner(document) : false;
        
        return (
          <div
            key={documentId}
            className={`document-card-enhanced ${selectedDocuments.has(documentId) ? 'selected' : ''}`}
            onClick={(e) => handleDocumentSelect(documentId, e)}
          >
            <div className="card-enhanced-header">
              <div className="file-icon-enhanced">
                <i className={getFileIcon(document)}></i>
              </div>
              <div className="card-enhanced-actions">
                <button
                  className="action-btn-enhanced download-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(documentId, documentName);
                  }}
                  title="Download"
                  disabled={localLoading}
                >
                  <i className="fas fa-download"></i>
                </button>
                
                {currentUser && userIsOwner && (
                  <button
                    className="action-btn-enhanced delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(documentId, documentName);
                    }}
                    title="Delete"
                    disabled={localLoading}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
              <input
                type="checkbox"
                className="select-checkbox-enhanced"
                checked={selectedDocuments.has(documentId)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleDocumentSelect(documentId, e);
                }}
                disabled={localLoading}
              />
            </div>

            <div className="card-enhanced-content">
              <h4 className="document-name-enhanced" title={documentName}>
                {documentName}
              </h4>
              <p className="document-description-enhanced">
                {document.description || 'No description available'}
              </p>
            </div>

            <div className="card-enhanced-footer">
              <div className="document-meta-enhanced">
                <span className="file-size-enhanced">
                  <i className="fas fa-weight-hanging"></i>
                  {formatFileSize(document.fileSize || document.size)}
                </span>
                <span className="file-date-enhanced">
                  <i className="fas fa-calendar"></i>
                  {formatDate(document.createdAt || document.uploadDate)}
                </span>
              </div>
              <div className="document-tags-enhanced">
                {document.tags?.slice(0, 2).map((tag, index) => (
                  <span key={`${documentId}-tag-${index}`} className="tag-enhanced">{tag}</span>
                ))}
                {document.tags && document.tags.length > 2 && (
                  <span className="tag-more-enhanced">+{document.tags.length - 2}</span>
                )}
              </div>
            </div>

            <div className="card-enhanced-indicators">
              <span className={`category-indicator ${document.category || 'other'}`}>
                {getCategoryLabel(document.category)}
              </span>
              {currentUser && !userIsOwner && (
                <span className="shared-indicator-enhanced" title="Shared with you">
                  <i className="fas fa-share-alt"></i>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Enhanced List View Component
  const ListView = () => (
    <div className="documents-list-enhanced">
      <div className="list-enhanced-header">
        <div className="list-column-enhanced select-column-enhanced">
          <input
            type="checkbox"
            checked={selectedDocuments.size === filteredAndSortedDocuments.length && filteredAndSortedDocuments.length > 0}
            onChange={handleSelectAll}
            className="select-checkbox-enhanced"
            disabled={localLoading}
          />
        </div>
        <div className="list-column-enhanced name-column-enhanced">Name</div>
        <div className="list-column-enhanced category-column-enhanced">Category</div>
        <div className="list-column-enhanced size-column-enhanced">Size</div>
        <div className="list-column-enhanced date-column-enhanced">Modified</div>
        <div className="list-column-enhanced actions-column-enhanced">Actions</div>
      </div>

      <div className="list-enhanced-body">
        {filteredAndSortedDocuments.map((document) => {
          const documentId = document._id || document.id;
          const documentName = document.originalName || document.name || document.filename || 'Unnamed Document';
          const userIsOwner = currentUser ? isOwner(document) : false;
          
          return (
            <div
              key={documentId}
              className={`list-row-enhanced ${selectedDocuments.has(documentId) ? 'selected' : ''}`}
              onClick={(e) => handleDocumentSelect(documentId, e)}
            >
              <div className="list-column-enhanced select-column-enhanced">
                <input
                  type="checkbox"
                  checked={selectedDocuments.has(documentId)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleDocumentSelect(documentId, e);
                  }}
                  className="select-checkbox-enhanced"
                  disabled={localLoading}
                />
              </div>

              <div className="list-column-enhanced name-column-enhanced">
                <div className="file-info-enhanced">
                  <i className={`file-icon-list ${getFileIcon(document)}`}></i>
                  <div className="file-details-enhanced">
                    <span className="file-name-enhanced" title={documentName}>
                      {documentName}
                    </span>
                    {document.description && (
                      <span className="file-description-enhanced" title={document.description}>
                        {document.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="list-column-enhanced category-column-enhanced">
                <span className="category-tag-enhanced">{getCategoryLabel(document.category)}</span>
              </div>

              <div className="list-column-enhanced size-column-enhanced">
                <span className="file-size-list">{formatFileSize(document.fileSize || document.size)}</span>
              </div>

              <div className="list-column-enhanced date-column-enhanced">
                <span className="file-date-list">{formatDate(document.updatedAt || document.createdAt || document.modifiedDate)}</span>
              </div>

              <div className="list-column-enhanced actions-column-enhanced">
                <div className="action-buttons-enhanced">
                  <button
                    className="action-btn-enhanced download-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(documentId, documentName);
                    }}
                    title="Download"
                    disabled={localLoading}
                  >
                    <i className="fas fa-download"></i>
                  </button>
                  
                  {currentUser && userIsOwner && (
                    <button
                      className="action-btn-enhanced delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(documentId, documentName);
                      }}
                      title="Delete"
                      disabled={localLoading}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="document-list-container-enhanced">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay-enhanced">
          <div className="delete-confirm-modal-enhanced">
            <div className="modal-header-enhanced">
              <h3>Delete Document</h3>
              <button className="modal-close-enhanced" onClick={cancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content-enhanced">
              <div className="warning-icon-enhanced">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <p>Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>?</p>
              <p className="warning-text-enhanced">This action cannot be undone and will permanently remove the file from both the database and server storage.</p>
              
              {deleteError && (
                <div className="delete-error-message-enhanced">
                  <i className="fas fa-exclamation-circle"></i>
                  {deleteError}
                </div>
              )}
            </div>
            <div className="modal-actions-enhanced">
              <button className="btn-cancel-enhanced" onClick={cancelDelete} disabled={localLoading}>
                Cancel
              </button>
              <button className="btn-delete-enhanced" onClick={confirmDelete} disabled={localLoading}>
                {localLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with enhanced controls */}
      <div className="list-controls-enhanced">
        <div className="controls-left-enhanced">
          <div className="view-toggle-enhanced">
            <button
              className={`view-btn-enhanced ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              disabled={localLoading}
            >
              <i className="fas fa-th"></i>
              Grid
            </button>
            <button
              className={`view-btn-enhanced ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
              disabled={localLoading}
            >
              <i className="fas fa-list"></i>
              List
            </button>
          </div>

          <button 
            className="refresh-btn-enhanced"
            onClick={handleRefresh}
            disabled={localLoading || loading}
            title="Refresh Documents"
          >
            <i className={`fas fa-sync ${localLoading ? 'fa-spin' : ''}`}></i>
            Refresh
          </button>
        </div>

        <div className="controls-right-enhanced">
          <div className="document-count-enhanced">
            <span className="count-number">{filteredAndSortedDocuments.length}</span>
            <span className="count-label">of {documents?.length || 0} documents</span>
          </div>
          {(loading || localLoading) && (
            <div className="loading-indicator-enhanced">
              <i className="fas fa-spinner fa-spin"></i>
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message-enhanced">
          <i className="fas fa-exclamation-triangle"></i>
          <div className="error-content">
            <span className="error-text">{error}</span>
            <button onClick={handleRefresh} className="retry-btn-enhanced">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Bulk Actions */}
      {selectedDocuments.size > 0 && (
        <div className="bulk-actions-bar-enhanced">
          <div className="bulk-actions-info-enhanced">
            <i className="fas fa-check-circle"></i>
            <strong>{selectedDocuments.size}</strong> document(s) selected
          </div>
          <div className="bulk-actions-controls-enhanced">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-action-select-enhanced"
              disabled={localLoading}
            >
              <option value="">Bulk Actions</option>
              <option value="download">Download Selected</option>
              <option value="share">Share Selected</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              className="bulk-action-btn-enhanced"
              onClick={handleBulkAction}
              disabled={!bulkAction || localLoading}
            >
              {localLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Processing...
                </>
              ) : (
                'Apply'
              )}
            </button>
            <button
              className="bulk-clear-btn-enhanced"
              onClick={() => setSelectedDocuments(new Set())}
              disabled={localLoading}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Documents View */}
      {filteredAndSortedDocuments.length === 0 ? (
        <div className="empty-state-enhanced">
          <div className="empty-icon">
            <i className="fas fa-folder-open"></i>
          </div>
          <h3>No documents found</h3>
          <p>{documents?.length === 0 ? 'Upload your first document to get started' : 'Try adjusting your search or filters'}</p>
          <button className="refresh-btn-empty" onClick={handleRefresh}>
            <i className="fas fa-sync"></i>
            Refresh Documents
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <GridView />
      ) : (
        <ListView />
      )}
    </div>
  );
};

export default DocumentList;