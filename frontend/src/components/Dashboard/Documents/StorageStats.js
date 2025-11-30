import React, { useState, useEffect, useMemo } from 'react';
import { useDocuments } from '../../../context/DocumentsContext';
import './StorageStats.css';

const StorageStats = () => {
  const { documents, storageInfo } = useDocuments();
  const [storageStats, setStorageStats] = useState({
    totalStorage: 0,
    usedStorage: 0,
    availableStorage: 0,
    usagePercentage: 0,
    documentCount: 0,
    byCategory: {}
  });

  // Calculate storage usage safely using useMemo to prevent unnecessary recalculations
  const calculatedStats = useMemo(() => {
    // Filter out invalid documents first
    const validDocuments = (documents || []).filter(doc => 
      doc && typeof doc === 'object' && (doc._id || doc.id)
    );

    // Use storageInfo from context if available, otherwise calculate locally
    const totalStorage = storageInfo.total > 0 ? storageInfo.total : (100 * 1024 * 1024); // Use context or 100MB default
    const usedStorage = storageInfo.used > 0 ? storageInfo.used : validDocuments.reduce((total, doc) => {
      return total + (doc.fileSize || doc.size || 0);
    }, 0);
    
    const availableStorage = storageInfo.available > 0 ? storageInfo.available : Math.max(0, totalStorage - usedStorage);
    const usagePercentage = Math.min(100, Math.round((usedStorage / totalStorage) * 100));

    // Calculate storage by category
    const byCategory = validDocuments.reduce((acc, doc) => {
      const category = doc.category || 'other';
      const fileSize = doc.fileSize || doc.size || 0;
      
      if (!acc[category]) {
        acc[category] = {
          storage: 0,
          count: 0
        };
      }
      
      acc[category].storage += fileSize;
      acc[category].count += 1;
      
      return acc;
    }, {});

    return {
      totalStorage,
      usedStorage,
      availableStorage,
      usagePercentage,
      documentCount: validDocuments.length,
      byCategory
    };
  }, [documents, storageInfo]); // Only recalculate when documents or storageInfo changes

  useEffect(() => {
    setStorageStats(calculatedStats);
  }, [calculatedStats]);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressBarColor = (percentage) => {
    if (percentage < 70) return '#10b981'; // green
    if (percentage < 90) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getTopCategories = () => {
    if (storageStats.usedStorage === 0) return [];
    
    return Object.entries(storageStats.byCategory)
      .sort(([, a], [, b]) => b.storage - a.storage)
      .slice(0, 3)
      .map(([category, data]) => ({
        category,
        storage: data.storage,
        count: data.count,
        percentage: Math.round((data.storage / storageStats.usedStorage) * 100) || 0
      }));
  };

  const topCategories = getTopCategories();

  return (
    <div className="storage-stats">
      <div className="storage-stats-header">
        <h3 className="storage-stats-title">
          <i className="fas fa-chart-pie storage-stats-icon"></i>
          Storage Overview
        </h3>
        <div className="storage-stats-summary">
          <span className="storage-used">
            {formatBytes(storageStats.usedStorage)} used
          </span>
          <span className="storage-available">
            {formatBytes(storageStats.availableStorage)} available
          </span>
        </div>
      </div>

      {/* Storage Progress Bar */}
      <div className="storage-progress">
        <div className="storage-progress-bar">
          <div 
            className="storage-progress-fill"
            style={{ 
              width: `${storageStats.usagePercentage}%`,
              backgroundColor: getProgressBarColor(storageStats.usagePercentage)
            }}
          ></div>
        </div>
        <div className="storage-progress-labels">
          <span className="storage-label">
            {storageStats.usagePercentage}% used
          </span>
          <span className="storage-label">
            {formatBytes(storageStats.totalStorage)} total
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="storage-quick-stats">
        <div className="stat-card">
          <div className="stat-icon document-count">
            <i className="fas fa-file"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{storageStats.documentCount}</span>
            <span className="stat-label">Documents</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon storage-used">
            <i className="fas fa-database"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{formatBytes(storageStats.usedStorage)}</span>
            <span className="stat-label">Storage Used</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon storage-available">
            <i className="fas fa-cloud"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{formatBytes(storageStats.availableStorage)}</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="storage-categories">
          <h4 className="categories-title">Storage by Category</h4>
          <div className="categories-list">
            {topCategories.map((item, index) => (
              <div key={item.category} className="category-item">
                <div className="category-info">
                  <span className="category-name">
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                  <span className="category-stats">
                    {formatBytes(item.storage)} • {item.count} file{item.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="category-percentage">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storage Tips */}
      <div className="storage-tips">
        <div className="tip-item">
          <i className="fas fa-lightbulb tip-icon"></i>
          <div className="tip-content">
            <strong>Storage Tip:</strong>
            {storageStats.usagePercentage > 80 ? 
              'Consider archiving old documents to free up space.' :
              storageStats.usagePercentage > 50 ?
              'Your storage is filling up. Review large files.' :
              'You have plenty of storage space available.'
            }
          </div>
        </div>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info" style={{ 
          fontSize: '10px', 
          color: '#666', 
          marginTop: '10px', 
          padding: '5px', 
          background: '#f5f5f5',
          borderRadius: '3px'
        }}>
          <strong>Debug:</strong> Docs: {storageStats.documentCount} | 
          Used: {formatBytes(storageStats.usedStorage)} | 
          Context Storage: {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}
        </div>
      )}
    </div>
  );
};

export default StorageStats;