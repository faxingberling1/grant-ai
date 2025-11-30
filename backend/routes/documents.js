const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document');
const DocumentService = require('../services/documentService');
const { authMiddleware } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // File type validation will be handled by DocumentService
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  }
});

// GET /api/documents - Get all documents for authenticated user with advanced filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📥 GET /api/documents - Fetching documents for user:', req.user.email);
    
    const { 
      category = 'all',
      type = 'all',
      status = 'all',
      clientId,
      grantId,
      search,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    const filters = {
      category,
      type,
      status,
      clientId,
      grantId,
      search,
      tags,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await DocumentService.getUserDocuments(req.user._id, filters);

    console.log(`✅ Found ${result.documents.length} documents for user: ${req.user.email}`);

    res.json({
      success: true,
      data: result.documents,
      pagination: result.pagination,
      filters: {
        category,
        type,
        status,
        search: search || '',
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
});

// GET /api/documents/stats - Get comprehensive document statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    console.log('📊 GET /api/documents/stats - Fetching document statistics for user:', req.user.email);
    
    const result = await DocumentService.getDocumentStatistics(req.user._id);

    console.log(`📊 Document stats for ${req.user.email}:`, {
      total: result.stats.overview.totalDocuments,
      storage: result.stats.storage.used
    });

    res.json({
      success: true,
      data: result.stats
    });

  } catch (error) {
    console.error('❌ Error fetching document statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document statistics',
      error: error.message
    });
  }
});

// GET /api/documents/stats/storage - Get storage statistics (compatibility endpoint)
router.get('/stats/storage', authMiddleware, async (req, res) => {
  try {
    const result = await DocumentService.getDocumentStatistics(req.user._id);
    
    res.json({
      success: true,
      data: {
        totalDocuments: result.stats.overview.totalDocuments,
        totalStorageUsed: result.stats.overview.totalStorage,
        averageFileSize: result.stats.overview.totalStorage / Math.max(result.stats.overview.totalDocuments, 1),
        largestFile: Math.max(...result.stats.recentActivity.map(doc => doc.fileSize || 0), 0),
        byCategory: result.stats.byCategory,
        byType: result.stats.byType
      }
    });
  } catch (error) {
    console.error('❌ Error fetching storage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching storage statistics',
      error: error.message
    });
  }
});

// POST /api/documents/upload - Upload single document
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 POST /api/documents/upload - Uploading document for user:', req.user.email);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const documentData = {
      ...req.body,
      // Parse tags if provided
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : []
    };

    const result = await DocumentService.uploadDocument(req.user._id, req.file, documentData);

    console.log(`✅ Document uploaded successfully: ${result.document.originalName}`);

    res.status(201).json({
      success: true,
      data: result.document,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Error uploading document:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
});

// POST /api/documents/upload-multiple - Upload multiple documents
router.post('/upload-multiple', authMiddleware, upload.array('files', 10), async (req, res) => {
  try {
    console.log('📤 POST /api/documents/upload-multiple - Uploading multiple documents for user:', req.user.email);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const documentData = {
      ...req.body,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : []
    };

    const result = await DocumentService.uploadMultipleDocuments(req.user._id, req.files, documentData);

    console.log(`✅ Multiple documents upload completed: ${result.results.successful.length} successful, ${result.results.failed.length} failed`);

    res.status(201).json({
      success: true,
      data: result.results,
      message: result.message
    });

  } catch (error) {
    console.error('❌ Error uploading multiple documents:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
});

// GET /api/documents/:id - Get single document with access control
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await DocumentService.getDocumentById(req.params.id, req.user._id);

    console.log(`✅ Document fetched: ${result.document.originalName}`);

    res.json({
      success: true,
      data: result.document,
      access: result.access
    });

  } catch (error) {
    console.error('❌ Error fetching document:', error);
    
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'Access denied to this document') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching document',
      error: error.message
    });
  }
});

// PUT /api/documents/:id - Update document metadata
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await DocumentService.updateDocument(req.params.id, req.user._id, req.body);

    console.log(`✅ Document updated successfully: ${result.document.originalName}`);

    res.json({
      success: true,
      data: result.document,
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating document:', error);
    
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Insufficient permissions')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error updating document',
      error: error.message
    });
  }
});

