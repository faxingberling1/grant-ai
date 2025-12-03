const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document');
const DocumentService = require('../services/documentService');
const { 
  authMiddleware, 
  emailVerifiedMiddleware,
  approvedAccountMiddleware,
  fileUploadValidationMiddleware,
  documentStorageMiddleware 
} = require('../middleware/auth');
const gridfsService = require('../services/gridfsService');

// Configure multer for memory storage (CRITICAL for Render - no filesystem!)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (free tier friendly)
    files: 1 // Single file per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/json',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, JSON, JPG, PNG, GIF allowed.`), false);
    }
  }
});

// ===== HELPER FUNCTIONS =====
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===== ROUTES =====

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
      limit: Math.min(parseInt(limit), 100) // Max 100 per page
    };

    // Build query
    const query = { userId: req.user._id };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (clientId) {
      query.clientId = clientId;
    }
    
    if (grantId) {
      query.grantId = grantId;
    }
    
    if (type && type !== 'all') {
      query.documentType = type;
    }
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { filename: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Get total count
    const total = await Document.countDocuments(query);
    
    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit;
    const sort = { [filters.sortBy]: filters.sortOrder === 'asc' ? 1 : -1 };

    // Get documents
    const documents = await Document.find(query)
      .sort(sort)
      .skip(skip)
      .limit(filters.limit)
      .populate('clientId', 'organizationName')
      .populate('grantId', 'title')
      .lean();

    // Format response
    const formattedDocs = documents.map(doc => ({
      _id: doc._id,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
      fileSizeFormatted: formatBytes(doc.fileSize),
      mimeType: doc.mimeType,
      category: doc.category,
      tags: doc.tags,
      description: doc.description,
      documentType: doc.documentType,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      downloadCount: doc.downloadCount,
      viewCount: doc.viewCount,
      downloadUrl: doc.downloadUrl,
      isImage: doc.mimeType.startsWith('image/'),
      isPdf: doc.mimeType === 'application/pdf',
      storageProvider: doc.storageProvider,
      clientId: doc.clientId,
      grantId: doc.grantId,
      gridfsFileId: doc.gridfsFileId,
      client: doc.clientId,
      grant: doc.grantId
    }));

    console.log(`✅ Found ${documents.length} documents for user: ${req.user.email}`);

    res.json({
      success: true,
      data: formattedDocs,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
        hasNext: filters.page < Math.ceil(total / filters.limit),
        hasPrev: filters.page > 1
      },
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
    
    // Get storage stats from GridFS
    const gridfsStats = await gridfsService.getStorageStats();
    
    // Get document stats from database
    const totalDocuments = await Document.countDocuments({ 
      userId: req.user._id, 
      status: { $ne: 'deleted' } 
    });
    
    const storageUsed = await Document.aggregate([
      { $match: { userId: req.user._id, status: { $ne: 'deleted' } } },
      { $group: { _id: null, total: { $sum: '$fileSize' } } }
    ]);
    
    const byCategory = await Document.aggregate([
      { $match: { userId: req.user._id, status: { $ne: 'deleted' } } },
      { $group: { _id: '$category', count: { $sum: 1 }, size: { $sum: '$fileSize' } } },
      { $sort: { count: -1 } }
    ]);
    
    const byType = await Document.aggregate([
      { $match: { userId: req.user._id, status: { $ne: 'deleted' } } },
      { $group: { _id: '$documentType', count: { $sum: 1 }, size: { $sum: '$fileSize' } } },
      { $sort: { count: -1 } }
    ]);
    
    const recentActivity = await Document.find({ 
      userId: req.user._id, 
      status: { $ne: 'deleted' } 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalName fileSize createdAt category')
      .lean();

    const stats = {
      overview: {
        totalDocuments,
        totalStorage: storageUsed[0]?.total || 0,
        totalStorageFormatted: formatBytes(storageUsed[0]?.total || 0),
        averageFileSize: totalDocuments > 0 ? Math.round((storageUsed[0]?.total || 0) / totalDocuments) : 0
      },
      storage: {
        used: storageUsed[0]?.total || 0,
        usedFormatted: formatBytes(storageUsed[0]?.total || 0),
        gridfsStats: gridfsStats
      },
      byCategory: byCategory.map(cat => ({
        ...cat,
        sizeFormatted: formatBytes(cat.size)
      })),
      byType: byType.map(type => ({
        ...type,
        sizeFormatted: formatBytes(type.size)
      })),
      recentActivity
    };

    console.log(`📊 Document stats for ${req.user.email}:`, {
      total: stats.overview.totalDocuments,
      storage: stats.overview.totalStorageFormatted
    });

    res.json({
      success: true,
      data: stats
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
    const totalDocuments = await Document.countDocuments({ 
      userId: req.user._id, 
      status: { $ne: 'deleted' } 
    });
    
    const storageUsed = await Document.aggregate([
      { $match: { userId: req.user._id, status: { $ne: 'deleted' } } },
      { $group: { _id: null, total: { $sum: '$fileSize' } } }
    ]);
    
    const byCategory = await Document.aggregate([
      { $match: { userId: req.user._id, status: { $ne: 'deleted' } } },
      { $group: { _id: '$category', count: { $sum: 1 }, size: { $sum: '$fileSize' } } }
    ]);
    
    const byType = await Document.aggregate([
      { $match: { userId: req.user._id, status: { $ne: 'deleted' } } },
      { $group: { _id: '$documentType', count: { $sum: 1 }, size: { $sum: '$fileSize' } } }
    ]);
    
    // Get user storage limit
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        totalDocuments,
        totalStorageUsed: storageUsed[0]?.total || 0,
        totalStorageUsedFormatted: formatBytes(storageUsed[0]?.total || 0),
        averageFileSize: totalDocuments > 0 ? Math.round((storageUsed[0]?.total || 0) / totalDocuments) : 0,
        largestFile: await Document.findOne({ userId: req.user._id }).sort({ fileSize: -1 }).select('fileSize').then(doc => doc?.fileSize || 0),
        byCategory: byCategory.reduce((acc, cat) => {
          acc[cat._id] = { count: cat.count, size: cat.size, sizeFormatted: formatBytes(cat.size) };
          return acc;
        }, {}),
        byType: byType.reduce((acc, type) => {
          acc[type._id] = { count: type.count, size: type.size, sizeFormatted: formatBytes(type.size) };
          return acc;
        }, {}),
        storageLimit: user?.storageLimit || 10 * 1024 * 1024, // 10MB default
        storageLimitFormatted: formatBytes(user?.storageLimit || 10 * 1024 * 1024),
        storageUsedPercent: user?.storageLimit ? 
          Math.min(100, ((storageUsed[0]?.total || 0) / user.storageLimit) * 100) : 0
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

// POST /api/documents/upload - Upload single document to GridFS
router.post('/upload', 
  authMiddleware,
  emailVerifiedMiddleware,
  approvedAccountMiddleware,
  fileUploadValidationMiddleware,
  upload.single('file'),
  async (req, res) => {
    try {
      console.log('📤 POST /api/documents/upload - Uploading document to GridFS for user:', req.user.email);
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided'
        });
      }

      console.log(`📁 Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

      // Prepare metadata for GridFS
      const metadata = {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
        category: req.body.category || 'other',
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
        description: req.body.description || '',
        clientId: req.body.clientId || null,
        grantId: req.body.grantId || null
      };

      // Upload to GridFS
      const uploadResult = await gridfsService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        metadata
      );

      if (!uploadResult || !uploadResult.fileId) {
        throw new Error('GridFS upload failed - no file ID returned');
      }

      // Create document record
      const document = new Document({
        userId: req.user._id,
        filename: req.file.originalname,
        originalName: req.file.originalname,
        fileExtension: req.file.originalname.split('.').pop() || '',
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        storageProvider: 'gridfs',
        gridfsFileId: uploadResult.fileId,
        gridfsFilename: uploadResult.gridfsFilename,
        checksum: uploadResult.checksum,
        category: req.body.category || 'other',
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
        description: req.body.description || '',
        clientId: req.body.clientId || null,
        grantId: req.body.grantId || null,
        status: 'draft',
        documentType: getDocumentType(req.file.mimetype),
        sensitivityLevel: req.body.sensitivityLevel || 'internal',
        visibility: 'private'
      });

      await document.save();

      // Update user storage usage
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      user.storageUsage = (user.storageUsage || 0) + req.file.size;
      user.documentCount = (user.documentCount || 0) + 1;
      await user.save();

      console.log(`✅ Document uploaded successfully to GridFS: ${document._id}`);

      // Return success response
      const response = {
        success: true,
        data: {
          _id: document._id,
          originalName: document.originalName,
          fileSize: document.fileSize,
          fileSizeFormatted: formatBytes(document.fileSize),
          mimeType: document.mimeType,
          category: document.category,
          tags: document.tags,
          description: document.description,
          createdAt: document.createdAt,
          downloadUrl: document.downloadUrl,
          isImage: document.mimeType.startsWith('image/'),
          isPdf: document.mimeType === 'application/pdf',
          storageProvider: document.storageProvider,
          gridfsFileId: document.gridfsFileId
        },
        message: 'Document uploaded successfully to secure storage'
      };

      res.status(201).json(response);

    } catch (error) {
      console.error('❌ Error uploading document:', error);
      
      let statusCode = 500;
      let errorMessage = 'Failed to upload document';
      
      if (error.message.includes('GridFS bucket not initialized')) {
        statusCode = 503;
        errorMessage = 'File storage service temporarily unavailable';
      } else if (error.message.includes('no file ID')) {
        statusCode = 500;
        errorMessage = 'File storage error - please try again';
      } else if (error.message.includes('File too large')) {
        statusCode = 413;
        errorMessage = error.message;
      } else if (error.message.includes('Invalid file type')) {
        statusCode = 400;
        errorMessage = error.message;
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Helper function to determine document type
function getDocumentType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word-doc';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType.includes('json')) return 'json';
  if (mimeType.includes('csv')) return 'spreadsheet';
  return 'other';
}

// GET /api/documents/:id - Get single document with access control
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('clientId', 'organizationName')
      .populate('grantId', 'title')
      .lean();

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
        message: 'Access denied to this document',
        access
      });
    }

    // Get GridFS info if available
    let gridfsInfo = null;
    if (document.storageProvider === 'gridfs' && document.gridfsFileId) {
      try {
        gridfsInfo = await gridfsService.getFileInfo(document.gridfsFileId);
      } catch (error) {
        console.warn('Could not fetch GridFS info:', error.message);
      }
    }

    // Format response
    const response = {
      _id: document._id,
      originalName: document.originalName,
      fileSize: document.fileSize,
      fileSizeFormatted: formatBytes(document.fileSize),
      mimeType: document.mimeType,
      category: document.category,
      tags: document.tags,
      description: document.description,
      documentType: document.documentType,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      downloadCount: document.downloadCount,
      viewCount: document.viewCount,
      downloadUrl: document.downloadUrl,
      isImage: document.mimeType.startsWith('image/'),
      isPdf: document.mimeType === 'application/pdf',
      storageProvider: document.storageProvider,
      clientId: document.clientId,
      grantId: document.grantId,
      client: document.clientId,
      grant: document.grantId,
      gridfsFileId: document.gridfsFileId,
      gridfsInfo: gridfsInfo ? {
        uploadDate: gridfsInfo.uploadDate,
        chunkSize: gridfsInfo.chunkSize,
        md5: gridfsInfo.md5,
        filename: gridfsInfo.filename
      } : null,
      access
    };

    console.log(`✅ Document fetched: ${response.originalName}`);

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ Error fetching document:', error);
    
    if (error.message.includes('Document not found')) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this document'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching document',
      error: error.message
    });
  }
});

// GET /api/documents/:id/download - Download document from GridFS
router.get('/:id/download', authMiddleware, async (req, res) => {
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
        message: 'Access denied to this document'
      });
    }

    // For GridFS documents
    if (document.storageProvider === 'gridfs' && document.gridfsFileId) {
      try {
        const fileStream = gridfsService.getFileStream(document.gridfsFileId);
        
        // Increment download count
        await document.incrementDownloadCount();
        document.lastAccessedBy = req.user._id;
        await document.save();

        // Set headers
        const filename = encodeURIComponent(document.originalName);
        res.set({
          'Content-Type': document.mimeType,
          'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${filename}`,
          'Content-Length': document.fileSize,
          'Cache-Control': 'private, max-age=3600',
          'X-File-Name': filename,
          'X-File-Size': document.fileSize,
          'X-File-Type': document.mimeType
        });

        // Pipe file stream to response
        fileStream.on('error', (error) => {
          console.error('Stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Error streaming file'
            });
          }
        });
        
        fileStream.pipe(res);
        return;

      } catch (error) {
        console.error('GridFS download error:', error);
        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message: 'Error downloading file from storage'
          });
        }
      }
    }
    
    // For non-GridFS documents (legacy support)
    if (document.storagePath) {
      const fs = require('fs');
      if (!fs.existsSync(document.storagePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

      // Track download
      await document.incrementDownloadCount();
      document.lastAccessedBy = req.user._id;
      await document.save();

      // Set headers
      res.set({
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(document.originalName)}"`,
        'Content-Length': document.fileSize,
        'Cache-Control': 'private, max-age=3600'
      });

      // Stream the file
      const fileStream = fs.createReadStream(document.storagePath);
      fileStream.pipe(res);
      return;
    }

    // No storage method found
    res.status(404).json({
      success: false,
      message: 'File not found in storage'
    });

  } catch (error) {
    console.error('❌ Error downloading document:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error downloading document',
        error: error.message
      });
    }
  }
});

