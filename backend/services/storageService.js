// backend/services/storageService.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/User');
const Document = require('../models/Document');

class StorageService {
  constructor() {
    this.baseUploadDir = 'uploads';
    this.documentsDir = 'documents';
    this.tempDir = 'temp';
    this.backupDir = 'backups';
    
    // Storage limits in bytes
    this.defaultUserLimit = 100 * 1024 * 1024; // 100MB
    this.premiumUserLimit = 500 * 1024 * 1024; // 500MB
    this.enterpriseUserLimit = 2 * 1024 * 1024 * 1024; // 2GB
    
    // File type restrictions
    this.allowedMimeTypes = {
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/rtf'
      ],
      images: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
      ],
      archives: [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip'
      ],
      other: [
        'application/json',
        'text/markdown',
        'application/xml'
      ]
    };

    this.maxFileSize = 25 * 1024 * 1024; // 25MB per file
    this.maxTotalFilesPerUpload = 10;

    // Initialize directories
    this.initializeDirectories();
  }

  /**
   * Initialize required directories
   */
  initializeDirectories() {
    const directories = [
      this.baseUploadDir,
      path.join(this.baseUploadDir, this.documentsDir),
      path.join(this.baseUploadDir, this.tempDir),
      path.join(this.baseUploadDir, this.backupDir)
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
  }

  /**
   * Get user storage quota based on role and plan
   */
  getUserStorageLimit(user) {
    if (user.role === 'admin') {
      return 5 * 1024 * 1024 * 1024; // 5GB for admins
    }

    // Check for custom storage limit (for demo or special users)
    if (user.storageLimit && user.storageLimit > 0) {
      return user.storageLimit;
    }

    // Default limits based on user type
    switch (user.role) {
      case 'premium':
        return this.premiumUserLimit;
      case 'enterprise':
        return this.enterpriseUserLimit;
      case 'Grant Manager':
        return 500 * 1024 * 1024; // 500MB for Grant Managers
      default:
        return this.defaultUserLimit;
    }
  }

  /**
   * Validate file before upload
   */
  async validateFile(file, user) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check if file exists
    if (!file) {
      validation.isValid = false;
      validation.errors.push('No file provided');
      return validation;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      validation.isValid = false;
      validation.errors.push(
        `File size too large. Maximum allowed: ${this.formatBytes(this.maxFileSize)}`
      );
    }

    // Check MIME type
    const isAllowedType = Object.values(this.allowedMimeTypes)
      .flat()
      .includes(file.mimetype);

    if (!isAllowedType) {
      validation.isValid = false;
      validation.errors.push(
        `File type not allowed. Allowed types: ${this.getAllAllowedTypes().join(', ')}`
      );
    }

    // Check user storage space
    const userLimit = this.getUserStorageLimit(user);
    const availableSpace = userLimit - (user.storageUsage || 0);

    if (file.size > availableSpace) {
      validation.isValid = false;
      validation.errors.push(
        `Insufficient storage space. Available: ${this.formatBytes(availableSpace)}`
      );
    }

    // Check file extension for additional security
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!this.isExtensionAllowed(fileExtension, file.mimetype)) {
      validation.warnings.push(
        `File extension '${fileExtension}' doesn't match MIME type '${file.mimetype}'`
      );
    }

    // Check if file is potentially dangerous
    if (this.isPotentiallyDangerous(file)) {
      validation.warnings.push('File type may be potentially dangerous');
    }

    return validation;
  }

  /**
   * Generate secure file path and filename
   */
  async generateSecureFilePath(userId, originalFilename, category = 'documents') {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    
    // Sanitize filename
    const sanitizedFilename = originalFilename
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .substring(0, 255); // Limit filename length

    // Generate unique filename
    const fileExtension = path.extname(originalFilename).toLowerCase();
    const uniqueFilename = `file_${timestamp}_${randomString}${fileExtension}`;

    // Create user directory structure
    const userDir = path.join(this.baseUploadDir, this.documentsDir, userId.toString());
    const categoryDir = path.join(userDir, category);
    
    // Ensure directories exist
    [userDir, categoryDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const storagePath = path.join(categoryDir, uniqueFilename);

    return {
      filename: uniqueFilename,
      originalName: sanitizedFilename,
      storagePath,
      userDir,
      categoryDir,
      fileExtension: fileExtension.substring(1), // Remove the dot
      mimeType: this.getMimeTypeFromExtension(fileExtension)
    };
  }

  /**
   * Move file from temporary location to permanent storage
   */
  async moveFileToStorage(tempPath, destinationPath) {
    return new Promise((resolve, reject) => {
      // Check if source file exists
      if (!fs.existsSync(tempPath)) {
        return reject(new Error('Source file does not exist'));
      }

      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Move file
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
   * Calculate file checksum for integrity verification
   */
  async calculateFileChecksum(filePath, algorithm = 'md5') {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        return reject(new Error('File does not exist'));
      }

      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (error) => reject(error));
    });
  }

  /**
   * Verify file integrity using checksum
   */
  async verifyFileIntegrity(filePath, expectedChecksum) {
    try {
      const actualChecksum = await this.calculateFileChecksum(filePath);
      return actualChecksum === expectedChecksum;
    } catch (error) {
      console.error('❌ Error verifying file integrity:', error);
      return false;
    }
  }

  /**
   * Update user storage usage
   */
  async updateUserStorage(userId, fileSize, operation = 'add') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const change = operation === 'add' ? fileSize : -fileSize;
      
      user.storageUsage = Math.max(0, (user.storageUsage || 0) + change);
      await user.save();

      console.log(`✅ Updated storage for user ${userId}: ${operation} ${this.formatBytes(fileSize)}`);

      return {
        success: true,
        newUsage: user.storageUsage,
        available: this.getUserStorageLimit(user) - user.storageUsage
      };

    } catch (error) {
      console.error('❌ Error updating user storage:', error);
      throw error;
    }
  }

  /**
   * Get user storage statistics
   */
  async getUserStorageStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const storageLimit = this.getUserStorageLimit(user);
      const storageUsage = user.storageUsage || 0;
      const availableSpace = storageLimit - storageUsage;
      const usagePercentage = storageLimit > 0 ? (storageUsage / storageLimit) * 100 : 0;

      // Get document count and statistics
      const documentStats = await Document.aggregate([
        { $match: { userId: user._id, status: { $ne: 'deleted' } } },
        {
          $group: {
            _id: null,
            totalDocuments: { $sum: 1 },
            totalStorageUsed: { $sum: '$fileSize' },
            byCategory: {
              $push: {
                category: '$category',
                fileSize: '$fileSize'
              }
            }
          }
        }
      ]);

      const stats = documentStats[0] || {
        totalDocuments: 0,
        totalStorageUsed: 0,
        byCategory: []
      };

      // Calculate category breakdown
      const categoryBreakdown = stats.byCategory.reduce((acc, item) => {
        const category = item.category || 'other';
        acc[category] = (acc[category] || 0) + (item.fileSize || 0);
        return acc;
      }, {});

      return {
        success: true,
        storage: {
          used: storageUsage,
          limit: storageLimit,
          available: availableSpace,
          percentage: Math.round(usagePercentage * 100) / 100,
          formatted: {
            used: this.formatBytes(storageUsage),
            limit: this.formatBytes(storageLimit),
            available: this.formatBytes(availableSpace)
          }
        },
        documents: {
          count: stats.totalDocuments,
          totalSize: stats.totalStorageUsed,
          categories: categoryBreakdown
        },
        warnings: this.generateStorageWarnings(usagePercentage, availableSpace)
      };

    } catch (error) {
      console.error('❌ Error getting user storage stats:', error);
      throw error;
    }
  }

  /**
   * Generate storage warnings based on usage
   */
  generateStorageWarnings(usagePercentage, availableSpace) {
    const warnings = [];

    if (usagePercentage >= 90) {
      warnings.push({
        level: 'critical',
        message: 'Storage almost full! Please free up space or upgrade your plan.',
        action: 'cleanup_or_upgrade'
      });
    } else if (usagePercentage >= 80) {
      warnings.push({
        level: 'warning',
        message: 'Storage usage is high. Consider cleaning up unused files.',
        action: 'cleanup'
      });
    } else if (availableSpace < 50 * 1024 * 1024) { // Less than 50MB available
      warnings.push({
        level: 'info',
        message: 'Low available storage space.',
        action: 'monitor'
      });
    }

    return warnings;
  }

  /**
   * Clean up user's storage (remove deleted documents, etc.)
   */
  async cleanupUserStorage(userId) {
    try {
      console.log(`🧹 Starting storage cleanup for user: ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Find all deleted documents
      const deletedDocuments = await Document.find({
        userId: userId,
        status: 'deleted'
      });

      let totalFreed = 0;
      const cleanupResults = {
        deletedFiles: 0,
        freedSpace: 0,
        errors: []
      };

      // Permanently delete files and records
      for (const document of deletedDocuments) {
        try {
          // Delete physical file
          if (fs.existsSync(document.storagePath)) {
            fs.unlinkSync(document.storagePath);
            cleanupResults.deletedFiles++;
            totalFreed += document.fileSize || 0;
          }

          // Delete document record
          await Document.findByIdAndDelete(document._id);

          console.log(`🗑️  Permanently deleted: ${document.originalName}`);
        } catch (error) {
          cleanupResults.errors.push({
            document: document.originalName,
            error: error.message
          });
          console.error(`❌ Error deleting document ${document.originalName}:`, error);
        }
      }

      // Update user storage
      if (totalFreed > 0) {
        await this.updateUserStorage(userId, totalFreed, 'remove');
        cleanupResults.freedSpace = totalFreed;
      }

      // Clean up empty directories
      await this.cleanupEmptyDirectories(userId);

      console.log(`✅ Storage cleanup completed for user ${userId}`);
      
      return {
        success: true,
        ...cleanupResults,
        message: `Freed ${this.formatBytes(totalFreed)} from ${cleanupResults.deletedFiles} files`
      };

    } catch (error) {
      console.error('❌ Error during storage cleanup:', error);
      throw error;
    }
  }

  /**
   * Clean up empty directories for user
   */
  async cleanupEmptyDirectories(userId) {
    const userDir = path.join(this.baseUploadDir, this.documentsDir, userId.toString());
    
    if (!fs.existsSync(userDir)) {
      return;
    }

    const removeEmptyDirs = (dir) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      
      // Recursively process subdirectories
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          removeEmptyDirs(fullPath);
        }
      });

      // Check if directory is empty after processing subdirectories
      const remainingItems = fs.readdirSync(dir);
      if (remainingItems.length === 0 && dir !== userDir) {
        fs.rmdirSync(dir);
        console.log(`🗑️  Removed empty directory: ${dir}`);
      }
    };

    removeEmptyDirs(userDir);
  }

  /**
   * Backup user documents
   */
  async backupUserDocuments(userId, backupName = null) {
    try {
      console.log(`💾 Starting backup for user: ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = backupName || `backup_${timestamp}`;
      const backupDir = path.join(this.baseUploadDir, this.backupDir, userId.toString(), backupId);

      // Create backup directory
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Get all active documents
      const documents = await Document.find({
        userId: userId,
        status: { $ne: 'deleted' }
      });

      const backupResults = {
        totalDocuments: documents.length,
        backedUp: 0,
        failed: 0,
        backupPath: backupDir,
        errors: []
      };

      // Copy documents to backup location
      for (const document of documents) {
        try {
          if (fs.existsSync(document.storagePath)) {
            const backupFilePath = path.join(backupDir, document.filename);
            
            // Copy file
            fs.copyFileSync(document.storagePath, backupFilePath);
            backupResults.backedUp++;
            
            console.log(`✅ Backed up: ${document.originalName}`);
          } else {
            backupResults.failed++;
            backupResults.errors.push({
              document: document.originalName,
              error: 'Source file not found'
            });
          }
        } catch (error) {
          backupResults.failed++;
          backupResults.errors.push({
            document: document.originalName,
            error: error.message
          });
          console.error(`❌ Error backing up ${document.originalName}:`, error);
        }
      }

      // Create backup manifest
      const manifest = {
        userId: userId,
        backupId: backupId,
        timestamp: new Date().toISOString(),
        totalDocuments: backupResults.totalDocuments,
        backedUp: backupResults.backedUp,
        failed: backupResults.failed,
        documents: documents.map(doc => ({
          id: doc._id,
          filename: doc.filename,
          originalName: doc.originalName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          category: doc.category
        }))
      };

      const manifestPath = path.join(backupDir, 'manifest.json');
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      console.log(`✅ Backup completed for user ${userId}: ${backupResults.backedUp}/${backupResults.totalDocuments} documents`);

      return {
        success: true,
        ...backupResults,
        manifest: manifest,
        message: `Backup created: ${backupResults.backedUp} documents backed up`
      };

    } catch (error) {
      console.error('❌ Error during backup:', error);
      throw error;
    }
  }

  /**
   * Restore user documents from backup
   */
  async restoreUserDocuments(userId, backupId) {
    try {
      console.log(`🔄 Starting restore for user: ${userId} from backup: ${backupId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const backupDir = path.join(this.baseUploadDir, this.backupDir, userId.toString(), backupId);
      const manifestPath = path.join(backupDir, 'manifest.json');

      if (!fs.existsSync(manifestPath)) {
        throw new Error('Backup manifest not found');
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      const restoreResults = {
        totalDocuments: manifest.totalDocuments,
        restored: 0,
        failed: 0,
        errors: []
      };

      for (const docInfo of manifest.documents) {
        try {
          const backupFilePath = path.join(backupDir, docInfo.filename);
          
          if (fs.existsSync(backupFilePath)) {
            // Generate new secure file path
            const fileInfo = await this.generateSecureFilePath(
              userId, 
              docInfo.originalName, 
              docInfo.category
            );

            // Copy file back to storage
            fs.copyFileSync(backupFilePath, fileInfo.storagePath);

            // Create or update document record
            await Document.findOneAndUpdate(
              { _id: docInfo.id },
              {
                filename: fileInfo.filename,
                originalName: fileInfo.originalName,
                fileSize: docInfo.fileSize,
                mimeType: docInfo.mimeType,
                storagePath: fileInfo.storagePath,
                category: docInfo.category,
                status: 'draft', // Reset status for restored documents
                lastModified: new Date()
              },
              { upsert: true, new: true }
            );

            restoreResults.restored++;
            console.log(`✅ Restored: ${docInfo.originalName}`);
          } else {
            restoreResults.failed++;
            restoreResults.errors.push({
              document: docInfo.originalName,
              error: 'Backup file not found'
            });
          }
        } catch (error) {
          restoreResults.failed++;
          restoreResults.errors.push({
            document: docInfo.originalName,
            error: error.message
          });
          console.error(`❌ Error restoring ${docInfo.originalName}:`, error);
        }
      }

      console.log(`✅ Restore completed for user ${userId}: ${restoreResults.restored}/${restoreResults.totalDocuments} documents restored`);

      return {
        success: true,
        ...restoreResults,
        message: `Restore completed: ${restoreResults.restored} documents restored`
      };

    } catch (error) {
      console.error('❌ Error during restore:', error);
      throw error;
    }
  }

  /**
   * Get system-wide storage analytics (admin only)
   */
  async getSystemStorageAnalytics() {
    try {
      const analytics = await User.aggregate([
        {
          $project: {
            name: 1,
            email: 1,
            role: 1,
            storageUsage: { $ifNull: ['$storageUsage', 0] },
            storageLimit: { $ifNull: ['$storageLimit', this.defaultUserLimit] },
            documentCount: { $ifNull: ['$documentCount', 0] },
            lastLogin: 1,
            createdAt: 1
          }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalStorageUsed: { $sum: '$storageUsage' },
            totalStorageAllocated: { $sum: '$storageLimit' },
            totalDocuments: { $sum: '$documentCount' },
            averageUsage: { $avg: '$storageUsage' },
            highUsageUsers: {
              $sum: {
                $cond: [
                  { $gte: [{ $divide: ['$storageUsage', '$storageLimit'] }, 0.8] },
                  1,
                  0
                ]
              }
            },
            usersByRole: {
              $push: {
                role: '$role',
                storageUsage: '$storageUsage',
                documentCount: '$documentCount'
              }
            }
          }
        }
      ]);

      const overallStats = analytics[0] || {
        totalUsers: 0,
        totalStorageUsed: 0,
        totalStorageAllocated: 0,
        totalDocuments: 0,
        averageUsage: 0,
        highUsageUsers: 0,
        usersByRole: []
      };

      // Calculate usage by role
      const usageByRole = overallStats.usersByRole.reduce((acc, user) => {
        const role = user.role || 'user';
        acc[role] = acc[role] || { totalUsage: 0, userCount: 0, totalDocuments: 0 };
        acc[role].totalUsage += user.storageUsage || 0;
        acc[role].userCount += 1;
        acc[role].totalDocuments += user.documentCount || 0;
        return acc;
      }, {});

      return {
        success: true,
        analytics: {
          overall: {
            totalUsers: overallStats.totalUsers,
            totalStorageUsed: overallStats.totalStorageUsed,
            totalStorageAllocated: overallStats.totalStorageAllocated,
            totalDocuments: overallStats.totalDocuments,
            utilizationRate: overallStats.totalStorageAllocated > 0 
              ? (overallStats.totalStorageUsed / overallStats.totalStorageAllocated) * 100 
              : 0,
            averageUsage: overallStats.averageUsage,
            highUsageUsers: overallStats.highUsageUsers
          },
          byRole: usageByRole,
          formatted: {
            totalStorageUsed: this.formatBytes(overallStats.totalStorageUsed),
            totalStorageAllocated: this.formatBytes(overallStats.totalStorageAllocated),
            averageUsage: this.formatBytes(overallStats.averageUsage)
          }
        }
      };

    } catch (error) {
      console.error('❌ Error getting system storage analytics:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get all allowed MIME types as flat array
   */
  getAllAllowedTypes() {
    return Object.values(this.allowedMimeTypes).flat();
  }

  /**
   * Check if file extension matches MIME type
   */
  isExtensionAllowed(extension, mimeType) {
    const extensionMap = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed'
    };

    const expectedMimeType = extensionMap[extension];
    return !expectedMimeType || expectedMimeType === mimeType;
  }

  /**
   * Check if file is potentially dangerous
   */
  isPotentiallyDangerous(file) {
    const dangerousTypes = [
      'application/x-msdownload', // .exe
      'application/x-ms-installer', // .msi
      'application/x-shockwave-flash', // .swf
      'application/x-bat', // .bat
      'application/x-cmd', // .cmd
      'application/x-shellscript' // .sh
    ];

    return dangerousTypes.includes(file.mimetype);
  }

  /**
   * Get MIME type from file extension
   */
  getMimeTypeFromExtension(extension) {
    const mimeTypeMap = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed'
    };

    return mimeTypeMap[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Format bytes to human-readable string
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
   * Parse size string to bytes (e.g., "10MB" to 10485760)
   */
  parseSizeString(sizeString) {
    const units = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };

    const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*([KMGTP]?B)$/i);
    if (!match) {
      throw new Error('Invalid size format');
    }

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    return value * (units[unit] || 1);
  }
}

module.exports = new StorageService();