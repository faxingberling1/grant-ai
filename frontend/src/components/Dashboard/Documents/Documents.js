import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useDocuments } from '../../../context/DocumentsContext';
import './Documents.css';

// Import sub-components
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import DocumentPreview from './DocumentPreview';
import StorageStats from './StorageStats';

const Documents = ({ initialView = 'all', clientId = null, clientName = null }) => {
  const { user } = useAuth();
  const { 
    documents, 
    loading, 
    error, 
    fetchDocuments, 
    uploadDocument, 
    deleteDocument,
    updateDocument,
    shareDocument 
  } = useDocuments();

  const [activeView, setActiveView] = useState('list'); // 'list', 'grid', 'upload'
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState(initialView); // 'all', 'personal', 'client'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Documents', icon: 'fas fa-layer-group' },
    { id: 'proposals', label: 'Grant Proposals', icon: 'fas fa-handshake' },
    { id: 'financial', label: 'Financial', icon: 'fas fa-chart-line' },
    { id: 'guidelines', label: 'Guidelines', icon: 'fas fa-book' },
    { id: 'planning', label: 'Planning', icon: 'fas fa-project-diagram' },
    { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' },
    { id: 'templates', label: 'Templates', icon: 'fas fa-copy' },
    { id: 'grants', label: 'Grants', icon: 'fas fa-file-contract' },
    { id: 'contracts', label: 'Contracts', icon: 'fas fa-handshake' },
    { id: 'other', label: 'Other', icon: 'fas fa-file' }
  ];

  // Document type filters
  const documentTypes = [
    { id: 'all', label: 'All Documents', icon: 'fas fa-folder', description: 'Show all documents' },
    { id: 'personal', label: 'Personal Documents', icon: 'fas fa-user', description: 'Your personal files' },
    { id: 'client', label: 'Client Documents', icon: 'fas fa-users', description: 'Client-related files' }
  ];

  // Load documents on component mount
  useEffect(() => {
    if (clientId) {
      // Fetch documents for specific client
      fetchDocuments(clientId);
      setDocumentTypeFilter('client');
    } else {
      // Fetch all documents
      fetchDocuments();
    }
  }, [fetchDocuments, clientId]);

  // Safe document filtering and sorting
  const filteredDocuments = React.useMemo(() => {
    // First, filter out any invalid documents
    const validDocuments = (documents || []).filter(doc => 
      doc && typeof doc === 'object' && doc._id
    );

    return validDocuments
      .filter(doc => {
        // Search filter with safe property access
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          (doc.originalName || '').toLowerCase().includes(searchLower) ||
          (doc.description || '').toLowerCase().includes(searchLower) ||
          (Array.isArray(doc.tags) ? doc.tags.some(tag => 
            (tag || '').toLowerCase().includes(searchLower)
          ) : false);

        // Category filter with safe property access
        const matchesCategory = categoryFilter === 'all' || (doc.category || 'other') === categoryFilter;

        // Document type filter with safe property access
        let matchesDocumentType = true;
        if (documentTypeFilter === 'personal') {
          matchesDocumentType = !doc.clientId; // Personal documents have no clientId
        } else if (documentTypeFilter === 'client') {
          matchesDocumentType = !!doc.clientId; // Client documents have clientId
        }
        // For 'all', matchesDocumentType remains true

        return matchesSearch && matchesCategory && matchesDocumentType;
      })
      .sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case 'createdAt':
            aValue = new Date(a.createdAt || a.uploadDate || Date.now());
            bValue = new Date(b.createdAt || b.uploadDate || Date.now());
            break;
          case 'originalName':
            aValue = (a.originalName || '').toLowerCase();
            bValue = (b.originalName || '').toLowerCase();
            break;
          case 'fileSize':
            aValue = a.fileSize || 0;
            bValue = b.fileSize || 0;
            break;
          case 'lastAccessed':
            aValue = a.lastAccessed ? new Date(a.lastAccessed) : new Date(a.createdAt || a.uploadDate || Date.now());
            bValue = b.lastAccessed ? new Date(b.lastAccessed) : new Date(b.createdAt || b.uploadDate || Date.now());
            break;
          default:
            aValue = a[sortBy] || '';
            bValue = b[sortBy] || '';
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  }, [documents, searchTerm, categoryFilter, documentTypeFilter, sortBy, sortOrder]);

  // Document actions
  const handleUploadComplete = useCallback(() => {
    setActiveView('list');
    fetchDocuments();
  }, [fetchDocuments]);

  const handlePreviewDocument = useCallback((document) => {
    if (document && document._id) {
      setSelectedDocument(document);
      setIsPreviewOpen(true);
    }
  }, []);

  const handleDeleteDocument = useCallback(async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await deleteDocument(documentId);
        fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  }, [deleteDocument, fetchDocuments]);

  const handleDownloadDocument = useCallback(async (document) => {
    try {
      if (document && document._id) {
        // This would typically call your download API
        console.log('Downloading document:', document._id);
        // Implement download logic here
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  }, []);

  const handleShareDocument = useCallback(async (documentId, targetUserId, permission) => {
    try {
      await shareDocument(documentId, targetUserId, permission);
      // Show success message
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  }, [shareDocument]);

  // Get document statistics with safe data access
  const getDocumentStats = () => {
    const validDocuments = (documents || []).filter(doc => doc && doc._id);
    const personalDocs = validDocuments.filter(doc => !doc.clientId);
    const clientDocs = validDocuments.filter(doc => !!doc.clientId);
    
    return {
      total: validDocuments.length,
      personal: personalDocs.length,
      client: clientDocs.length,
      totalSize: validDocuments.reduce((total, doc) => total + (doc.fileSize || 0), 0)
    };
  };

  const stats = getDocumentStats();

  if (loading && (documents || []).length === 0) {
    return (
      <div className="documents-container">
        <div className="documents-loading">
          <div className="loading-spinner"></div>
          <p>Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-container">
      {/* Header Section */}
      <div className="documents-header">
        <div className="documents-header-content">
          <div className="documents-title-section">
            <h1 className="documents-title">
              <i className="fas fa-folder-open documents-title-icon"></i>
              {clientId ? `Documents - ${clientName || 'Client'}` : 'Document Library'}
            </h1>
            <p className="documents-subtitle">
              {clientId 
                ? `Managing documents for ${clientName || 'this client'}`
                : 'Manage and organize all your grant-related documents in one secure place'
              }
            </p>
            {!clientId && (
              <div className="documents-stats-overview">
                <div className="stat-item">
                  <span className="stat-number">{stats.total}</span>
                  <span className="stat-label">Total Documents</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.personal}</span>
                  <span className="stat-label">Personal</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.client}</span>
                  <span className="stat-label">Client</span>
                </div>
              </div>
            )}
          </div>
          <div className="documents-header-actions">
            <button 
              className={`documents-view-btn ${activeView === 'list' ? 'active' : ''}`}
              onClick={() => setActiveView('list')}
              title="List View"
            >
              <i className="fas fa-list"></i>
            </button>
            <button 
              className={`documents-view-btn ${activeView === 'grid' ? 'active' : ''}`}
              onClick={() => setActiveView('grid')}
              title="Grid View"
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button 
              className="documents-upload-btn"
              onClick={() => setActiveView('upload')}
            >
              <i className="fas fa-cloud-upload-alt"></i>
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Storage Stats */}
      <StorageStats />

      {/* Main Content */}
      <div className="documents-content">
        {/* Document Type Navigation (only show when not in client-specific view) */}
        {!clientId && (
          <div className="documents-type-navigation">
            <div className="type-nav-header">
              <h4>Document Types</h4>
            </div>
            <div className="type-nav-buttons">
              {documentTypes.map(type => (
                <button
                  key={type.id}
                  className={`document-type-btn ${documentTypeFilter === type.id ? 'active' : ''}`}
                  onClick={() => setDocumentTypeFilter(type.id)}
                >
                  <i className={type.icon}></i>
                  <div className="type-btn-content">
                    <span className="type-label">{type.label}</span>
                    <span className="type-description">{type.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories Navigation */}
        <div className="documents-categories">
          {categories.map(category => (
            <button
              key={category.id}
              className={`documents-category-btn ${categoryFilter === category.id ? 'active' : ''}`}
              onClick={() => setCategoryFilter(category.id)}
            >
              <i className={category.icon}></i>
              {category.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="documents-toolbar">
          <div className="documents-search">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search documents by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="documents-search-input"
            />
          </div>
          
          <div className="documents-filters">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="documents-filter-select"
            >
              <option value="createdAt">Date Uploaded</option>
              <option value="originalName">Name</option>
              <option value="fileSize">Size</option>
              <option value="lastAccessed">Last Accessed</option>
            </select>
            
            <button 
              className="documents-sort-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <i className={`fas fa-sort-amount-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || categoryFilter !== 'all' || documentTypeFilter !== 'all') && (
          <div className="active-filters">
            <span className="filters-label">Active filters:</span>
            {searchTerm && (
              <span className="filter-tag">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}>×</button>
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="filter-tag">
                Category: {categories.find(c => c.id === categoryFilter)?.label || categoryFilter}
                <button onClick={() => setCategoryFilter('all')}>×</button>
              </span>
            )}
            {!clientId && documentTypeFilter !== 'all' && (
              <span className="filter-tag">
                Type: {documentTypes.find(t => t.id === documentTypeFilter)?.label || documentTypeFilter}
                <button onClick={() => setDocumentTypeFilter('all')}>×</button>
              </span>
            )}
            <button 
              className="clear-all-filters"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setDocumentTypeFilter('all');
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="documents-main-area">
          {activeView === 'upload' ? (
            <DocumentUpload 
              onUploadComplete={handleUploadComplete}
              onCancel={() => setActiveView('list')}
              clientId={clientId}
              clientName={clientName}
            />
          ) : (
            <DocumentList
              documents={filteredDocuments}
              view={activeView}
              onPreview={handlePreviewDocument}
              onDelete={handleDeleteDocument}
              onDownload={handleDownloadDocument}
              onShare={handleShareDocument}
              loading={loading}
              documentTypeFilter={documentTypeFilter}
            />
          )}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && activeView !== 'upload' && (
          <div className="documents-empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-folder-open"></i>
            </div>
            <h3>No documents found</h3>
            <p>
              {searchTerm || categoryFilter !== 'all' || documentTypeFilter !== 'all'
                ? 'Try adjusting your search criteria or browse all documents'
                : clientId
                  ? `No documents found for ${clientName || 'this client'}. Get started by uploading the first document.`
                  : 'Get started by uploading your first document'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && documentTypeFilter === 'all' && (
              <button 
                className="documents-upload-btn primary"
                onClick={() => setActiveView('upload')}
              >
                <i className="fas fa-cloud-upload-alt"></i>
                Upload Your First Document
              </button>
            )}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {isPreviewOpen && selectedDocument && selectedDocument._id && (
        <DocumentPreview
          document={selectedDocument}
          onClose={() => setIsPreviewOpen(false)}
          onDownload={handleDownloadDocument}
          onDelete={handleDeleteDocument}
          onShare={handleShareDocument}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="documents-error">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="error-content">
            <h4>Error Loading Documents</h4>
            <p>{error}</p>
            <button 
              className="documents-retry-btn"
              onClick={fetchDocuments}
            >
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;