// PUT /api/documents/:id - Update document metadata
router.put('/:id', authMiddleware, async (req, res) => {
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
        message: 'Insufficient permissions. Only document owner can update.'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'category', 'description', 'tags', 'status', 
      'sensitivityLevel', 'visibility', 'clientId', 'grantId',
      'subcategory', 'workflowStage'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'tags' && typeof req.body[field] === 'string') {
          document[field] = req.body[field].split(',').map(tag => tag.trim());
        } else {
          document[field] = req.body[field];
        }
      }
    });

    await document.save();

    console.log(`✅ Document updated: ${document.originalName}`);

    res.json({
      success: true,
      data: {
        _id: document._id,
        originalName: document.originalName,
        category: document.category,
        description: document.description,
        tags: document.tags,
        status: document.status,
        updatedAt: document.updatedAt
      },
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating document:', error);
    
    if (error.message.includes('Document not found')) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
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

// DELETE /api/documents/:id - Delete document (both database record and GridFS file)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/documents/:id - Deleting document:', req.params.id);
    console.log('👤 Current user:', {
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

    // Check ownership
    if (!document.userId.equals(req.user._id)) {
      console.log('❌ ACCESS DENIED:', {
        documentOwner: document.userId.toString(),
        currentUser: req.user._id.toString(),
        match: false
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

    console.log('✅ Ownership verified');
    console.log('🔍 Document details:', {
      id: document._id,
      filename: document.originalName,
      storageProvider: document.storageProvider,
      gridfsFileId: document.gridfsFileId,
      fileSize: document.fileSize
    });

    // Delete from GridFS if using GridFS
    let gridfsDeleted = false;
    let gridfsError = null;
    
    if (document.storageProvider === 'gridfs' && document.gridfsFileId) {
      try {
        await gridfsService.deleteFile(document.gridfsFileId);
        gridfsDeleted = true;
        console.log('✅ GridFS file deleted:', document.gridfsFileId);
      } catch (error) {
        console.warn('⚠️ Could not delete GridFS file:', error.message);
        gridfsError = error.message;
      }
    }
    
    // Delete from database
    await Document.findByIdAndDelete(req.params.id);
    console.log('✅ Database record deleted:', req.params.id);

    // Update user storage usage
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (user) {
      user.storageUsage = Math.max(0, (user.storageUsage || 0) - document.fileSize);
      user.documentCount = Math.max(0, (user.documentCount || 0) - 1);
      await user.save();
      console.log('✅ User storage updated');
    }

    res.json({
      success: true,
      message: 'Document deleted successfully',
      details: {
        gridfsDeleted,
        documentId: req.params.id,
        fileName: document.originalName,
        gridfsError
      }
    });

  } catch (error) {
    console.error('❌ Error deleting document:', error);
    
    if (error.message.includes('Document not found')) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
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

    // Check if GridFS file still exists
    if (document.storageProvider === 'gridfs' && document.gridfsFileId) {
      try {
        const fileExists = await gridfsService.fileExists(document.gridfsFileId);
        if (!fileExists) {
          return res.status(404).json({
            success: false,
            message: 'Original file not found in storage. Cannot restore.'
          });
        }
      } catch (error) {
        console.warn('Error checking GridFS file:', error);
      }
    }

    document.status = 'draft';
    document.deletedAt = null;
    await document.save();

    console.log(`✅ Document restored: ${document.originalName}`);

    res.json({
      success: true,
      data: {
        _id: document._id,
        originalName: document.originalName,
        status: document.status
      },
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

    // Check access
    const access = document.canUserAccess(req.user._id);
    if (!access.canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this document'
      });
    }

    // Check GridFS file existence
    let gridfsFileExists = null;
    let gridfsInfo = null;
    
    if (document.storageProvider === 'gridfs' && document.gridfsFileId) {
      try {
        gridfsFileExists = await gridfsService.fileExists(document.gridfsFileId);
        gridfsInfo = await gridfsService.getFileInfo(document.gridfsFileId);
      } catch (error) {
        console.warn('GridFS check error:', error);
        gridfsFileExists = false;
      }
    }

    res.json({
      success: true,
      data: {
        document: {
          _id: document._id,
          originalName: document.originalName,
          filename: document.filename,
          storagePath: document.storagePath,
          storageProvider: document.storageProvider,
          gridfsFileId: document.gridfsFileId,
          fileSize: document.fileSize,
          userId: document.userId,
          mimeType: document.mimeType,
          createdAt: document.createdAt,
          status: document.status,
          isDeleted: document.status === 'deleted'
        },
        gridfs: {
          fileExists: gridfsFileExists,
          info: gridfsInfo,
          hasGridfsFile: document.storageProvider === 'gridfs' && document.gridfsFileId
        },
        access: {
          canAccess: access.canAccess,
          permission: access.permission,
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

// POST /api/documents/search - Advanced document search
router.post('/search', authMiddleware, async (req, res) => {
  try {
    const { 
      searchTerm, 
      category, 
      documentType, 
      clientId, 
      grantId,
      dateFrom, 
      dateTo,
      tags,
      page = 1,
      limit = 50 
    } = req.body;

    const query = { userId: req.user._id, status: { $ne: 'deleted' } };

    // Text search
    if (searchTerm) {
      query.$or = [
        { originalName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { filename: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Filters
    if (category && category !== 'all') query.category = category;
    if (documentType && documentType !== 'all') query.documentType = documentType;
    if (clientId) query.clientId = clientId;
    if (grantId) query.grantId = grantId;
    if (tags && tags.length > 0) query.tags = { $in: tags };

    // Date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Get total count
    const total = await Document.countDocuments(query);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get documents
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('clientId', 'organizationName')
      .populate('grantId', 'title')
      .lean();

    // Format response
    const formattedDocs = documents.map(doc => ({
      _id: doc._id,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
      fileSizeFormatted: formatBytes(doc.fileSize),
      mimeType: doc.mimeType,
      category: doc.category,
      tags: doc.tags,
      description: doc.description,
      documentType: doc.documentType,
      createdAt: doc.createdAt,
      downloadUrl: doc.downloadUrl,
      storageProvider: doc.storageProvider,
      client: doc.clientId,
      grant: doc.grantId
    }));

    res.json({
      success: true,
      data: formattedDocs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
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

// POST /api/documents/upload-multiple - Upload multiple documents (GridFS)
router.post('/upload-multiple', 
  authMiddleware,
  emailVerifiedMiddleware,
  approvedAccountMiddleware,
  fileUploadValidationMiddleware,
  upload.array('files', 5), // Max 5 files at once (free tier friendly)
  async (req, res) => {
    try {
      console.log('📤 POST /api/documents/upload-multiple - Uploading multiple documents to GridFS');
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided'
        });
      }

      console.log(`📁 Processing ${req.files.length} files`);

      const results = {
        successful: [],
        failed: []
      };

      // Process each file
      for (const file of req.files) {
        try {
          // Prepare metadata for GridFS
          const metadata = {
            userId: req.user._id.toString(),
            userEmail: req.user.email,
            originalName: file.originalname,
            contentType: file.mimetype,
            category: req.body.category || 'other',
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            description: req.body.description || '',
            clientId: req.body.clientId || null,
            grantId: req.body.grantId || null
          };

          // Upload to GridFS
          const uploadResult = await gridfsService.uploadFile(
            file.buffer,
            file.originalname,
            metadata
          );

          if (!uploadResult || !uploadResult.fileId) {
            throw new Error('GridFS upload failed');
          }

          // Create document record
          const document = new Document({
            userId: req.user._id,
            filename: file.originalname,
            originalName: file.originalname,
            fileExtension: file.originalname.split('.').pop() || '',
            fileSize: file.size,
            mimeType: file.mimetype,
            storageProvider: 'gridfs',
            gridfsFileId: uploadResult.fileId,
            gridfsFilename: uploadResult.gridfsFilename,
            checksum: uploadResult.checksum,
            category: req.body.category || 'other',
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            description: req.body.description || '',
            clientId: req.body.clientId || null,
            grantId: req.body.grantId || null,
            status: 'draft',
            documentType: getDocumentType(file.mimetype),
            sensitivityLevel: req.body.sensitivityLevel || 'internal',
            visibility: 'private'
          });

          await document.save();

          // Update user storage usage
          const User = require('../models/User');
          const user = await User.findById(req.user._id);
          user.storageUsage = (user.storageUsage || 0) + file.size;
          user.documentCount = (user.documentCount || 0) + 1;
          await user.save();

          results.successful.push({
            originalName: document.originalName,
            fileSize: document.fileSize,
            fileSizeFormatted: formatBytes(document.fileSize),
            documentId: document._id,
            gridfsFileId: document.gridfsFileId
          });

          console.log(`✅ Uploaded: ${document.originalName}`);

        } catch (error) {
          console.error(`❌ Failed to upload ${file.originalname}:`, error.message);
          results.failed.push({
            originalName: file.originalname,
            error: error.message,
            fileSize: file.size
          });
        }
      }

      const message = `Upload completed: ${results.successful.length} successful, ${results.failed.length} failed`;

      console.log(`📊 ${message}`);

      res.status(201).json({
        success: true,
        data: results,
        message: message
      });

    } catch (error) {
      console.error('❌ Error uploading multiple documents:', error);
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }
);

module.exports = router;