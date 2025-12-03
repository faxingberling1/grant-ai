const Document = require('../models/Document');
const User = require('../models/User');
const Client = require('../models/Client');
const gridfsService = require('./gridfsService');
const crypto = require('crypto');

class DocumentService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB (reduced for free tier)
    this.allowedMimeTypes = [
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
  }

  /**
   * Upload and process a document to GridFS
   */
  async uploadDocument(userId, file, documentData = {}) {
    try {
      console.log(`📄 Starting document upload to GridFS for user: ${userId}`);
      
      // Validate user and storage
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate file
      await this.validateFile(file);

      // Check storage space
      if (!user.hasStorageSpace || !user.hasStorageSpace(file.size)) {
        const available = user.availableStorage || (user.storageLimit - (user.storageUsage || 0));
        throw new Error(`Insufficient storage space. Available: ${this.formatBytes(available)}`);
      }

      // Check document count limit
      if (user.maxDocumentCount && user.documentCount >= user.maxDocumentCount) {
        throw new Error(`Document limit reached. Maximum ${user.maxDocumentCount} documents allowed.`);
      }

      // Prepare metadata for GridFS
      const metadata = {
        userId: userId.toString(),
        userEmail: user.email,
        originalName: file.originalname,
        contentType: file.mimetype,
        category: documentData.category || 'other',
        tags: this.parseTags(documentData.tags),
        description: documentData.description || '',
        clientId: documentData.clientId || null,
        grantId: documentData.grantId || null,
        sensitivityLevel: documentData.sensitivityLevel || 'internal',
        uploadSource: 'web-upload'
      };

      console.log(`📁 Uploading file to GridFS: ${file.originalname} (${file.size} bytes)`);

      // Upload to GridFS
      const uploadResult = await gridfsService.uploadFile(
        file.buffer,
        file.originalname,
        metadata
      );

      if (!uploadResult || !uploadResult.fileId) {
        throw new Error('GridFS upload failed - no file ID returned');
      }

      // Create document record in MongoDB
      const document = new Document({
        userId: user._id,
        filename: file.originalname,
        originalName: file.originalname,
        fileExtension: this.getFileExtension(file.originalname),
        fileSize: file.size,
        mimeType: file.mimetype,
        storageProvider: 'gridfs',
        gridfsFileId: uploadResult.fileId,
        gridfsFilename: uploadResult.gridfsFilename,
        checksum: uploadResult.checksum,
        clientId: documentData.clientId || null,
        grantId: documentData.grantId || null,
        category: documentData.category || 'other',
        description: documentData.description || '',
        tags: this.parseTags(documentData.tags),
        visibility: documentData.visibility || 'private',
        sensitivityLevel: documentData.sensitivityLevel || 'internal',
        documentType: this.getDocumentType(file.mimetype, file.originalname),
        uploadSource: 'web-upload',
        status: 'draft'
      });

      await document.save();

      // Update user's document storage
      await this.updateUserStorage(user, file.size, 1);

      // If associated with client, update client documents
      if (documentData.clientId) {
        await this.addDocumentToClient(documentData.clientId, document, user._id);
      }

      console.log(`✅ Document uploaded successfully to GridFS: ${document.originalName}`);
      
      return {
        success: true,
        document,
        message: 'Document uploaded successfully to secure storage'
      };

    } catch (error) {
      console.error('❌ Document upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple documents to GridFS
   */
  async uploadMultipleDocuments(userId, files, documentData = {}) {
    try {
      console.log(`📄 Starting multiple document upload to GridFS for user: ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const results = {
        successful: [],
        failed: []
      };

      // Check total storage needed
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const available = user.availableStorage || (user.storageLimit - (user.storageUsage || 0));
      
      if (totalSize > available) {
        throw new Error(`Insufficient storage space for all files. Available: ${this.formatBytes(available)}, Required: ${this.formatBytes(totalSize)}`);
      }

      // Check document count
      const remainingSlots = (user.maxDocumentCount || 100) - (user.documentCount || 0);
      if (files.length > remainingSlots) {
        throw new Error(`Document limit would be exceeded. You can upload maximum ${remainingSlots} more documents.`);
      }

      for (const file of files) {
        try {
          const uploadResult = await this.uploadDocument(userId, file, documentData);
          results.successful.push({
            file: file.originalname,
            document: uploadResult.document
          });
        } catch (error) {
          results.failed.push({
            file: file.originalname,
            error: error.message
          });
        }
      }

      return {
        success: true,
        results,
        message: `Uploaded ${results.successful.length} out of ${files.length} documents`
      };

    } catch (error) {
      console.error('❌ Multiple document upload error:', error);
      throw error;
    }
  }

  /**
   * Get user's documents with advanced filtering
   */
  async getUserDocuments(userId, filters = {}) {
    try {
      const {
        category,
        type,
        status = 'draft',
        clientId,
        grantId,
        search,
        tags,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = filters;

      let query = { userId };

      // Apply filters
      if (status !== 'all') {
        query.status = status;
      }
      
      if (category && category !== 'all') query.category = category;
      if (type && type !== 'all') query.documentType = type;
      if (clientId) query.clientId = clientId;
      if (grantId) query.grantId = grantId;

      // Search filter
      if (search) {
        query.$or = [
          { filename: { $regex: search, $options: 'i' } },
          { originalName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      // Tags filter
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        query.tags = { $in: tagArray.map(tag => tag.trim()) };
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const documents = await Document.find(query)
        .populate('clientId', 'organizationName primaryContactName')
        .populate('grantId', 'title grantName')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Document.countDocuments(query);

      return {
        success: true,
        documents,
        pagination: {
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('❌ Error getting user documents:', error);
      throw error;
    }
  }

  /**
   * Get document by ID with access control
   */
  async getDocumentById(documentId, userId) {
    try {
      const document = await Document.findById(documentId)
        .populate('userId', 'name email avatar')
        .populate('clientId', 'organizationName primaryContactName')
        .populate('grantId', 'title grantName')
        .populate('sharedWith.userId', 'name email avatar');

      if (!document) {
        throw new Error('Document not found');
      }

      // Check access permissions
      const access = document.canUserAccess(userId);
      if (!access.canAccess) {
        throw new Error('Access denied to this document');
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
      await document.incrementViewCount();

      return {
        success: true,
        document: {
          ...document.toObject(),
          gridfsInfo
        },
        access
      };

    } catch (error) {
      console.error('❌ Error getting document:', error);
      throw error;
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(documentId, userId, updates) {
    try {
      const document = await Document.findById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      // Check ownership or edit permission
      const access = document.canUserAccess(userId);
      if (!access.canAccess || (access.permission !== 'owner' && access.permission !== 'edit' && access.permission !== 'manage')) {
        throw new Error('Insufficient permissions to edit this document');
      }

      // Filter allowed updates
      const allowedUpdates = {};
      const allowedFields = [
        'filename', 'description', 'category', 'tags', 'visibility', 
        'sensitivityLevel', 'status', 'workflowStage', 'clientId', 'grantId'
      ];

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          if (field === 'tags') {
            allowedUpdates[field] = this.parseTags(updates[field]);
          } else {
            allowedUpdates[field] = updates[field];
          }
        }
      });

      allowedUpdates.lastModified = new Date();
      allowedUpdates.lastModifiedBy = userId;

      const updatedDocument = await Document.findByIdAndUpdate(
        documentId,
        allowedUpdates,
        { new: true, runValidators: true }
      ).populate('clientId', 'organizationName')
       .populate('grantId', 'title');

      return {
        success: true,
        document: updatedDocument,
        message: 'Document updated successfully'
      };

    } catch (error) {
      console.error('❌ Error updating document:', error);
      throw error;
    }
  }

  /**
   * Delete document (soft delete) - Updated for GridFS
   */
  async deleteDocument(documentId, userId) {
    try {
      const document = await Document.findById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      console.log('🔐 DELETE - Ownership check:', {
        documentUserId: document.userId.toString(),
        requestUserId: userId.toString(),
        match: document.userId.toString() === userId.toString()
      });

      // Check ownership
      if (document.userId.toString() !== userId.toString()) {
        console.log('❌ DELETE ACCESS DENIED - Ownership mismatch');
        throw new Error('Access denied. Only owner can delete document.');
      }

      console.log('✅ DELETE ACCESS GRANTED - User owns the document');

      // Delete from GridFS if using GridFS
      if (document.storageProvider === 'gridfs' && document.gridfsFileId) {
        try {
          await gridfsService.deleteFile(document.gridfsFileId);
          console.log('✅ GridFS file deleted:', document.gridfsFileId);
        } catch (error) {
          console.warn('⚠️ Could not delete GridFS file:', error.message);
          // Continue with database deletion even if GridFS deletion fails
        }
      }

      // Soft delete by updating status
      const deletedDocument = await Document.findByIdAndUpdate(
        documentId,
        { 
          status: 'deleted',
          deletedAt: new Date()
        },
        { new: true }
      );

      // Update user's storage usage
      await User.findByIdAndUpdate(userId, {
        $inc: {
          storageUsage: -document.fileSize,
          documentCount: -1
        }
      });

      console.log(`✅ Document deleted: ${document.originalName}`);
      
      return {
        success: true,
        document: deletedDocument,
        message: 'Document deleted successfully'
      };

    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Permanently delete document - Updated for GridFS
   */
  async permanentlyDeleteDocument(documentId, userId) {
    try {
      const document = await Document.findById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      console.log('🔐 PERMANENT DELETE - Ownership check:', {
        documentUserId: document.userId.toString(),
        requestUserId: userId.toString(),
        match: document.userId.toString() === userId.toString()
      });

      // Check ownership or admin role
      const user = await User.findById(userId);
      if (document.userId.toString() !== userId.toString() && user.role !== 'admin') {
        console.log('❌ PERMANENT DELETE ACCESS DENIED');
        throw new Error('Access denied. Only owner or admin can permanently delete document.');
      }

      console.log('✅ PERMANENT DELETE ACCESS GRANTED');

      // Delete from GridFS
      if (document.storageProvider === 'gridfs' && document.gridfsFileId) {
        try {
          await gridfsService.deleteFile(document.gridfsFileId);
          console.log('✅ GridFS file deleted:', document.gridfsFileId);
        } catch (error) {
          console.warn('⚠️ Could not delete GridFS file:', error.message);
        }
      }

      // Delete document record
      await Document.findByIdAndDelete(documentId);

      // Update user's storage usage if owner
      if (document.userId.toString() === userId.toString()) {
        await User.findByIdAndUpdate(userId, {
          $inc: {
            storageUsage: -document.fileSize,
            documentCount: -1
          }
        });
      }

      console.log(`✅ Document permanently deleted: ${document.originalName}`);
      
      return {
        success: true,
        message: 'Document permanently deleted successfully'
      };

    } catch (error) {
      console.error('❌ Error permanently deleting document:', error);
      throw error;
    }
  }

  /**
   * Share document with another user
   */
  async shareDocument(documentId, ownerId, targetUserId, permission = 'view', expiresAt = null) {
    try {
      const document = await Document.findById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      // Check ownership
      if (document.userId.toString() !== ownerId.toString()) {
        throw new Error('Access denied. Only owner can share document.');
      }

      // Check if target user exists
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        throw new Error('Target user not found');
      }

      // Cannot share with yourself
      if (targetUserId === ownerId) {
        throw new Error('Cannot share document with yourself');
      }

      await document.shareWithUser(targetUserId, permission, ownerId, expiresAt);

      return {
        success: true,
        document: await Document.findById(documentId).populate('sharedWith.userId', 'name email avatar'),
        message: 'Document shared successfully'
      };

    } catch (error) {
      console.error('❌ Error sharing document:', error);
      throw error;
    }
  }

  /**
   * Remove share from document
   */
  async removeShare(documentId, ownerId, targetUserId) {
    try {
      const document = await Document.findById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      // Check ownership
      if (document.userId.toString() !== ownerId.toString()) {
        throw new Error('Access denied. Only owner can manage sharing.');
      }

      await document.removeShare(targetUserId);

      return {
        success: true,
        document: await Document.findById(documentId).populate('sharedWith.userId', 'name email avatar'),
        message: 'Share removed successfully'
      };

    } catch (error) {
      console.error('❌ Error removing share:', error);
      throw error;
    }
  }

  /**
   * Get documents shared with user
   */
  async getSharedDocuments(userId, filters = {}) {
    try {
      const {
        category,
        search,
        page = 1,
        limit = 20
      } = filters;

      let query = {
        $or: [
          { 'sharedWith.userId': userId },
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

      return {
        success: true,
        documents,
        pagination: {
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('❌ Error getting shared documents:', error);
      throw error;
    }
  }

  /**
   * Get document statistics for user
   */
  async getDocumentStatistics(userId) {
    try {
      const mongoose = require('mongoose');
      const ObjectId = mongoose.Types.ObjectId;
      
      const stats = await Document.aggregate([
        { 
          $match: { 
            userId: new ObjectId(userId), 
            status: { $ne: 'deleted' } 
          } 
        },
        {
          $facet: {
            totalStats: [
              {
                $group: {
                  _id: null,
                  totalDocuments: { $sum: 1 },
                  totalStorage: { $sum: '$fileSize' },
                  totalViews: { $sum: '$viewCount' },
                  totalDownloads: { $sum: '$downloadCount' }
                }
              }
            ],
            categoryStats: [
              {
                $group: {
                  _id: '$category',
                  count: { $sum: 1 },
                  totalSize: { $sum: '$fileSize' }
                }
              }
            ],
            typeStats: [
              {
                $group: {
                  _id: '$documentType',
                  count: { $sum: 1 }
                }
              }
            ],
            recentActivity: [
              { $sort: { lastAccessed: -1 } },
              { $limit: 10 },
              {
                $project: {
                  originalName: 1,
                  fileSize: 1,
                  category: 1,
                  lastAccessed: 1,
                  downloadCount: 1
                }
              }
            ]
          }
        }
      ]);

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const storageStats = {
        used: user.storageUsage || 0,
        limit: user.storageLimit || 10 * 1024 * 1024, // 10MB default for free tier
        available: Math.max(0, (user.storageLimit || 10 * 1024 * 1024) - (user.storageUsage || 0)),
        percentage: user.storageLimit ? Math.min(100, ((user.storageUsage || 0) / user.storageLimit) * 100) : 0
      };

      // Get GridFS storage stats
      let gridfsStats = null;
      try {
        gridfsStats = await gridfsService.getStorageStats();
      } catch (error) {
        console.warn('Could not fetch GridFS stats:', error.message);
      }

      // Handle empty results
      const totalStats = stats[0]?.totalStats[0] || {
        totalDocuments: 0,
        totalStorage: 0,
        totalViews: 0,
        totalDownloads: 0
      };

      return {
        success: true,
        stats: {
          overview: {
            ...totalStats,
            totalStorageFormatted: this.formatBytes(totalStats.totalStorage)
          },
          byCategory: (stats[0]?.categoryStats || []).map(cat => ({
            ...cat,
            totalSizeFormatted: this.formatBytes(cat.totalSize)
          })),
          byType: stats[0]?.typeStats || [],
          recentActivity: stats[0]?.recentActivity || [],
          storage: storageStats,
          gridfsStats
        }
      };

    } catch (error) {
      console.error('❌ Error getting document statistics:', error);
      
      // Return default stats on error
      return {
        success: true,
        stats: {
          overview: {
            totalDocuments: 0,
            totalStorage: 0,
            totalStorageFormatted: '0 Bytes',
            totalViews: 0,
            totalDownloads: 0
          },
          byCategory: [],
          byType: [],
          recentActivity: [],
          storage: {
            used: 0,
            limit: 10 * 1024 * 1024,
            available: 10 * 1024 * 1024,
            percentage: 0
          }
        }
      };
    }
  }

  /**
   * Search documents with advanced filters
   */
  async searchDocuments(userId, searchCriteria) {
    try {
      const {
        query,
        category,
        type,
        minSize,
        maxSize,
        startDate,
        endDate,
        tags,
        clientId,
        grantId
      } = searchCriteria;

      let searchQuery = { userId, status: { $ne: 'deleted' } };

      // Text search
      if (query) {
        searchQuery.$or = [
          { filename: { $regex: query, $options: 'i' } },
          { originalName: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ];
      }

      // Filters
      if (category && category !== 'all') searchQuery.category = category;
      if (type && type !== 'all') searchQuery.documentType = type;
      if (clientId) searchQuery.clientId = clientId;
      if (grantId) searchQuery.grantId = grantId;

      // File size range
      if (minSize || maxSize) {
        searchQuery.fileSize = {};
        if (minSize) searchQuery.fileSize.$gte = parseInt(minSize);
        if (maxSize) searchQuery.fileSize.$lte = parseInt(maxSize);
      }

      // Date range
      if (startDate || endDate) {
        searchQuery.createdAt = {};
        if (startDate) searchQuery.createdAt.$gte = new Date(startDate);
        if (endDate) searchQuery.createdAt.$lte = new Date(endDate);
      }

      // Tags
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        searchQuery.tags = { $in: tagArray.map(tag => tag.trim()) };
      }

      const documents = await Document.find(searchQuery)
        .populate('clientId', 'organizationName')
        .populate('grantId', 'title')
        .sort({ createdAt: -1 })
        .limit(50);

      return {
        success: true,
        documents,
        total: documents.length
      };

    } catch (error) {
      console.error('❌ Error searching documents:', error);
      throw error;
    }
  }

  /**
   * Create new version of a document in GridFS
   */
  async createNewVersion(documentId, userId, newFile, versionData = {}) {
    try {
      const originalDocument = await Document.findById(documentId);
      
      if (!originalDocument) {
        throw new Error('Original document not found');
      }

      console.log('🔐 CREATE VERSION - Ownership check:', {
        documentUserId: originalDocument.userId.toString(),
        requestUserId: userId.toString(),
        match: originalDocument.userId.toString() === userId.toString()
      });

      // Check ownership
      if (originalDocument.userId.toString() !== userId.toString()) {
        console.log('❌ CREATE VERSION ACCESS DENIED');
        throw new Error('Access denied. Only owner can create new versions.');
      }

      console.log('✅ CREATE VERSION ACCESS GRANTED');

      // Validate new file
      await this.validateFile(newFile);

      // Check user storage
      const user = await User.findById(userId);
      if (!user.hasStorageSpace || !user.hasStorageSpace(newFile.size)) {
        throw new Error('Insufficient storage space for new version');
      }

      // Prepare metadata for GridFS
      const metadata = {
        userId: userId.toString(),
        userEmail: user.email,
        originalName: newFile.originalname,
        contentType: newFile.mimetype,
        category: originalDocument.category,
        tags: originalDocument.tags,
        description: versionData.description || originalDocument.description,
        clientId: originalDocument.clientId,
        grantId: originalDocument.grantId,
        sensitivityLevel: originalDocument.sensitivityLevel,
        uploadSource: 'version_upload',
        parentDocumentId: originalDocument._id,
        version: originalDocument.version + 1
      };

      // Upload to GridFS
      const uploadResult = await gridfsService.uploadFile(
        newFile.buffer,
        newFile.originalname,
        metadata
      );

      if (!uploadResult || !uploadResult.fileId) {
        throw new Error('GridFS upload failed for new version');
      }

      // Create new version document
      const newVersion = new Document({
        userId: userId,
        filename: newFile.originalname,
        originalName: newFile.originalname,
        fileExtension: this.getFileExtension(newFile.originalname),
        fileSize: newFile.size,
        mimeType: newFile.mimetype,
        storageProvider: 'gridfs',
        gridfsFileId: uploadResult.fileId,
        gridfsFilename: uploadResult.gridfsFilename,
        checksum: uploadResult.checksum,
        clientId: originalDocument.clientId,
        grantId: originalDocument.grantId,
        category: originalDocument.category,
        description: versionData.description || originalDocument.description,
        tags: versionData.tags || originalDocument.tags,
        visibility: originalDocument.visibility,
        sensitivityLevel: originalDocument.sensitivityLevel,
        documentType: this.getDocumentType(newFile.mimetype, newFile.originalname),
        parentDocument: originalDocument._id,
        version: originalDocument.version + 1,
        isLatestVersion: true,
        versionNotes: versionData.notes,
        uploadSource: 'version_upload'
      });

      await newVersion.save();

      // Update original document to not be latest version
      originalDocument.isLatestVersion = false;
      originalDocument.status = 'archived';
      await originalDocument.save();

      // Update user storage
      await this.updateUserStorage(user, newFile.size, 1);

      // Add to version history
      await originalDocument.addToVersionHistory({
        version: originalDocument.version,
        filename: originalDocument.filename,
        fileSize: originalDocument.fileSize,
        storagePath: originalDocument.storagePath,
        gridfsFileId: originalDocument.gridfsFileId,
        storageProvider: originalDocument.storageProvider,
        changes: versionData.notes || 'New version created',
        createdBy: userId
      });

      return {
        success: true,
        document: newVersion,
        message: 'New version created successfully'
      };

    } catch (error) {
      console.error('❌ Error creating new version:', error);
      throw error;
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Validate file before processing
   */
  async validateFile(file) {
    // Check if file exists
    if (!file || !file.buffer) {
      throw new Error('No file provided');
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(`File size too large. Maximum allowed: ${this.formatBytes(this.maxFileSize)}`);
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }

    return true;
  }

  /**
   * Update user storage statistics
   */
  async updateUserStorage(user, fileSize, documentCount = 1) {
    user.storageUsage = (user.storageUsage || 0) + fileSize;
    user.documentCount = (user.documentCount || 0) + documentCount;
    await user.save();
  }

  /**
   * Add document to client's embedded documents
   */
  async addDocumentToClient(clientId, document, userId) {
    try {
      await Client.findByIdAndUpdate(clientId, {
        $push: {
          documents: {
            _id: document._id,
            filename: document.filename,
            originalName: document.originalName,
            fileSize: document.fileSize,
            mimeType: document.mimeType,
            category: document.category,
            description: document.description,
            storageProvider: document.storageProvider,
            gridfsFileId: document.gridfsFileId,
            tags: document.tags,
            version: document.version,
            uploadedBy: userId
          }
        }
      });
    } catch (error) {
      console.error('❌ Error adding document to client:', error);
      // Don't throw error, as document is already saved
    }
  }

  /**
   * Parse tags from various input formats
   */
  parseTags(tags) {
    if (!tags) return [];
    
    if (Array.isArray(tags)) {
      return tags.filter(tag => tag && tag.trim() !== '').map(tag => tag.trim());
    }
    
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }
    
    return [];
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

  /**
   * Get file extension from filename
   */
  getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
  }

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
   * Clean up orphaned files (utility method for maintenance)
   */
  async cleanupOrphanedFiles() {
    try {
      console.log('🧹 Starting orphaned files cleanup...');
      
      // Get all GridFS files
      let gridfsFiles = [];
      try {
        gridfsFiles = await gridfsService.listFiles();
      } catch (error) {
        console.warn('Could not list GridFS files:', error.message);
      }
      
      // Get all documents from database
      const allDocuments = await Document.find({ storageProvider: 'gridfs' });
      const existingGridfsIds = allDocuments.map(doc => doc.gridfsFileId?.toString());
      
      let cleanedCount = 0;
      
      // Find and delete orphaned GridFS files
      for (const gridfsFile of gridfsFiles) {
        if (!existingGridfsIds.includes(gridfsFile._id.toString())) {
          try {
            await gridfsService.deleteFile(gridfsFile._id);
            cleanedCount++;
            console.log(`🗑️  Cleaned orphaned GridFS file: ${gridfsFile.filename}`);
          } catch (error) {
            console.error(`Failed to delete orphaned GridFS file ${gridfsFile._id}:`, error.message);
          }
        }
      }
      
      console.log(`✅ Orphaned files cleanup completed. Cleaned ${cleanedCount} files.`);
      
      return {
        success: true,
        cleanedCount,
        message: `Cleaned ${cleanedCount} orphaned files`
      };
      
    } catch (error) {
      console.error('❌ Error during orphaned files cleanup:', error);
      throw error;
    }
  }

  /**
   * Get storage analytics for admin
   */
  async getStorageAnalytics() {
    try {
      const analytics = await User.aggregate([
        {
          $project: {
            name: 1,
            email: 1,
            storageUsage: 1,
            storageLimit: 1,
            documentCount: 1,
            maxDocumentCount: 1,
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

      // Get GridFS stats
      let gridfsStats = null;
      try {
        gridfsStats = await gridfsService.getStorageStats();
      } catch (error) {
        console.warn('Could not fetch GridFS stats for analytics:', error.message);
      }

      return {
        success: true,
        analytics: {
          ...(analytics[0] || {
            totalUsers: 0,
            totalStorageUsed: 0,
            totalStorageLimit: 0,
            totalDocuments: 0,
            averageUsage: 0,
            highUsageUsers: 0
          }),
          gridfsStats
        }
      };

    } catch (error) {
      console.error('❌ Error getting storage analytics:', error);
      throw error;
    }
  }
}

module.exports = new DocumentService();