// DELETE /api/documents/:id - Delete document (both database record and physical file)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/documents/:id - Deleting document:', req.params.id);
    console.log('👤 Current user making request:', {
      userId: req.user._id,
      email: req.user.email,
      role: req.user.role
    });
    
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // ENHANCED: Detailed ownership debugging
    console.log('🔐 OWNERSHIP CHECK - DETAILED DEBUG:', {
      documentUserId: document.userId,
      documentUserIdType: typeof document.userId,
      documentUserIdString: document.userId.toString(),
      requestUserId: req.user._id,
      requestUserIdType: typeof req.user._id,
      requestUserIdString: req.user._id.toString(),
      strictEquality: document.userId.toString() === req.user._id.toString(),
      valueEquality: document.userId.equals(req.user._id),
      areBothObjectIds: mongoose.Types.ObjectId.isValid(document.userId) && mongoose.Types.ObjectId.isValid(req.user._id)
    });

    // Check ownership with enhanced debugging
    if (!document.userId.equals(req.user._id)) {
      console.log('❌ ACCESS DENIED - Ownership mismatch details:', {
        documentInfo: {
          id: document._id,
          name: document.originalName,
          uploadedBy: document.userId,
          uploadedAt: document.createdAt
        },
        userInfo: {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role
        },
        comparison: {
          documentUserId: document.userId.toString(),
          requestUserId: req.user._id.toString(),
          match: document.userId.toString() === req.user._id.toString()
        }
      });
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the document owner can delete it.',
        debug: {
          documentOwner: document.userId.toString(),
          currentUser: req.user._id.toString(),
          ownershipMatch: false
        }
      });
    }

    console.log('✅ Ownership verified - User owns the document');
    console.log('🔍 Document found for deletion:', {
      id: document._id,
      filename: document.filename,
      originalName: document.originalName,
      storagePath: document.storagePath,
      fileSize: document.fileSize
    });

    // Delete physical file from server
    let fileDeleted = false;
    let fileError = null;
    
    if (document.storagePath) {
      try {
        // Check if file exists before attempting deletion
        try {
          await fs.access(document.storagePath);
          await fs.unlink(document.storagePath);
          fileDeleted = true;
          console.log('✅ Physical file deleted from server:', document.storagePath);
        } catch (accessError) {
          console.warn('⚠️ File does not exist or cannot be accessed:', document.storagePath);
          fileError = accessError.message;
        }
      } catch (fileError) {
        console.warn('⚠️ Could not delete physical file:', fileError.message);
        fileError = fileError.message;
        // Continue with database deletion even if file deletion fails
      }
    } else {
      console.warn('⚠️ No storagePath found for document:', document._id);
      fileError = 'No storage path configured for this document';
    }

    // Delete from database
    await Document.findByIdAndDelete(req.params.id);
    console.log('✅ Database record deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully',
      details: {
        fileDeleted: fileDeleted,
        documentId: req.params.id,
        fileName: document.originalName,
        fileError: fileError
      }
    });

  } catch (error) {
    console.error('❌ Error deleting document:', error);
    
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
});

// NEW: Debug endpoint to check document ownership
router.get('/:id/debug-ownership', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 DEBUG: Checking document ownership for:', req.params.id);
    
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const ownershipDetails = {
      document: {
        _id: document._id,
        originalName: document.originalName,
        userId: document.userId,
        userIdString: document.userId.toString(),
        createdAt: document.createdAt
      },
      user: {
        _id: req.user._id,
        _idString: req.user._id.toString(),
        email: req.user.email,
        role: req.user.role
      },
      ownership: {
        strictStringMatch: document.userId.toString() === req.user._id.toString(),
        mongooseEquals: document.userId.equals(req.user._id),
        bothAreObjectIds: mongoose.Types.ObjectId.isValid(document.userId) && mongoose.Types.ObjectId.isValid(req.user._id),
        userOwnsDocument: document.userId.equals(req.user._id)
      }
    };

    console.log('🔐 OWNERSHIP DEBUG RESULTS:', ownershipDetails);

    res.json({
      success: true,
      data: ownershipDetails,
      message: ownershipDetails.ownership.userOwnsDocument 
        ? 'User owns this document' 
        : 'User does NOT own this document'
    });

  } catch (error) {
    console.error('❌ Error in ownership debug:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking ownership',
      error: error.message
    });
  }
});

