// /backend/routes/grantSources.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const grantSourceController = require('../controllers/grantSourceController');

// ====================
// GRANT SOURCE ROUTES
// ====================

// GET all grant sources with search, filtering, and pagination
router.get('/', authMiddleware, grantSourceController.getGrantSources);

// GET single grant source
router.get('/:id', authMiddleware, grantSourceController.getGrantSource);

// CREATE new grant source
router.post('/', authMiddleware, grantSourceController.createGrantSource);

// UPDATE grant source
router.put('/:id', authMiddleware, grantSourceController.updateGrantSource);

// DELETE grant source
router.delete('/:id', authMiddleware, grantSourceController.deleteGrantSource);

// ====================
// GRANTS ROUTES (within a source)
// ====================

// ADD grant to grant source
router.post('/:id/grants', authMiddleware, grantSourceController.addGrant);

// UPDATE grant within grant source
router.put('/:sourceId/grants/:grantId', authMiddleware, grantSourceController.updateGrant);

// DELETE grant from grant source
router.delete('/:sourceId/grants/:grantId', authMiddleware, grantSourceController.deleteGrant);

// ====================
// STATISTICS & ANALYTICS
// ====================

// GET grant source statistics overview
router.get('/stats/overview', authMiddleware, grantSourceController.getGrantSourceStats);

// GET all unique grant categories across user's sources
router.get('/categories/all', authMiddleware, grantSourceController.getGrantCategories);

// GET upcoming grant deadlines
router.get('/deadlines/upcoming', authMiddleware, grantSourceController.getUpcomingDeadlines);

// ====================
// SEARCH & DISCOVERY
// ====================

// SEARCH grants across all sources with advanced filters
router.get('/grants/search', authMiddleware, grantSourceController.searchGrants);

// ====================
// IMPORT/EXPORT
// ====================

// IMPORT grants from external source to a specific grant source
router.post('/:sourceId/grants/import', authMiddleware, grantSourceController.importGrants);

// EXPORT grants from a specific grant source
router.get('/:sourceId/grants/export', authMiddleware, grantSourceController.exportGrants);

// ====================
// BATCH OPERATIONS
// ====================

// BATCH update grant sources status
router.patch('/batch/status', authMiddleware, async (req, res) => {
  try {
    const { sourceIds, status } = req.body;
    
    if (!sourceIds || !Array.isArray(sourceIds) || !status) {
      return res.status(400).json({
        success: false,
        message: 'Source IDs array and status are required'
      });
    }
    
    const result = await GrantSource.updateMany(
      { 
        _id: { $in: sourceIds },
        userId: req.user._id 
      },
      { $set: { status } }
    );
    
    res.json({
      success: true,
      message: `Updated status for ${result.modifiedCount} grant sources`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Batch update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to batch update grant sources',
      error: error.message 
    });
  }
});

// BATCH delete grant sources
router.delete('/batch/delete', authMiddleware, async (req, res) => {
  try {
    const { sourceIds } = req.body;
    
    if (!sourceIds || !Array.isArray(sourceIds)) {
      return res.status(400).json({
        success: false,
        message: 'Source IDs array is required'
      });
    }
    
    const result = await GrantSource.deleteMany({
      _id: { $in: sourceIds },
      userId: req.user._id
    });
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} grant sources`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to batch delete grant sources',
      error: error.message 
    });
  }
});

// ====================
// VALIDATION & TESTING
// ====================

// VALIDATE grant source connection/API key
router.post('/:id/validate', authMiddleware, async (req, res) => {
  try {
    const grantSource = await GrantSource.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!grantSource) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant source not found' 
      });
    }
    
    // Here you would implement actual validation logic
    // For example, test API connection, verify credentials, etc.
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isValid = true; // Replace with actual validation result
    const message = isValid 
      ? 'Grant source connection validated successfully'
      : 'Failed to validate grant source connection';
    
    res.json({
      success: true,
      validated: isValid,
      message,
      source: {
        id: grantSource._id,
        name: grantSource.name,
        type: grantSource.type,
        status: grantSource.status
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Validate grant source error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to validate grant source',
      error: error.message 
    });
  }
});

// TEST grant source API endpoint
router.get('/:id/test-endpoint', authMiddleware, async (req, res) => {
  try {
    const grantSource = await GrantSource.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!grantSource) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant source not found' 
      });
    }
    
    const { endpoint } = req.query;
    
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint URL is required'
      });
    }
    
    // Here you would implement actual API testing logic
    // For now, simulate API test
    
    const testResult = {
      url: endpoint,
      status: 200,
      responseTime: Math.random() * 500 + 100, // 100-600ms
      success: Math.random() > 0.2, // 80% success rate
      data: {
        count: Math.floor(Math.random() * 100),
        items: []
      }
    };
    
    // Update last tested timestamp
    grantSource.lastTested = new Date();
    grantSource.testResult = testResult.success ? 'success' : 'failed';
    await grantSource.save();
    
    res.json({
      success: true,
      testResult,
      source: {
        id: grantSource._id,
        name: grantSource.name
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to test endpoint',
      error: error.message 
    });
  }
});

// ====================
// MONITORING & HEALTH
// ====================

// GET grant source health status
router.get('/:id/health', authMiddleware, async (req, res) => {
  try {
    const grantSource = await GrantSource.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!grantSource) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant source not found' 
      });
    }
    
    // Calculate health metrics
    const now = new Date();
    const lastUpdated = grantSource.updatedAt || grantSource.createdAt;
    const hoursSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60));
    
    const healthStatus = {
      source: {
        id: grantSource._id,
        name: grantSource.name,
        type: grantSource.type,
        status: grantSource.status
      },
      metrics: {
        totalGrants: grantSource.grants.length,
        activeGrants: grantSource.grants.filter(g => g.status === 'active').length,
        expiredGrants: grantSource.grants.filter(g => {
          if (!g.deadline) return false;
          return new Date(g.deadline) < now;
        }).length,
        hoursSinceLastUpdate: hoursSinceUpdate,
        lastTested: grantSource.lastTested,
        lastTestResult: grantSource.testResult
      },
      health: {
        score: Math.min(100, 100 - (hoursSinceUpdate / 24) * 10), // Score based on recency
        status: hoursSinceUpdate < 24 ? 'healthy' : hoursSinceUpdate < 72 ? 'warning' : 'critical',
        issues: []
      },
      recommendations: []
    };
    
    // Add issues and recommendations
    if (hoursSinceUpdate > 24) {
      healthStatus.health.issues.push(`Source hasn't been updated in ${hoursSinceUpdate} hours`);
      healthStatus.recommendations.push('Consider refreshing data from source');
    }
    
    if (grantSource.grants.length === 0) {
      healthStatus.health.issues.push('No grants found in this source');
      healthStatus.recommendations.push('Import grants or check source configuration');
    }
    
    res.json({
      success: true,
      health: healthStatus,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Get health status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get health status',
      error: error.message 
    });
  }
});

