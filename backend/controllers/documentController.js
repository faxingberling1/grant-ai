const Document = require('../models/Document');
const User = require('../models/User');
const gridfsService = require('../services/gridfsService');

class DocumentController {
  constructor() {
    // Bind methods to maintain 'this' context
    this.uploadDocument = this.uploadDocument.bind(this);
    this.uploadMultipleDocuments = this.uploadMultipleDocuments.bind(this);
    this.getDocuments = this.getDocuments.bind(this);
    this.getDocumentById = this.getDocumentById.bind(this);
    this.downloadDocument = this.downloadDocument.bind(this);
    this.updateDocument = this.updateDocument.bind(this);
    this.deleteDocument = this.deleteDocument.bind(this);
    this.getDocumentStats = this.getDocumentStats.bind(this);
    this.getStorageStats = this.getStorageStats.bind(this);
    this.getSharedDocuments = this.getSharedDocuments.bind(this);
    this.shareDocument = this.shareDocument.bind(this);
    this.removeShare = this.removeShare.bind(this);
    this.restoreDocument = this.restoreDocument.bind(this);
    this.searchDocuments = this.searchDocuments.bind(this);
    this.createNewVersion = this.createNewVersion.bind(this);
    this.getVersionHistory = this.getVersionHistory.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getPopularDocuments = this.getPopularDocuments.bind(this);
    this.debugDocument = this.debugDocument.bind(this);
    this.permanentlyDeleteDocument = this.permanentlyDeleteDocument.bind(this);
    this.getDocumentAnalytics = this.getDocumentAnalytics.bind(this);
  }