// DELETE /api/documents/:id/hard - Hard delete document (remove from database and file system)
router.delete('/:id/hard', authMiddleware, async (req, res) => {
  try {
    console.log('💀 DELETE /api/documents/:id/hard - Hard deleting document:', req.params.id);
    
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Enhanced ownership check with debugging
    console.log('🔐 HARD DELETE - Ownership check:', {
      documentUserId: document.userId.toString(),
      requestUserId: req.user._id.toString(),
      match: document.userId.equals(req.user._id)
    });

    if (!document.userId.equals(req.user._id)) {
      console.log('❌ Hard delete access denied - User does not own document');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the document owner can delete it.'
      });
    }

    // Store file info for response
    const fileInfo = {
      originalName: document.originalName,
      storagePath: document.storagePath,
      fileSize: document.fileSize
    };

    // Delete physical file from server
    let fileDeleted = false;
    let fileError = null;
    
    if (document.storagePath) {
      try {
        // Check if file exists before attempting deletion
        try {
          await fs.access(document.storagePath);
          await fs.unlink(document.storagePath);
          fileDeleted = true;
          console.log('✅ Physical file deleted from server:', document.storagePath);
        } catch (accessError) {
          console.warn('⚠️ File does not exist or cannot be accessed:', document.storagePath);
          fileError = accessError.message;
        }
      } catch (fileError) {
        console.error('❌ Error deleting physical file:', fileError);
        fileError = fileError.message;
      }
    }

    // Delete from database
    await Document.findByIdAndDelete(req.params.id);
    console.log('✅ Database record deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Document permanently deleted',
      details: {
        fileDeleted: fileDeleted,
        documentId: req.params.id,
        fileName: fileInfo.originalName,
        fileError: fileError
      }
    });

  } catch (error) {
    console.error('❌ Error hard deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting document',
      error: error.message
    });
  }
});

// POST /api/documents/:id/restore - Restore soft deleted document
router.post('/:id/restore', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check ownership
    if (!document.userId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only owner can restore document.'
      });
    }

    await document.restore();

    console.log(`✅ Document restored: ${document.filename}`);

    res.json({
      success: true,
      data: document,
      message: 'Document restored successfully'
    });

  } catch (error) {
    console.error('❌ Error restoring document:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring document',
      error: error.message
    });
  }
});

// POST /api/documents/:id/share - Share document with another user
router.post('/:id/share', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, permission = 'view', expiresAt = null } = req.body;

    const result = await DocumentService.shareDocument(
      req.params.id, 
      req.user._id, 
      targetUserId, 
      permission, 
      expiresAt
    );

    console.log(`✅ Document shared with user: ${targetUserId}`);

    res.json({
      success: true,
      data: result.document,
      message: 'Document shared successfully'
    });

  } catch (error) {
    console.error('❌ Error sharing document:', error);
    
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error sharing document',
      error: error.message
    });
  }
});

// DELETE /api/documents/:id/share/:userId - Remove share
router.delete('/:id/share/:userId', authMiddleware, async (req, res) => {
  try {
    const result = await DocumentService.removeShare(
      req.params.id, 
      req.user._id, 
      req.params.userId
    );

    console.log(`✅ Share removed for user: ${req.params.userId}`);

    res.json({
      success: true,
      data: result.document,
      message: 'Share removed successfully'
    });

  } catch (error) {
    console.error('❌ Error removing share:', error);
    
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error removing share',
      error: error.message
    });
  }
});

// GET /api/documents/shared/with-me - Get documents shared with current user
router.get('/shared/with-me', authMiddleware, async (req, res) => {
  try {
    const { category = 'all', search, page = 1, limit = 20 } = req.query;

    const filters = {
      category,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await DocumentService.getSharedDocuments(req.user._id, filters);

    console.log(`✅ Found ${result.documents.length} documents shared with user: ${req.user.email}`);

    res.json({
      success: true,
      data: result.documents,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('❌ Error fetching shared documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shared documents',
      error: error.message
    });
  }
});

// GET /api/documents/popular - Get popular documents
router.get('/popular', authMiddleware, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const documents = await Document.getPopularDocuments(req.user._id, parseInt(limit))
      .populate('userId', 'name email')
      .populate('clientId', 'name')
      .populate('grantId', 'title');

    res.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('❌ Error fetching popular documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular documents',
      error: error.message
    });
  }
});

// POST /api/documents/:id/download - Track document download
router.post('/:id/download', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user has access to this document
    const access = document.canUserAccess(req.user._id);
    if (!access.canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Download access denied'
      });
    }

    // Increment download count
    await document.incrementDownloadCount();
    document.lastAccessedBy = req.user._id;
    await document.save();

    console.log(`✅ Download tracked for document: ${document.filename}`);

    // In a real implementation, you would serve the file here
    res.json({
      success: true,
      message: 'Download prepared successfully',
      downloadUrl: `/api/documents/${document._id}/file`, // This would be your actual file serving endpoint
      document: {
        id: document._id,
        filename: document.filename,
        originalName: document.originalName,
        fileSize: document.fileSize,
        mimeType: document.mimeType
      }
    });

  } catch (error) {
    console.error('❌ Error preparing download:', error);
    res.status(500).json({
      success: false,
      message: 'Error preparing download',
      error: error.message
    });
  }
});

