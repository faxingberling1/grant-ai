// /backend/services/gridfsServerless.js
const { MongoClient, GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
const crypto = require('crypto');

class GridFSServerless {
  constructor() {
    this.bucketName = 'documents';
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
  }

  async getBucket() {
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 1,
    });
    
    const db = client.db();
    const bucket = new GridFSBucket(db, {
      bucketName: this.bucketName,
      chunkSizeBytes: 255 * 1024,
    });
    
    return { client, bucket, db };
  }

  async uploadFile(fileBuffer, originalName, metadata = {}) {
    const { client, bucket } = await this.getBucket();
    
    try {
      if (fileBuffer.length > this.maxFileSize) {
        throw new Error(`File size exceeds ${this.formatBytes(this.maxFileSize)} limit`);
      }

      const uniqueFilename = this.generateUniqueFilename(originalName);
      const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');

      const enhancedMetadata = {
        ...metadata,
        originalName,
        originalSize: fileBuffer.length,
        checksum,
        uploadedAt: new Date(),
        platform: process.env.VERCEL ? 'vercel' : process.env.RENDER ? 'render' : 'local',
      };

      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(uniqueFilename, {
          metadata: enhancedMetadata,
          contentType: metadata.contentType || 'application/octet-stream',
        });

        const readable = new Readable();
        readable.push(fileBuffer);
        readable.push(null);
        
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
          resolve({
            fileId: uploadStream.id,
            filename: uniqueFilename,
            originalName,
            size: fileBuffer.length,
            checksum,
          });
        });

        readable.pipe(uploadStream);
      });
    } finally {
      await client.close(); // CRITICAL for serverless!
    }
  }

  async downloadFile(fileId) {
    const { client, bucket } = await this.getBucket();
    
    try {
      return new Promise((resolve, reject) => {
        const downloadStream = bucket.openDownloadStream(fileId);
        const chunks = [];
        
        downloadStream.on('data', (chunk) => chunks.push(chunk));
        downloadStream.on('error', reject);
        downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } finally {
      await client.close();
    }
  }

  generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return `doc_${timestamp}_${randomString}_${safeName}`;
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
}

module.exports = new GridFSServerless();