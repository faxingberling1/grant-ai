const express = require('express');
const router = express.Router();
const GrantSource = require('../models/GrantSource');
const authMiddleware = require('../middleware/auth');

// GET all grant sources with search, filtering, and pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      search, 
      category, 
      type, 
      status = 'active',
      page = 1, 
      limit = 50, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    let query = { userId: req.user._id };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'grants.title': { $regex: search, $options: 'i' } },
        { focusAreas: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Type filter
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const grantSources = await GrantSource.find(query)
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await GrantSource.countDocuments(query);
    
    res.json({
      success: true,
      grantSources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get grant sources error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch grant sources',
      error: error.message 
    });
  }
});

// GET single grant source
router.get('/:id', authMiddleware, async (req, res) => {
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
    
    res.json({
      success: true,
      grantSource
    });
  } catch (error) {
    console.error('Get grant source error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch grant source',
      error: error.message 
    });
  }
});

// CREATE new grant source
router.post('/', authMiddleware, async (req, res) => {
  try {
    const grantSourceData = {
      ...req.body,
      userId: req.user._id
    };
    
    // Validate required fields
    if (!grantSourceData.name || !grantSourceData.type || !grantSourceData.category) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and category are required'
      });
    }
    
    const grantSource = new GrantSource(grantSourceData);
    const savedGrantSource = await grantSource.save();
    
    res.status(201).json({
      success: true,
      message: 'Grant source created successfully',
      grantSource: savedGrantSource
    });
  } catch (error) {
    console.error('Create grant source error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to create grant source',
      error: error.message 
    });
  }
});

// UPDATE grant source
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const grantSource = await GrantSource.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!grantSource) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant source not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Grant source updated successfully',
      grantSource
    });
  } catch (error) {
    console.error('Update grant source error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update grant source',
      error: error.message 
    });
  }
});

// DELETE grant source
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const grantSource = await GrantSource.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!grantSource) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant source not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Grant source deleted successfully'
    });
  } catch (error) {
    console.error('Delete grant source error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete grant source',
      error: error.message 
    });
  }
});

// ADD grant to grant source
router.post('/:id/grants', authMiddleware, async (req, res) => {
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
    
    const grant = {
      ...req.body,
      createdAt: new Date()
    };
    
    // Validate required grant fields
    if (!grant.title || !grant.amount || !grant.deadline) {
      return res.status(400).json({
        success: false,
        message: 'Grant title, amount, and deadline are required'
      });
    }
    
    grantSource.grants.push(grant);
    await grantSource.save();
    
    res.status(201).json({
      success: true,
      message: 'Grant added successfully',
      grantSource
    });
  } catch (error) {
    console.error('Add grant error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add grant',
      error: error.message 
    });
  }
});

// UPDATE grant within grant source
router.put('/:sourceId/grants/:grantId', authMiddleware, async (req, res) => {
  try {
    const grantSource = await GrantSource.findOne({ 
      _id: req.params.sourceId, 
      userId: req.user._id 
    });
    
    if (!grantSource) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant source not found' 
      });
    }
    
    const grant = grantSource.grants.id(req.params.grantId);
    if (!grant) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant not found' 
      });
    }
    
    Object.assign(grant, req.body);
    grant.updatedAt = new Date();
    await grantSource.save();
    
    res.json({
      success: true,
      message: 'Grant updated successfully',
      grantSource
    });
  } catch (error) {
    console.error('Update grant error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update grant',
      error: error.message 
    });
  }
});

// DELETE grant from grant source
router.delete('/:sourceId/grants/:grantId', authMiddleware, async (req, res) => {
  try {
    const grantSource = await GrantSource.findOne({ 
      _id: req.params.sourceId, 
      userId: req.user._id 
    });
    
    if (!grantSource) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant source not found' 
      });
    }
    
    grantSource.grants.pull(req.params.grantId);
    await grantSource.save();
    
    res.json({
      success: true,
      message: 'Grant deleted successfully',
      grantSource
    });
  } catch (error) {
    console.error('Delete grant error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete grant',
      error: error.message 
    });
  }
});

// GET grant source statistics
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const totalSources = await GrantSource.countDocuments({ userId: req.user._id });
    const activeSources = await GrantSource.countDocuments({ userId: req.user._id, status: 'active' });
    
    // Count by type
    const governmentSources = await GrantSource.countDocuments({ userId: req.user._id, type: 'government' });
    const privateSources = await GrantSource.countDocuments({ userId: req.user._id, type: 'private_foundation' });
    const communitySources = await GrantSource.countDocuments({ userId: req.user._id, type: 'community_foundation' });
    
    // Count by category
    const educationSources = await GrantSource.countDocuments({ userId: req.user._id, category: 'Education' });
    const healthSources = await GrantSource.countDocuments({ userId: req.user._id, category: 'Healthcare' });
    const environmentSources = await GrantSource.countDocuments({ userId: req.user._id, category: 'Environment' });
    const artsSources = await GrantSource.countDocuments({ userId: req.user._id, category: 'Arts & Culture' });
    
    // Total grants across all sources
    const grantSources = await GrantSource.find({ userId: req.user._id });
    const totalGrants = grantSources.reduce((total, source) => total + source.grants.length, 0);
    
    res.json({
      success: true,
      stats: {
        totalSources,
        activeSources,
        byType: {
          government: governmentSources,
          private_foundation: privateSources,
          community_foundation: communitySources
        },
        byCategory: {
          education: educationSources,
          healthcare: healthSources,
          environment: environmentSources,
          arts_culture: artsSources
        },
        totalGrants
      }
    });
  } catch (error) {
    console.error('Get grant source stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch grant source statistics',
      error: error.message 
    });
  }
});

module.exports = router;