// ====================
// SYNC & REFRESH
// ====================

// SYNC/REFRESH grants from source
router.post('/:id/sync', authMiddleware, async (req, res) => {
  try {
    const grantSource = await GrantSource.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!grantSource) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant source not found' 
      });
    }
    
    const { fullSync = false } = req.body;
    
    // Here you would implement actual sync logic
    // For example, fetch new grants from external API
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const syncResult = {
      sourceId: grantSource._id,
      sourceName: grantSource.name,
      syncType: fullSync ? 'full' : 'incremental',
      startedAt: new Date(Date.now() - 2000),
      completedAt: new Date(),
      duration: 2000,
      newGrants: Math.floor(Math.random() * 10),
      updatedGrants: Math.floor(Math.random() * 5),
      totalGrants: grantSource.grants.length + Math.floor(Math.random() * 10),
      status: 'completed',
      message: 'Sync completed successfully'
    };
    
    // Update source with sync results
    grantSource.lastSynced = new Date();
    grantSource.syncStatus = 'completed';
    grantSource.totalGrants = syncResult.totalGrants;
    await grantSource.save();
    
    res.json({
      success: true,
      message: 'Sync completed successfully',
      syncResult,
      source: {
        id: grantSource._id,
        name: grantSource.name,
        lastSynced: grantSource.lastSynced,
        totalGrants: grantSource.totalGrants
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to sync grant source',
      error: error.message 
    });
  }
});

// ====================
// DASHBOARD & SUMMARY
// ====================

// GET dashboard summary for grant sources
router.get('/dashboard/summary', authMiddleware, async (req, res) => {
  try {
    const grantSources = await GrantSource.find({ userId: req.user._id });
    
    const summary = {
      totalSources: grantSources.length,
      activeSources: grantSources.filter(s => s.status === 'active').length,
      totalGrants: grantSources.reduce((sum, source) => sum + source.grants.length, 0),
      byType: {},
      byCategory: {},
      recentActivity: [],
      upcomingDeadlines: 0,
      syncStatus: {
        syncedLast24h: 0,
        needsAttention: 0
      }
    };
    
    // Count by type and category
    grantSources.forEach(source => {
      summary.byType[source.type] = (summary.byType[source.type] || 0) + 1;
      summary.byCategory[source.category] = (summary.byCategory[source.category] || 0) + 1;
      
      // Check sync status
      if (source.lastSynced) {
        const hoursSinceSync = (new Date() - source.lastSynced) / (1000 * 60 * 60);
        if (hoursSinceSync < 24) {
          summary.syncStatus.syncedLast24h++;
        } else if (hoursSinceSync > 72) {
          summary.syncStatus.needsAttention++;
        }
      }
      
      // Count upcoming deadlines
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      source.grants.forEach(grant => {
        if (grant.deadline) {
          const deadline = new Date(grant.deadline);
          if (deadline > now && deadline <= thirtyDaysFromNow) {
            summary.upcomingDeadlines++;
          }
        }
      });
    });
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // This would normally come from an activity log
    // For now, simulate some activity
    summary.recentActivity = [
      {
        type: 'source_created',
        source: 'Government Grants',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        user: req.user.firstName
      },
      {
        type: 'grant_imported',
        source: 'Private Foundations',
        count: 15,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        user: req.user.firstName
      },
      {
        type: 'sync_completed',
        source: 'Community Foundations',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        user: req.user.firstName
      }
    ];
    
    res.json({
      success: true,
      summary,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: error.message 
    });
  }
});

module.exports = router;