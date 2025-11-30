import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const DocumentsContext = createContext();

export const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
};

export const DocumentsProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    total: 1073741824 // 1GB default
  });
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  const { currentUser } = useAuth();
  const initialLoadRef = useRef(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Enhanced fetchDocuments with filtering and pagination
  const fetchDocuments = useCallback(async (customFilters = {}) => {
    if (!currentUser) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const mergedFilters = { ...filters, ...customFilters };
      const queryParams = new URLSearchParams();
      
      // Add all filter parameters
      Object.entries(mergedFilters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });
      
      // Add pagination
      queryParams.append('page', pagination.page);
      queryParams.append('limit', pagination.limit);

      const url = `${API_URL}/api/documents?${queryParams.toString()}`;
      console.log('📥 Fetching documents from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch documents`);
      }

      const data = await response.json();
      console.log('✅ Documents fetched successfully:', data);
      
      // Handle the standardized response format from your backend
      let documentsArray = [];
      
      if (data.success && data.data) {
        documentsArray = data.data;
        // Update pagination if provided
        if (data.pagination) {
          setPagination(prev => ({ ...prev, ...data.pagination }));
        }
      } else if (data.documents) {
        documentsArray = data.documents;
      } else if (Array.isArray(data)) {
        documentsArray = data;
      } else {
        console.warn('⚠️ Unexpected documents response format:', data);
        documentsArray = [];
      }
      
      setDocuments(documentsArray);
      console.log(`📄 Loaded ${documentsArray.length} documents into state`);
      
    } catch (err) {
      console.error('❌ Error fetching documents:', err);
      setError(err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, currentUser, filters, pagination.page, pagination.limit]);

  // Fetch storage statistics from backend
  const fetchStorageStats = useCallback(async () => {
    if (!currentUser) return;

    try {
      console.log('💾 Fetching storage stats...');
      const response = await fetch(`${API_URL}/api/documents/stats/storage`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setStorageInfo({
            used: data.data.totalStorageUsed || 0,
            available: Math.max(0, 1073741824 - (data.data.totalStorageUsed || 0)),
            total: 1073741824
          });
          console.log('✅ Storage stats updated from backend');
        }
      } else {
        // If storage stats endpoint fails, calculate locally
        console.warn('⚠️ Storage stats endpoint failed, calculating locally');
        calculateStorageInfo();
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch storage stats, using local calculation:', err);
      // Fallback to local calculation
      calculateStorageInfo();
    }
  }, [API_URL, currentUser]);

  // Calculate storage information from documents (fallback)
  const calculateStorageInfo = useCallback(() => {
    console.log('💾 Calculating storage info locally...');
    const totalSize = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
    const calculatedStorage = {
      used: totalSize,
      available: Math.max(0, 1073741824 - totalSize),
      total: 1073741824
    };
    console.log('✅ Local storage calculated:', calculatedStorage);
    setStorageInfo(calculatedStorage);
  }, [documents]);

  // Enhanced upload document with better error handling
  const uploadDocument = async (documentData) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to upload documents');
    }

    setLoading(true);
    setError(null);
    try {
      console.log('📤 Starting document upload with data:', documentData);
      
      const formData = new FormData();
      
      // Append file with the correct field name (matches backend expectation)
      formData.append('file', documentData.file);
      
      // Append metadata (match backend Document model fields)
      formData.append('originalName', documentData.originalName || documentData.file.name);
      formData.append('description', documentData.description || '');
      formData.append('category', documentData.category || 'other');
      formData.append('type', documentData.type || 'document');
      
      // Handle tags - ensure proper array format
      if (documentData.tags && Array.isArray(documentData.tags)) {
        formData.append('tags', JSON.stringify(documentData.tags));
      } else {
        formData.append('tags', JSON.stringify([]));
      }
      
      // Handle client and grant references
      if (documentData.clientId && documentData.clientId !== 'personal') {
        formData.append('clientId', documentData.clientId);
      }
      if (documentData.grantId) {
        formData.append('grantId', documentData.grantId);
      }

      console.log('📦 Uploading document...');
      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Upload failed with response:', result);
        throw new Error(result.message || result.error || `Upload failed with status ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      console.log('✅ Document uploaded successfully:', result);
      
      // Handle the standardized response format
      const newDocument = result.data || result.document;
      
      if (newDocument) {
        setDocuments(prev => {
          const newDocuments = [newDocument, ...prev];
          console.log(`📄 Updated documents list: ${newDocuments.length} documents`);
          return newDocuments;
        });
        
        // Update storage stats after upload
        await fetchStorageStats();
      }
      
      return newDocument;
    } catch (err) {
      console.error('❌ Error uploading document:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload multiple documents
  const uploadMultipleDocuments = async (documentsData) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to upload documents');
    }

    setLoading(true);
    setError(null);
    try {
      console.log('📤 Starting multiple document upload:', documentsData);
      
      const formData = new FormData();
      
      // Append all files
      documentsData.files.forEach((file, index) => {
        formData.append('files', file);
      });
      
      // Append common metadata
      if (documentsData.category) {
        formData.append('category', documentsData.category);
      }
      if (documentsData.clientId && documentsData.clientId !== 'personal') {
        formData.append('clientId', documentsData.clientId);
      }
      if (documentsData.tags && Array.isArray(documentsData.tags)) {
        formData.append('tags', JSON.stringify(documentsData.tags));
      }

      const response = await fetch(`${API_URL}/api/documents/upload-multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || result.error || `Upload failed with status ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      console.log('✅ Multiple documents upload completed:', result);
      
      // Refresh documents list to include new uploads
      await fetchDocuments();
      await fetchStorageStats();
      
      return result.data || result.results;
    } catch (err) {
      console.error('❌ Error uploading multiple documents:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update document with enhanced error handling
  const updateDocument = async (documentId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('✏️ Updating document:', documentId, updateData);
      const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Handle specific backend error cases
        if (response.status === 403) {
          throw new Error('You do not have permission to update this document');
        } else if (response.status === 404) {
          throw new Error('Document not found');
        }
        throw new Error(result.message || result.error || 'Failed to update document');
      }

      if (!result.success) {
        throw new Error(result.message || 'Update failed');
      }

      console.log('✅ Document updated successfully:', result);
      
      const updatedDocument = result.data || result.document;
      
      setDocuments(prev => {
        const newDocuments = prev.map(doc => 
          doc._id === documentId ? updatedDocument : doc
        );
        return newDocuments;
      });

      return updatedDocument;
    } catch (err) {
      console.error('❌ Error updating document:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Enhanced delete document - REMOVED local state check
  const deleteDocument = async (documentId, hardDelete = false) => {
    if (!currentUser) {
      throw new Error('You must be logged in to delete documents');
    }

    setLoading(true);
    setError(null);
    try {
      console.log('🗑️ Deleting document:', documentId, hardDelete ? '(hard delete)' : '');
      console.log('👤 Current user:', currentUser);
      
      // REMOVED: The document lookup in local state that was causing "Document not found in local state" error
      // Let the backend handle the existence and ownership validation
      
      const endpoint = hardDelete 
        ? `${API_URL}/api/documents/${documentId}/hard`
        : `${API_URL}/api/documents/${documentId}`;
      
      console.log('🔗 Calling delete endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      console.log('📨 Delete response:', {
        status: response.status,
        ok: response.ok,
        result: result
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to delete this document');
        } else if (response.status === 404) {
          throw new Error('Document not found on server');
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(result.message || result.error || `Failed to delete document (${response.status})`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Delete failed');
      }

      console.log('✅ Document deleted successfully:', result);
      
      // Remove document from state using the documentId passed to the function
      // Check both _id and id fields to ensure we remove it properly
      setDocuments(prev => {
        const newDocuments = prev.filter(doc => 
          doc._id !== documentId && doc.id !== documentId
        );
        console.log(`📄 Removed document. Now ${newDocuments.length} documents`);
        return newDocuments;
      });
      
      // Update storage stats after deletion
      await fetchStorageStats();
      
      return result;
    } catch (err) {
      console.error('❌ Error deleting document:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced download document with better error handling
  const downloadDocument = async (documentId) => {
    if (!currentUser) {
      throw new Error('You must be logged in to download documents');
    }

    try {
      console.log('📥 Downloading document:', documentId);
      
      // First, track the download
      try {
        await fetch(`${API_URL}/api/documents/${documentId}/download`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (trackError) {
        console.warn('⚠️ Could not track download:', trackError);
        // Continue with download even if tracking fails
      }

      // Then, actually download the file
      const response = await fetch(`${API_URL}/api/documents/${documentId}/file`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to download this document');
        } else if (response.status === 404) {
          throw new Error('Document not found on server');
        }
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get the document info for filename
      const document = documents.find(doc => doc._id === documentId || doc.id === documentId);
      const filename = document?.originalName || 'document';
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ Document downloaded successfully:', filename);
      
    } catch (err) {
      console.error('❌ Error downloading document:', err);
      setError(err.message);
      throw err;
    }
  };

  // Get document by ID
  const getDocumentById = async (documentId) => {
    if (!currentUser) {
      throw new Error('You must be logged in to view documents');
    }

    try {
      const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied to this document');
        } else if (response.status === 404) {
          throw new Error('Document not found');
        }
        throw new Error(result.message || 'Failed to fetch document');
      }

      return result.data || result.document;
    } catch (err) {
      console.error('❌ Error fetching document:', err);
      throw err;
    }
  };

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Refresh documents and storage stats
  const refreshDocuments = useCallback(async () => {
    console.log('🔄 Refreshing documents and storage stats...');
    await fetchDocuments();
    await fetchStorageStats();
  }, [fetchDocuments, fetchStorageStats]);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Get documents by client
  const getDocumentsByClient = useCallback((clientId) => {
    return documents.filter(doc => doc.clientId === clientId);
  }, [documents]);

  // Get client documents statistics
  const getClientDocumentsStats = useCallback((clientId) => {
    const clientDocs = documents.filter(doc => doc.clientId === clientId);
    return {
      total: clientDocs.length,
      byCategory: clientDocs.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
      }, {}),
      totalSize: clientDocs.reduce((acc, doc) => acc + (doc.fileSize || 0), 0)
    };
  }, [documents]);

  // Helper function to check if current user owns a document
  const isOwner = useCallback((document) => {
    if (!currentUser || !document) {
      console.log('❌ isOwner: Missing user or document', { currentUser, document });
      return false;
    }
    
    // Extract user ID with multiple fallbacks
    const userId = currentUser._id || currentUser.id || currentUser.userId;
    
    // Extract document user ID with multiple fallbacks
    const documentUserId = document.userId || document.ownerId || document.uploadedBy || document.uploadedById;
    
    console.log('🔐 Ownership check details:', {
      userId,
      documentUserId,
      documentId: document._id,
      documentName: document.originalName || document.name
    });
    
    if (!documentUserId) {
      console.log('⚠️ Document has no owner ID field');
      return false;
    }
    
    const owns = userId.toString() === documentUserId.toString();
    
    console.log('🔐 Ownership result:', owns);
    
    return owns;
  }, [currentUser]);

  // Initial load when user changes
  useEffect(() => {
    if (currentUser && !initialLoadRef.current) {
      console.log('👤 User authenticated, loading documents...');
      initialLoadRef.current = true;
      refreshDocuments();
    } else if (!currentUser) {
      console.log('👤 No user, clearing documents and storage info...');
      setDocuments([]);
      setStorageInfo({ used: 0, available: 1073741824, total: 1073741824 });
      initialLoadRef.current = false;
    }
  }, [currentUser, refreshDocuments]);

  const value = {
    documents,
    loading,
    error,
    storageInfo,
    filters,
    pagination,
    fetchDocuments,
    uploadDocument,
    uploadMultipleDocuments,
    updateDocument,
    deleteDocument,
    downloadDocument,
    getDocumentById,
    getDocumentsByClient,
    getClientDocumentsStats,
    isOwner, // Export the isOwner function
    updateFilters,
    updatePagination,
    refreshDocuments,
    clearError
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
};