// GET /api/documents/:id/file - Serve document file (protected)
router.get('/:id/file', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user has access to this document
    const access = document.canUserAccess(req.user._id);
    if (!access.canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this file'
      });
    }

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(document.storagePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Length', document.fileSize);

    // Stream the file
    const fileStream = fs.createReadStream(document.storagePath);
    fileStream.pipe(res);

    // Track download
    await document.incrementDownloadCount();
    document.lastAccessedBy = req.user._id;
    await document.save();

  } catch (error) {
    console.error('❌ Error serving file:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving file',
      error: error.message
    });
  }
});

// GET /api/documents/categories/list - Get available categories
router.get('/categories/list', authMiddleware, async (req, res) => {
  try {
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
      { id: 'meeting-notes', label: 'Meeting Notes', icon: 'fas fa-sticky-note' },
      { id: 'communication', label: 'Communication', icon: 'fas fa-envelope' },
      { id: 'research', label: 'Research', icon: 'fas fa-search' },
      { id: 'presentations', label: 'Presentations', icon: 'fas fa-presentation' },
      { id: 'budgets', label: 'Budgets', icon: 'fas fa-calculator' },
      { id: 'other', label: 'Other', icon: 'fas fa-file' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// POST /api/documents/search - Advanced document search
router.post('/search', authMiddleware, async (req, res) => {
  try {
    const searchCriteria = req.body;

    const result = await DocumentService.searchDocuments(req.user._id, searchCriteria);

    res.json({
      success: true,
      data: result.documents,
      total: result.total
    });

  } catch (error) {
    console.error('❌ Error searching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching documents',
      error: error.message
    });
  }
});

// POST /api/documents/:id/version - Create new version of document
router.post('/:id/version', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    console.log('🔄 POST /api/documents/:id/version - Creating new version for user:', req.user.email);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided for new version'
      });
    }

    const versionData = {
      description: req.body.description,
      notes: req.body.notes,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : []
    };

    const result = await DocumentService.createNewVersion(
      req.params.id, 
      req.user._id, 
      req.file, 
      versionData
    );

    console.log(`✅ New version created: ${result.document.originalName} (v${result.document.version})`);

    res.status(201).json({
      success: true,
      data: result.document,
      message: 'New version created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating new version:', error);
    
    if (error.message === 'Original document not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error creating new version',
      error: error.message
    });
  }
});

// GET /api/documents/:id/versions - Get version history
router.get('/:id/versions', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access
    const access = document.canUserAccess(req.user._id);
    if (!access.canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get all versions of this document
    const versions = await Document.find({
      $or: [
        { _id: document._id },
        { parentDocument: document._id }
      ]
    })
    .populate('userId', 'name email')
    .sort({ version: 1 });

    res.json({
      success: true,
      data: versions
    });

  } catch (error) {
    console.error('❌ Error fetching version history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching version history',
      error: error.message
    });
  }
});

// GET /api/documents/:id/debug - Debug document information
router.get('/:id/debug', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check file existence
    const fileExists = document.storagePath ? await fs.access(document.storagePath).then(() => true).catch(() => false) : false;

    res.json({
      success: true,
      data: {
        document: {
          _id: document._id,
          originalName: document.originalName,
          filename: document.filename,
          storagePath: document.storagePath,
          fileSize: document.fileSize,
          userId: document.userId,
          mimeType: document.mimeType,
          createdAt: document.createdAt,
          isDeleted: document.isDeleted
        },
        fileInfo: {
          exists: fileExists,
          path: document.storagePath,
          userOwnsDocument: document.userId.equals(req.user._id)
        },
        user: {
          id: req.user._id,
          email: req.user.email
        }
      }
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

// DELETE /api/documents/:id/permanent - Permanently delete document (admin/owner only)
router.delete('/:id/permanent', authMiddleware, async (req, res) => {
  try {
    const result = await DocumentService.permanentlyDeleteDocument(req.params.id, req.user._id);

    console.log(`✅ Document permanently deleted: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Document permanently deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error permanently deleting document:', error);
    
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error permanently deleting document',
      error: error.message
    });
  }
});

// GET /api/documents/analytics/storage - Get storage analytics (admin only)
router.get('/analytics/storage', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const result = await DocumentService.getStorageAnalytics();

    res.json({
      success: true,
      data: result.analytics
    });

  } catch (error) {
    console.error('❌ Error fetching storage analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching storage analytics',
      error: error.message
    });
  }
});

// POST /api/documents/maintenance/cleanup - Clean up orphaned files (admin only)
router.post('/maintenance/cleanup', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const result = await DocumentService.cleanupOrphanedFiles();

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Error during cleanup',
      error: error.message
    });
  }
});

module.exports = router;