  /**
   * Upload single document to GridFS
   */
  async uploadDocument(req, res) {
    try {
      console.log('📤 POST /api/documents/upload - Uploading document to GridFS');
      console.log('👤 User:', req.user.email);
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided'
        });
      }

      console.log(`📁 Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

      // Validate file size (5MB max for free tier)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return res.status(413).json({
          success: false,
          message: `File too large. Maximum size is ${this.formatBytes(maxSize)}`,
          maxSize,
          fileSize: req.file.size,
          fileSizeFormatted: this.formatBytes(req.file.size)
        });
      }

      // Validate file type
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
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, JSON, JPG, PNG, GIF are allowed.',
          fileType: req.file.mimetype,
          allowedTypes
        });
      }

      // Check user storage
      const user = await User.findById(req.user._id);
      if (!user || user.active === false) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      const availableStorage = user.availableStorage || (user.storageLimit - (user.storageUsage || 0));
      if (req.file.size > availableStorage) {
        return res.status(413).json({
          success: false,
          message: `Insufficient storage space. Available: ${this.formatBytes(availableStorage)}`,
          available: availableStorage,
          required: req.file.size
        });
      }

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
        grantId: req.body.grantId || null,
        sensitivityLevel: req.body.sensitivityLevel || 'internal'
      };

      console.log(`📤 Uploading to GridFS: ${req.file.originalname}`);

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
        fileExtension: this.getFileExtension(req.file.originalname),
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
        documentType: this.getDocumentType(req.file.mimetype, req.file.originalname),
        sensitivityLevel: req.body.sensitivityLevel || 'internal',
        visibility: 'private'
      });

      await document.save();

      // Update user storage usage
      user.storageUsage = (user.storageUsage || 0) + req.file.size;
      user.documentCount = (user.documentCount || 0) + 1;
      await user.save();

      console.log(`✅ Document uploaded successfully: ${document._id}`);

      // Return success response
      const response = {
        success: true,
        message: 'Document uploaded successfully',
        document: {
          _id: document._id,
          originalName: document.originalName,
          fileSize: document.fileSize,
          fileSizeFormatted: this.formatBytes(document.fileSize),
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
        }
      };

      res.status(201).json(response);

    } catch (error) {
      console.error('❌ Document upload error:', error);
      
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
      } else if (error.message.includes('Insufficient storage')) {
        statusCode = 413;
        errorMessage = error.message;
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Upload multiple documents to GridFS
   */
  async uploadMultipleDocuments(req, res) {
    try {
      console.log('📤 POST /api/documents/upload-multiple - Uploading multiple documents');
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided'
        });
      }

      console.log(`📁 Processing ${req.files.length} files`);

      const user = await User.findById(req.user._id);
      if (!user || user.active === false) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Check total storage
      const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
      const availableStorage = user.availableStorage || (user.storageLimit - (user.storageUsage || 0));
      
      if (totalSize > availableStorage) {
        return res.status(413).json({
          success: false,
          message: `Insufficient storage space for all files. Available: ${this.formatBytes(availableStorage)}`,
          available: availableStorage,
          required: totalSize
        });
      }

      const results = {
        successful: [],
        failed: []
      };

      // Process each file
      for (const file of req.files) {
        try {
          // Validate each file
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            throw new Error(`File too large: ${this.formatBytes(maxSize)} max`);
          }

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
          
          if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type');
          }

          // Prepare metadata
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
            fileExtension: this.getFileExtension(file.originalname),
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
            documentType: this.getDocumentType(file.mimetype, file.originalname),
            visibility: 'private'
          });

          await document.save();

          // Update user storage
          user.storageUsage = (user.storageUsage || 0) + file.size;
          user.documentCount = (user.documentCount || 0) + 1;

          results.successful.push({
            originalName: document.originalName,
            fileSize: document.fileSize,
            fileSizeFormatted: this.formatBytes(document.fileSize),
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

      // Save user after all updates
      await user.save();

      const message = `Upload completed: ${results.successful.length} successful, ${results.failed.length} failed`;

      console.log(`📊 ${message}`);

      res.status(201).json({
        success: true,
        data: results,
        message: message
      });

    } catch (error) {
      console.error('❌ Multiple document upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload documents',
        error: error.message
      });
    }
  }

  /**
   * Get all documents with filtering and pagination
   */
  async getDocuments(req, res) {
    try {
      console.log('📥 GET /api/documents - Fetching documents');
      
      const { 
        category = 'all',
        type = 'all',
        status = 'draft',
        clientId,
        grantId,
        search,
        tags,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 50
      } = req.query;

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
      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 100);
      const skip = (pageNum - 1) * limitNum;
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Get documents
      const documents = await Document.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('clientId', 'organizationName')
        .populate('grantId', 'title')
        .lean();

      // Format response
      const formattedDocs = documents.map(doc => ({
        _id: doc._id,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
        fileSizeFormatted: this.formatBytes(doc.fileSize),
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
        client: doc.clientId,
        grant: doc.grantId
      }));

      console.log(`✅ Found ${documents.length} documents`);

      res.json({
        success: true,
        data: formattedDocs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
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
  }

  /**
   * Get single document by ID
   */
  async getDocumentById(req, res) {
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
          message: 'Access denied to this document'
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

      // Increment view count
      await Document.findByIdAndUpdate(document._id, {
        $inc: { viewCount: 1 },
        lastAccessed: new Date(),
        lastAccessedBy: req.user._id
      });

      // Format response
      const response = {
        _id: document._id,
        originalName: document.originalName,
        fileSize: document.fileSize,
        fileSizeFormatted: this.formatBytes(document.fileSize),
        mimeType: document.mimeType,
        category: document.category,
        tags: document.tags,
        description: document.description,
        documentType: document.documentType,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        downloadCount: document.downloadCount,
        viewCount: document.viewCount + 1,
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
  }

  /**
   * Download document from GridFS
   */
  async downloadDocument(req, res) {
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
          
          // Update download count
          await Document.findByIdAndUpdate(document._id, {
            $inc: { downloadCount: 1 },
            lastAccessed: new Date(),
            lastAccessedBy: req.user._id
          });

          // Set headers
          const filename = encodeURIComponent(document.originalName);
          res.set({
            'Content-Type': document.mimeType,
            'Content-Disposition': `attachment; filename="${filename}"`,
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

        // Update download count
        await Document.findByIdAndUpdate(document._id, {
          $inc: { downloadCount: 1 },
          lastAccessed: new Date(),
          lastAccessedBy: req.user._id
        });

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
  }

  /**
   * Update document metadata
   */
  async updateDocument(req, res) {
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

      document.lastModified = new Date();
      document.lastModifiedBy = req.user._id;
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
  }

  /**
   * Delete document (soft delete)
   */
  async deleteDocument(req, res) {
    try {
      console.log('🗑️ DELETE /api/documents/:id - Deleting document');
      
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
          message: 'Access denied. Only the document owner can delete it.'
        });
      }

      console.log('✅ Ownership verified');

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
      
      // Soft delete document
      document.status = 'deleted';
      document.deletedAt = new Date();
      await document.save();

      // Update user storage usage
      const user = await User.findById(req.user._id);
      if (user) {
        user.storageUsage = Math.max(0, (user.storageUsage || 0) - document.fileSize);
        user.documentCount = Math.max(0, (user.documentCount || 0) - 1);
        await user.save();
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
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(req, res) {
    try {
      console.log('📊 GET /api/documents/stats - Fetching document statistics');
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get document counts by category
      const categoryStats = await Document.aggregate([
        { $match: { userId: req.user._id, status: { $ne: 'deleted' } } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalSize: { $sum: '$fileSize' } } },
        { $sort: { count: -1 } }
      ]);

      // Get document counts by type
      const typeStats = await Document.aggregate([
        { $match: { userId: req.user._id, status: { $ne: 'deleted' } } },
        { $group: { _id: '$documentType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get recent activity
      const recentActivity = await Document.find({ 
        userId: req.user._id, 
        status: { $ne: 'deleted' } 
      })
        .sort({ lastAccessed: -1 })
        .limit(10)
        .select('originalName fileSize category lastAccessed downloadCount')
        .lean();

      // Get total stats
      const totalStats = await Document.aggregate([
        { $match: { userId: req.user._id, status: { $ne: 'deleted' } } },
        { 
          $group: {
            _id: null,
            totalDocuments: { $sum: 1 },
            totalStorage: { $sum: '$fileSize' },
            totalViews: { $sum: '$viewCount' },
            totalDownloads: { $sum: '$downloadCount' }
          }
        }
      ]);

      const stats = totalStats[0] || {
        totalDocuments: 0,
        totalStorage: 0,
        totalViews: 0,
        totalDownloads: 0
      };

      // Get GridFS stats
      let gridfsStats = null;
      try {
        gridfsStats = await gridfsService.getStorageStats();
      } catch (error) {
        console.warn('Could not fetch GridFS stats:', error.message);
      }

      const response = {
        success: true,
        data: {
          overview: {
            ...stats,
            totalStorageFormatted: this.formatBytes(stats.totalStorage)
          },
          byCategory: categoryStats.map(cat => ({
            ...cat,
            totalSizeFormatted: this.formatBytes(cat.totalSize)
          })),
          byType: typeStats,
          recentActivity,
          storage: {
            used: user.storageUsage || 0,
            usedFormatted: this.formatBytes(user.storageUsage || 0),
            limit: user.storageLimit || 10 * 1024 * 1024,
            limitFormatted: this.formatBytes(user.storageLimit || 10 * 1024 * 1024),
            available: Math.max(0, (user.storageLimit || 10 * 1024 * 1024) - (user.storageUsage || 0)),
            availableFormatted: this.formatBytes(Math.max(0, (user.storageLimit || 10 * 1024 * 1024) - (user.storageUsage || 0))),
            percentage: user.storageLimit ? 
              Math.min(100, ((user.storageUsage || 0) / user.storageLimit) * 100) : 0
          },
          gridfsStats
        }
      };

      console.log(`📊 Document stats for ${req.user.email}:`, {
        total: response.data.overview.totalDocuments,
        storage: response.data.overview.totalStorageFormatted
      });

      res.json(response);

    } catch (error) {
      console.error('❌ Error fetching document statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching document statistics',
        error: error.message
      });
    }
  }

  /**
   * Get storage statistics (compatibility endpoint)
   */
  async getStorageStats(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

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
      
      res.json({
        success: true,
        data: {
          totalDocuments,
          totalStorageUsed: storageUsed[0]?.total || 0,
          totalStorageUsedFormatted: this.formatBytes(storageUsed[0]?.total || 0),
          averageFileSize: totalDocuments > 0 ? Math.round((storageUsed[0]?.total || 0) / totalDocuments) : 0,
          largestFile: await Document.findOne({ userId: req.user._id }).sort({ fileSize: -1 }).select('fileSize').then(doc => doc?.fileSize || 0),
          byCategory: byCategory.reduce((acc, cat) => {
            acc[cat._id] = { count: cat.count, size: cat.size, sizeFormatted: this.formatBytes(cat.size) };
            return acc;
          }, {}),
          byType: byType.reduce((acc, type) => {
            acc[type._id] = { count: type.count, size: type.size, sizeFormatted: this.formatBytes(type.size) };
            return acc;
          }, {}),
          storageLimit: user.storageLimit || 10 * 1024 * 1024,
          storageLimitFormatted: this.formatBytes(user.storageLimit || 10 * 1024 * 1024),
          storageUsedPercent: user.storageLimit ? 
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
  }

  /**
   * Get shared documents
   */
  async getSharedDocuments(req, res) {
    try {
      const { category = 'all', search, page = 1, limit = 20 } = req.query;

      let query = {
        $or: [
          { 'sharedWith.userId': req.user._id },
          { visibility: 'public' }
        ],
        status: { $ne: 'deleted' }
      };

      // Apply filters
      if (category && category !== 'all') {
        query.category = category;
      }

      if (search) {
        query.$or = [
          ...query.$or,
          { filename: { $regex: search, $options: 'i' } },
          { originalName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const documents = await Document.find(query)
        .populate('userId', 'name email avatar')
        .populate('clientId', 'organizationName')
        .populate('grantId', 'title')
        .populate('sharedWith.userId', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Document.countDocuments(query);

      // Format response
      const formattedDocs = documents.map(doc => {
        const access = doc.canUserAccess(req.user._id);
        return {
          _id: doc._id,
          originalName: doc.originalName,
          fileSize: doc.fileSize,
          fileSizeFormatted: this.formatBytes(doc.fileSize),
          mimeType: doc.mimeType,
          category: doc.category,
          description: doc.description,
          createdAt: doc.createdAt,
          downloadUrl: doc.downloadUrl,
          storageProvider: doc.storageProvider,
          uploadedBy: doc.userId,
          client: doc.clientId,
          grant: doc.grantId,
          access: access.permission,
          sharedWith: doc.sharedWith
        };
      });

      console.log(`✅ Found ${documents.length} shared documents`);

      res.json({
        success: true,
        data: formattedDocs,
        pagination: {
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });

    } catch (error) {
      console.error('❌ Error fetching shared documents:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching shared documents',
        error: error.message
      });
    }
  }

  /**
   * Share document with another user
   */
  async shareDocument(req, res) {
    try {
      const { targetUserId, permission = 'view', expiresAt = null } = req.body;

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
          message: 'Access denied. Only owner can share document.'
        });
      }

      // Check if target user exists
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Target user not found'
        });
      }

      // Cannot share with yourself
      if (targetUserId === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot share document with yourself'
        });
      }

      await document.shareWithUser(targetUserId, permission, req.user._id, expiresAt);

      console.log(`✅ Document shared with user: ${targetUserId}`);

      res.json({
        success: true,
        data: document,
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
  }

  /**
   * Remove share
   */
  async removeShare(req, res) {
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
          message: 'Access denied. Only owner can manage sharing.'
        });
      }

      await document.removeShare(req.params.userId);

      console.log(`✅ Share removed for user: ${req.params.userId}`);

      res.json({
        success: true,
        data: document,
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
  }

  /**
   * Restore soft deleted document
   */
  async restoreDocument(req, res) {
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
  }

  /**
   * Search documents
   */
  async searchDocuments(req, res) {
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
        fileSizeFormatted: this.formatBytes(doc.fileSize),
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
  }

  /**
   * Create new version of document
   */
  async createNewVersion(req, res) {
    try {
      console.log('🔄 POST /api/documents/:id/version - Creating new version');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided for new version'
        });
      }

      const originalDocument = await Document.findById(req.params.id);
      
      if (!originalDocument) {
        return res.status(404).json({
          success: false,
          message: 'Original document not found'
        });
      }

      // Check ownership
      if (!originalDocument.userId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only owner can create new versions.'
        });
      }

      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return res.status(413).json({
          success: false,
          message: `File too large. Maximum size is ${this.formatBytes(maxSize)}`
        });
      }

      // Check user storage
      const user = await User.findById(req.user._id);
      const availableStorage = user.availableStorage || (user.storageLimit - (user.storageUsage || 0));
      if (req.file.size > availableStorage) {
        return res.status(413).json({
          success: false,
          message: `Insufficient storage space. Available: ${this.formatBytes(availableStorage)}`
        });
      }

      // Prepare metadata for GridFS
      const metadata = {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
        category: originalDocument.category,
        tags: originalDocument.tags,
        description: req.body.description || originalDocument.description,
        clientId: originalDocument.clientId,
        grantId: originalDocument.grantId,
        sensitivityLevel: originalDocument.sensitivityLevel,
        parentDocumentId: originalDocument._id,
        version: originalDocument.version + 1
      };

      // Upload to GridFS
      const uploadResult = await gridfsService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        metadata
      );

      if (!uploadResult || !uploadResult.fileId) {
        throw new Error('GridFS upload failed for new version');
      }

      // Create new version document
      const newVersion = new Document({
        userId: req.user._id,
        filename: req.file.originalname,
        originalName: req.file.originalname,
        fileExtension: this.getFileExtension(req.file.originalname),
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        storageProvider: 'gridfs',
        gridfsFileId: uploadResult.fileId,
        gridfsFilename: uploadResult.gridfsFilename,
        checksum: uploadResult.checksum,
        clientId: originalDocument.clientId,
        grantId: originalDocument.grantId,
        category: originalDocument.category,
        description: req.body.description || originalDocument.description,
        tags: req.body.tags || originalDocument.tags,
        visibility: originalDocument.visibility,
        sensitivityLevel: originalDocument.sensitivityLevel,
        documentType: this.getDocumentType(req.file.mimetype, req.file.originalname),
        parentDocument: originalDocument._id,
        version: originalDocument.version + 1,
        isLatestVersion: true,
        versionNotes: req.body.notes
      });

      await newVersion.save();

      // Update original document
      originalDocument.isLatestVersion = false;
      originalDocument.status = 'archived';
      await originalDocument.save();

      // Update user storage
      user.storageUsage = (user.storageUsage || 0) + req.file.size;
      user.documentCount = (user.documentCount || 0) + 1;
      await user.save();

      // Add to version history
      await originalDocument.addToVersionHistory({
        version: originalDocument.version,
        filename: originalDocument.filename,
        fileSize: originalDocument.fileSize,
        storagePath: originalDocument.storagePath,
        gridfsFileId: originalDocument.gridfsFileId,
        storageProvider: originalDocument.storageProvider,
        changes: req.body.notes || 'New version created',
        createdBy: req.user._id
      });

      console.log(`✅ New version created: ${newVersion.originalName} (v${newVersion.version})`);

      res.status(201).json({
        success: true,
        data: newVersion,
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
  }

  /**
   * Get version history
   */
  async getVersionHistory(req, res) {
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
  }

  /**
   * Get document categories
   */
  async getCategories(req, res) {
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
  }

  /**
   * Get popular documents
   */
  async getPopularDocuments(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const documents = await Document.find({ userId: req.user._id, status: { $ne: 'deleted' } })
        .sort({ downloadCount: -1, viewCount: -1 })
        .limit(parseInt(limit))
        .populate('userId', 'name email')
        .populate('clientId', 'organizationName')
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
  }

  /**
   * Debug document information
   */
  async debugDocument(req, res) {
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
  }

  /**
   * Permanently delete document
   */
  async permanentlyDeleteDocument(req, res) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Check ownership or admin role
      const user = await User.findById(req.user._id);
      if (!document.userId.equals(req.user._id) && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only owner or admin can permanently delete document.'
        });
      }

      // Delete from GridFS
      if (document.storageProvider === 'gridfs' && document.gridfsFileId) {
        try {
          await gridfsService.deleteFile(document.gridfsFileId);
        } catch (error) {
          console.warn('Could not delete GridFS file:', error.message);
        }
      }

      // Delete document record
      await Document.findByIdAndDelete(req.params.id);

      // Update user's storage usage if owner
      if (document.userId.equals(req.user._id)) {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: {
            storageUsage: -document.fileSize,
            documentCount: -1
          }
        });
      }

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
  }

  /**
   * Get document analytics (admin only)
   */
  async getDocumentAnalytics(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      // Get GridFS stats
      let gridfsStats = null;
      try {
        gridfsStats = await gridfsService.getStorageStats();
      } catch (error) {
        console.warn('Could not fetch GridFS stats:', error.message);
      }

      // Get user storage analytics
      const storageAnalytics = await User.aggregate([
        {
          $project: {
            name: 1,
            email: 1,
            storageUsage: 1,
            storageLimit: 1,
            documentCount: 1,
            usagePercentage: {
              $multiply: [
                { $divide: ['$storageUsage', '$storageLimit'] },
                100
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalStorageUsed: { $sum: '$storageUsage' },
            totalStorageLimit: { $sum: '$storageLimit' },
            totalDocuments: { $sum: '$documentCount' },
            averageUsage: { $avg: '$usagePercentage' },
            highUsageUsers: {
              $sum: {
                $cond: [{ $gte: ['$usagePercentage', 80] }, 1, 0]
              }
            }
          }
        }
      ]);

      const analytics = storageAnalytics[0] || {
        totalUsers: 0,
        totalStorageUsed: 0,
        totalStorageLimit: 0,
        totalDocuments: 0,
        averageUsage: 0,
        highUsageUsers: 0
      };

      res.json({
        success: true,
        data: {
          ...analytics,
          gridfsStats
        }
      });

    } catch (error) {
      console.error('❌ Error fetching document analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching document analytics',
        error: error.message
      });
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Format bytes to human-readable format
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
  }

  /**
   * Get document type from MIME type and filename
   */
  getDocumentType(mimeType, filename) {
    const extension = this.getFileExtension(filename);
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document') || ['.doc', '.docx'].includes(extension)) {
      return 'word-doc';
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || ['.xls', '.xlsx', '.csv'].includes(extension)) {
      return 'spreadsheet';
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || ['.ppt', '.pptx'].includes(extension)) {
      return 'presentation';
    }
    if (mimeType.includes('json')) return 'json';
    if (mimeType.startsWith('text/') || ['.txt', '.md'].includes(extension)) return 'text';
    
    return 'other';
  }
}

module.exports = new DocumentController();