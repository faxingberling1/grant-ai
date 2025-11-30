// backend/services/documentService.js
const Document = require('../models/Document');
const User = require('../models/User');
const Client = require('../models/Client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DocumentService {
  constructor() {
    this.uploadDir = 'uploads/documents';
    this.maxFileSize = 25 * 1024 * 1024; // 25MB
    this.allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ];
  }

  /**
   * Upload and process a document
   */
  async uploadDocument(userId, file, documentData = {}) {
    try {
      console.log(`📄 Starting document upload for user: ${userId}`);
      
      // Validate user and storage
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate file
      await this.validateFile(file);

      // Check storage space
      if (!user.hasStorageSpace(file.size)) {
        throw new Error(`Insufficient storage space. Available: ${this.formatBytes(user.availableStorage)}`);
      }

      // Check document count limit
      if (!user.canUploadMoreDocuments()) {
        throw new Error(`Document limit reached. Maximum ${user.maxDocumentCount} documents allowed.`);
      }

      // Generate secure filename and path
      const fileInfo = await this.generateFileInfo(file, userId);
      
      // Move file to permanent location
      await this.moveFile(file.path, fileInfo.storagePath);

      // Calculate file checksum
      const checksum = await this.calculateFileChecksum(fileInfo.storagePath);

      // Create document record
      const document = new Document({
        filename: fileInfo.filename,
        originalName: file.originalname,
        fileExtension: path.extname(file.originalname).toLowerCase().substring(1),
        fileSize: file.size,
        mimeType: file.mimetype,
        storagePath: fileInfo.storagePath,
        storageProvider: 'local',
        checksum,
        userId: user._id,
        clientId: documentData.clientId || null,
        grantId: documentData.grantId || null,
        category: documentData.category || 'other',
        description: documentData.description || '',
        tags: this.parseTags(documentData.tags),
        visibility: documentData.visibility || 'private',
        sensitivityLevel: documentData.sensitivityLevel || 'internal',
        documentType: this.getDocumentType(file.mimetype, file.originalname),
        uploadSource: 'web-upload'
      });

      await document.save();

      // Update user's document storage
      await this.updateUserStorage(user, file.size, 1);

      // If associated with client, update client documents
      if (documentData.clientId) {
        await this.addDocumentToClient(documentData.clientId, document, user._id);
      }

      console.log(`✅ Document uploaded successfully: ${document.originalName}`);
      
      return {
        success: true,
        document,
        message: 'Document uploaded successfully'
      };

    } catch (error) {
      console.error('❌ Document upload error:', error);
      
      // Clean up uploaded file if error occurred
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw error;
    }
  }

  /**
   * Upload multiple documents
   */
  async uploadMultipleDocuments(userId, files, documentData = {}) {
    try {
      console.log(`📄 Starting multiple document upload for user: ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const results = {
        successful: [],
        failed: []
      };

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
        status,
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
      if (category && category !== 'all') query.category = category;
      if (type && type !== 'all') query.documentType = type;
      if (status && status !== 'all') query.status = status;
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

      // Increment view count
      await document.incrementViewCount();

      return {
        success: true,
        document,
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
        'sensitivityLevel', 'status', 'workflowStage'
      ];

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          allowedUpdates[field] = updates[field];
        }
      });

      // Special handling for tags
      if (updates.tags !== undefined) {
        allowedUpdates.tags = this.parseTags(updates.tags);
      }

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
   * Delete document (soft delete) - FIXED
   */
  async deleteDocument(documentId, userId) {
    try {
      const document = await Document.findById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      // FIXED: Proper ownership check with ObjectId comparison
      console.log('🔐 DELETE - Ownership check:', {
        documentUserId: document.userId,
        documentUserIdString: document.userId.toString(),
        requestUserId: userId,
        requestUserIdString: userId.toString(),
        match: document.userId.toString() === userId.toString()
      });

      // Check ownership - FIXED: Use proper string comparison
      if (document.userId.toString() !== userId.toString()) {
        console.log('❌ DELETE ACCESS DENIED - Ownership mismatch:', {
          documentOwner: document.userId.toString(),
          currentUser: userId.toString(),
          documentId: document._id,
          documentName: document.originalName
        });
        throw new Error('Access denied. Only owner can delete document.');
      }

      console.log('✅ DELETE ACCESS GRANTED - User owns the document');

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

      console.log(`✅ Document soft deleted: ${document.originalName}`);
      
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
   * Permanently delete document - FIXED
   */
  async permanentlyDeleteDocument(documentId, userId) {
    try {
      const document = await Document.findById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      // FIXED: Proper ownership check
      console.log('🔐 PERMANENT DELETE - Ownership check:', {
        documentUserId: document.userId.toString(),
        requestUserId: userId.toString(),
        match: document.userId.toString() === userId.toString()
      });

      // Check ownership or admin role - FIXED: Use proper string comparison
      const user = await User.findById(userId);
      if (document.userId.toString() !== userId.toString() && user.role !== 'admin') {
        console.log('❌ PERMANENT DELETE ACCESS DENIED');
        throw new Error('Access denied. Only owner or admin can permanently delete document.');
      }

      console.log('✅ PERMANENT DELETE ACCESS GRANTED');

      // Delete physical file
      if (fs.existsSync(document.storagePath)) {
        fs.unlinkSync(document.storagePath);
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
      limit: user.storageLimit || 1073741824, // 1GB default
      available: user.availableStorage || 1073741824,
      percentage: user.getStorageUsagePercentage ? user.getStorageUsagePercentage() : 0
    };

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
        overview: totalStats,
        byCategory: stats[0]?.categoryStats || [],
        byType: stats[0]?.typeStats || [],
        recentActivity: stats[0]?.recentActivity || [],
        storage: storageStats
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
          totalViews: 0,
          totalDownloads: 0
        },
        byCategory: [],
        byType: [],
        recentActivity: [],
        storage: {
          used: 0,
          limit: 1073741824,
          available: 1073741824,
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
        searchQuery.$text = { $search: query };
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
   * Create new version of a document - FIXED
   */
  async createNewVersion(documentId, userId, newFile, versionData = {}) {
    try {
      const originalDocument = await Document.findById(documentId);
      
      if (!originalDocument) {
        throw new Error('Original document not found');
      }

      // FIXED: Proper ownership check
      console.log('🔐 CREATE VERSION - Ownership check:', {
        documentUserId: originalDocument.userId.toString(),
        requestUserId: userId.toString(),
        match: originalDocument.userId.toString() === userId.toString()
      });

      // Check ownership - FIXED: Use proper string comparison
      if (originalDocument.userId.toString() !== userId.toString()) {
        console.log('❌ CREATE VERSION ACCESS DENIED');
        throw new Error('Access denied. Only owner can create new versions.');
      }

      console.log('✅ CREATE VERSION ACCESS GRANTED');

      // Validate new file
      await this.validateFile(newFile);

      // Generate file info for new version
      const fileInfo = await this.generateFileInfo(newFile, userId);
      await this.moveFile(newFile.path, fileInfo.storagePath);

      // Calculate checksum
      const checksum = await this.calculateFileChecksum(fileInfo.storagePath);

      // Create new version document
      const newVersion = new Document({
        filename: fileInfo.filename,
        originalName: newFile.originalname,
        fileExtension: path.extname(newFile.originalname).toLowerCase().substring(1),
        fileSize: newFile.size,
        mimeType: newFile.mimetype,
        storagePath: fileInfo.storagePath,
        storageProvider: 'local',
        checksum,
        userId: userId,
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
      await originalDocument.save();

      // Update user storage
      const user = await User.findById(userId);
      await this.updateUserStorage(user, newFile.size, 1);

      // Add to version history
      await originalDocument.addToVersionHistory({
        version: originalDocument.version,
        filename: originalDocument.filename,
        fileSize: originalDocument.fileSize,
        storagePath: originalDocument.storagePath,
        changes: versionData.notes,
        createdBy: userId
      });

      return {
        success: true,
        document: newVersion,
        message: 'New version created successfully'
      };

    } catch (error) {
      console.error('❌ Error creating new version:', error);
      
      // Clean up file if error occurred
      if (newFile && newFile.path && fs.existsSync(newFile.path)) {
        fs.unlinkSync(newFile.path);
      }
      
      throw error;
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Validate file before processing
   */
  async validateFile(file) {
    // Check if file exists
    if (!file) {
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

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      throw new Error('Uploaded file not found on server');
    }

    return true;
  }

  /**
   * Generate secure file information
   */
  async generateFileInfo(file, userId) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const filename = `doc_${timestamp}_${randomString}_${safeName}`;
    
    // Create user directory if it doesn't exist
    const userDir = path.join(this.uploadDir, userId.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const storagePath = path.join(userDir, filename);

    return {
      filename,
      storagePath,
      userDir
    };
  }

  /**
   * Move file to permanent location
   */
  async moveFile(tempPath, destinationPath) {
    return new Promise((resolve, reject) => {
      fs.rename(tempPath, destinationPath, (error) => {
        if (error) {
          reject(new Error(`Failed to move file: ${error.message}`));
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Calculate file checksum
   */
  async calculateFileChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (error) => reject(error));
    });
  }

  /**
   * Update user storage statistics
   */
  async updateUserStorage(user, fileSize, documentCount = 1) {
    user.storageUsage += fileSize;
    user.documentCount += documentCount;
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
            storagePath: document.storagePath,
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
    const extension = path.extname(filename).toLowerCase();
    
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
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('zip') || mimeType.includes('archive') || ['.zip', '.rar', '.7z'].includes(extension)) {
      return 'archive';
    }
    if (mimeType.startsWith('text/') || ['.txt', '.md'].includes(extension)) return 'text';
    
    return 'other';
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
      
      const allDocuments = await Document.find({});
      const existingPaths = allDocuments.map(doc => doc.storagePath);
      
      let cleanedCount = 0;
      
      // Recursively scan upload directory
      const scanDirectory = (dir) => {
        if (!fs.existsSync(dir)) return;
        
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isFile()) {
            if (!existingPaths.includes(fullPath)) {
              // File exists but no document record - orphaned file
              fs.unlinkSync(fullPath);
              cleanedCount++;
              console.log(`🗑️  Cleaned orphaned file: ${fullPath}`);
            }
          } else if (stat.isDirectory()) {
            scanDirectory(fullPath);
          }
        });
      };
      
      scanDirectory(this.uploadDir);
      
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

      return {
        success: true,
        analytics: analytics[0] || {
          totalUsers: 0,
          totalStorageUsed: 0,
          totalStorageLimit: 0,
          totalDocuments: 0,
          averageUsage: 0,
          highUsageUsers: 0
        }
      };

    } catch (error) {
      console.error('❌ Error getting storage analytics:', error);
      throw error;
    }
  }
}

module.exports = new DocumentService();