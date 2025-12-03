// /backend/services/gridfsService.js - CORRECTED VERSION
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
const crypto = require('crypto');

class GridFSService {
  constructor() {
    this.bucket = null;
    this.bucketName = 'documents';
    this.chunkSizeBytes = 255 * 1024; // 255KB chunks (GridFS default)
    this.maxFileSize = 5 * 1024 * 1024; // 5MB (optimized for free tier)
    this.isInitialized = false;
    
    // Initialize when MongoDB connects
    this.initialize();
  }

  /**
   * Initialize GridFS bucket
   */
  initialize() {
    console.log('📁 Initializing GridFS service...');
    
    if (!mongoose.connection.db) {
      console.warn('⚠️ MongoDB connection not ready for GridFS. Will initialize when connection is open.');
      mongoose.connection.once('open', () => {
        this._initializeBucket();
      });
      return;
    }
    
    this._initializeBucket();
  }

  /**
   * Internal bucket initialization
   */
  _initializeBucket() {
    try {
      if (!mongoose.connection.db) {
        throw new Error('MongoDB database connection not available');
      }

      this.bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: this.bucketName,
        chunkSizeBytes: this.chunkSizeBytes
      });

      this.isInitialized = true;
      console.log('✅ GridFS bucket initialized:', {
        bucketName: this.bucketName,
        chunkSize: this.formatBytes(this.chunkSizeBytes),
        maxFileSize: this.formatBytes(this.maxFileSize)
      });

    } catch (error) {
      console.error('❌ Failed to initialize GridFS bucket:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Wait for GridFS to be ready
   */
  async waitForReady() {
    if (this.isInitialized) {
      return true;
    }
    
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.isInitialized) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('GridFS initialization timeout'));
      }, 10000);
    });
  }

  /**
   * Calculate file checksum (MD5)
   */
  calculateChecksum(buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return `doc_${timestamp}_${randomString}_${safeName}`;
  }

  /**
   * Upload file to GridFS
   */
  async uploadFile(fileBuffer, originalName, metadata = {}) {
    try {
      await this.waitForReady();
      
      if (!this.bucket) {
        throw new Error('GridFS bucket not initialized');
      }

      // Validate file size
      if (fileBuffer.length > this.maxFileSize) {
        throw new Error(`File size exceeds maximum limit of ${this.formatBytes(this.maxFileSize)}`);
      }

      const uniqueFilename = this.generateUniqueFilename(originalName);
      const checksum = this.calculateChecksum(fileBuffer);

      // Prepare enhanced metadata
      const enhancedMetadata = {
        ...metadata,
        originalName: originalName,
        originalSize: fileBuffer.length,
        checksum: checksum,
        uploadedAt: new Date(),
        userId: metadata.userId || 'unknown',
        userEmail: metadata.userEmail || 'unknown@example.com'
      };

      return new Promise((resolve, reject) => {
        const uploadStream = this.bucket.openUploadStream(uniqueFilename, {
          metadata: enhancedMetadata,
          contentType: metadata.contentType || 'application/octet-stream'
        });

        const readable = new Readable();
        readable.push(fileBuffer);
        readable.push(null);
        
        uploadStream.on('error', (error) => {
          console.error('GridFS upload error:', error);
          reject(new Error(`Failed to upload file: ${error.message}`));
        });
        
        uploadStream.on('finish', () => {
          console.log(`✅ File uploaded to GridFS: ${originalName}`);
          
          resolve({
            fileId: uploadStream.id,
            gridfsFilename: uniqueFilename,
            originalFilename: originalName,
            contentType: uploadStream.options.contentType,
            metadata: uploadStream.options.metadata,
            checksum: checksum,
            chunkSize: uploadStream.options.chunkSizeBytes,
            uploadDate: new Date()
          });
        });

        readable.pipe(uploadStream);
      });

    } catch (error) {
      console.error('❌ GridFS upload error:', error);
      throw error;
    }
  }

  /**
   * Download file from GridFS
   */
  async downloadFile(fileId) {
    try {
      await this.waitForReady();
      
      if (!this.bucket) {
        throw new Error('GridFS bucket not initialized');
      }

      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new Error(`Invalid file ID format: ${fileId}`);
      }

      const objectId = new mongoose.Types.ObjectId(fileId);
      
      // First check if file exists
      const fileInfo = await this.getFileInfo(fileId);
      if (!fileInfo) {
        throw new Error(`File not found in GridFS: ${fileId}`);
      }

      return new Promise((resolve, reject) => {
        try {
          const downloadStream = this.bucket.openDownloadStream(objectId);
          const chunks = [];
          
          downloadStream.on('data', (chunk) => {
            chunks.push(chunk);
          });
          
          downloadStream.on('error', (error) => {
            console.error('GridFS download error:', error);
            reject(new Error(`Failed to download file: ${error.message}`));
          });
          
          downloadStream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            console.log(`✅ File downloaded from GridFS: ${fileId}`);
            resolve(buffer);
          });
        } catch (error) {
          reject(error);
        }
      });

    } catch (error) {
      console.error('❌ GridFS download error:', error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileInfo(fileId) {
    try {
      await this.waitForReady();
      
      if (!this.bucket) {
        throw new Error('GridFS bucket not initialized');
      }

      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return null;
      }

      const objectId = new mongoose.Types.ObjectId(fileId);
      const files = await this.bucket.find({ _id: objectId }).toArray();
      
      if (files.length === 0) {
        return null;
      }

      const fileInfo = files[0];
      
      return {
        _id: fileInfo._id,
        filename: fileInfo.filename,
        length: fileInfo.length,
        chunkSize: fileInfo.chunkSize,
        uploadDate: fileInfo.uploadDate,
        contentType: fileInfo.contentType,
        metadata: fileInfo.metadata || {},
        md5: fileInfo.md5
      };

    } catch (error) {
      console.error('❌ Error getting file info:', error);
      return null;
    }
  }

  /**
   * Delete file from GridFS
   */
  async deleteFile(fileId) {
    try {
      await this.waitForReady();
      
      if (!this.bucket) {
        throw new Error('GridFS bucket not initialized');
      }

      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new Error(`Invalid file ID format: ${fileId}`);
      }

      const objectId = new mongoose.Types.ObjectId(fileId);
      
      // First check if file exists
      const fileInfo = await this.getFileInfo(fileId);
      if (!fileInfo) {
        console.warn(`⚠️ File not found for deletion: ${fileId}`);
        return true;
      }

      return new Promise((resolve, reject) => {
        this.bucket.delete(objectId, (error) => {
          if (error) {
            console.error('GridFS delete error:', error);
            reject(new Error(`Failed to delete file: ${error.message}`));
          } else {
            console.log(`✅ File deleted from GridFS: ${fileId}`);
            resolve(true);
          }
        });
      });

    } catch (error) {
      console.error('❌ GridFS delete error:', error);
      throw error;
    }
  }

  /**
   * List files with optional filtering
   */
  async listFiles(filter = {}, options = {}) {
    try {
      await this.waitForReady();
      
      if (!this.bucket) {
        throw new Error('GridFS bucket not initialized');
      }

      const { limit = 100, skip = 0, sort = { uploadDate: -1 } } = options;
      
      const cursor = this.bucket.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      
      const files = await cursor.toArray();
      
      return files.map(file => ({
        _id: file._id,
        filename: file.filename,
        length: file.length,
        chunkSize: file.chunkSize,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
        metadata: file.metadata || {}
      }));

    } catch (error) {
      console.error('❌ Error listing files:', error);
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      await this.waitForReady();
      
      if (!this.bucket) {
        throw new Error('GridFS bucket not initialized');
      }

      const files = await this.listFiles();
      const totalSize = files.reduce((sum, file) => sum + file.length, 0);
      const totalFiles = files.length;

      const stats = {
        totalFiles,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        averageFileSize: totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0,
        averageFileSizeFormatted: this.formatBytes(totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0),
        largestFile: files.length > 0 ? Math.max(...files.map(f => f.length)) : 0,
        largestFileFormatted: this.formatBytes(files.length > 0 ? Math.max(...files.map(f => f.length)) : 0)
      };

      console.log('📊 GridFS Storage Stats:', {
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSizeFormatted
      });

      return stats;

    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        totalSizeFormatted: '0 Bytes',
        error: error.message
      };
    }
  }

  /**
   * Clean up orphaned chunks (maintenance)
   */
  async cleanupOrphanedChunks() {
    try {
      await this.waitForReady();
      
      if (!this.bucket) {
        throw new Error('GridFS bucket not initialized');
      }

      console.log('🧹 Checking for orphaned GridFS chunks...');
      
      const db = mongoose.connection.db;
      
      // Get all files
      const filesCollection = db.collection(`${this.bucketName}.files`);
      const chunksCollection = db.collection(`${this.bucketName}.chunks`);
      
      const fileIds = await filesCollection.distinct('_id');
      
      // Find chunks without corresponding files
      const orphanedChunks = await chunksCollection.find({
        files_id: { $nin: fileIds }
      }).toArray();
      
      if (orphanedChunks.length > 0) {
        console.log(`⚠️ Found ${orphanedChunks.length} orphaned chunks`);
        
        // Delete orphaned chunks
        const result = await chunksCollection.deleteMany({
          files_id: { $nin: fileIds }
        });
        
        console.log(`✅ Cleaned ${result.deletedCount} orphaned chunks`);
        
        return {
          cleaned: result.deletedCount,
          message: `Cleaned ${result.deletedCount} orphaned chunks`
        };
      }
      
      console.log('✅ No orphaned chunks found');
      return {
        cleaned: 0,
        message: 'No orphaned chunks found'
      };
      
    } catch (error) {
      console.error('❌ Error during orphaned chunk cleanup:', error);
      throw error;
    }
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
   * Health check for GridFS
   */
  async healthCheck() {
    try {
      await this.waitForReady();
      
      if (!this.bucket) {
        return {
          healthy: false,
          status: 'GridFS bucket not initialized',
          timestamp: new Date()
        };
      }

      // Try a simple operation to check connectivity
      const stats = await this.getStorageStats();
      
      return {
        healthy: true,
        status: 'GridFS is operational',
        timestamp: new Date(),
        stats: {
          totalFiles: stats.totalFiles,
          totalSize: stats.totalSizeFormatted,
          bucketName: this.bucketName
        }
      };
      
    } catch (error) {
      return {
        healthy: false,
        status: `GridFS error: ${error.message}`,
        timestamp: new Date(),
        error: error.message
      };
    }
  }
}

// Create and export singleton instance
const gridfsService = new GridFSService();

module.exports = gridfsService;