// /backend/controllers/grantSourceController.js
const GrantSource = require('../models/GrantSource');

/**
 * Get all grant sources with search, filtering, and pagination
 */
exports.getGrantSources = async (req, res) => {
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
};

/**
 * Get single grant source
 */
exports.getGrantSource = async (req, res) => {
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
};

/**
 * Create new grant source
 */
exports.createGrantSource = async (req, res) => {
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
};

/**
 * Update grant source
 */
exports.updateGrantSource = async (req, res) => {
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
};

/**
 * Delete grant source
 */
exports.deleteGrantSource = async (req, res) => {
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
};

/**
 * Add grant to grant source
 */
exports.addGrant = async (req, res) => {
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
};

/**
 * Update grant within grant source
 */
exports.updateGrant = async (req, res) => {
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
};

/**
 * Delete grant from grant source
 */
exports.deleteGrant = async (req, res) => {
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
};

/**
 * Get grant source statistics
 */
exports.getGrantSourceStats = async (req, res) => {
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
};

/**
 * Search grants across all sources
 */
exports.searchGrants = async (req, res) => {
  try {
    const { 
      keyword, 
      minAmount, 
      maxAmount, 
      deadlineFrom, 
      deadlineTo,
      categories = [],
      page = 1, 
      limit = 20 
    } = req.query;
    
    let grantSources = await GrantSource.find({ userId: req.user._id });
    
    // Collect all grants from user's sources
    let allGrants = [];
    grantSources.forEach(source => {
      source.grants.forEach(grant => {
        allGrants.push({
          ...grant.toObject(),
          sourceId: source._id,
          sourceName: source.name,
          sourceType: source.type
        });
      });
    });
    
    // Apply filters
    let filteredGrants = allGrants;
    
    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      filteredGrants = filteredGrants.filter(grant => 
        regex.test(grant.title) || 
        regex.test(grant.description || '')
      );
    }
    
    if (minAmount) {
      filteredGrants = filteredGrants.filter(grant => 
        grant.amount >= parseFloat(minAmount)
      );
    }
    
    if (maxAmount) {
      filteredGrants = filteredGrants.filter(grant => 
        grant.amount <= parseFloat(maxAmount)
      );
    }
    
    if (deadlineFrom) {
      const fromDate = new Date(deadlineFrom);
      filteredGrants = filteredGrants.filter(grant => 
        new Date(grant.deadline) >= fromDate
      );
    }
    
    if (deadlineTo) {
      const toDate = new Date(deadlineTo);
      filteredGrants = filteredGrants.filter(grant => 
        new Date(grant.deadline) <= toDate
      );
    }
    
    if (categories.length > 0) {
      const categoryArray = Array.isArray(categories) ? categories : [categories];
      filteredGrants = filteredGrants.filter(grant => 
        categoryArray.some(cat => 
          grant.categories && grant.categories.includes(cat)
        )
      );
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedGrants = filteredGrants.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      grants: paginatedGrants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredGrants.length,
        totalPages: Math.ceil(filteredGrants.length / limit)
      },
      filters: {
        keyword,
        minAmount,
        maxAmount,
        deadlineFrom,
        deadlineTo,
        categories
      }
    });
  } catch (error) {
    console.error('Search grants error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to search grants',
      error: error.message 
    });
  }
};

/**
 * Import grants from external source
 */
exports.importGrants = async (req, res) => {
  try {
    const { sourceId } = req.params;
    const { grants } = req.body;
    
    if (!grants || !Array.isArray(grants)) {
      return res.status(400).json({
        success: false,
        message: 'Grants array is required'
      });
    }
    
    const grantSource = await GrantSource.findOne({ 
      _id: sourceId, 
      userId: req.user._id 
    });
    
    if (!grantSource) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant source not found' 
      });
    }
    
    // Validate each grant
    const validGrants = grants.filter(grant => 
      grant.title && grant.amount && grant.deadline
    );
    
    if (validGrants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid grants found. Each grant must have title, amount, and deadline.'
      });
    }
    
    // Add creation date to each grant
    const grantsWithDates = validGrants.map(grant => ({
      ...grant,
      createdAt: new Date()
    }));
    
    // Add to source
    grantSource.grants.push(...grantsWithDates);
    await grantSource.save();
    
    res.status(201).json({
      success: true,
      message: `${validGrants.length} grants imported successfully`,
      importedCount: validGrants.length,
      totalGrants: grantSource.grants.length,
      grantSource
    });
  } catch (error) {
    console.error('Import grants error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to import grants',
      error: error.message 
    });
  }
};

/**
 * Export grants from a source
 */
exports.exportGrants = async (req, res) => {
  try {
    const { sourceId } = req.params;
    const { format = 'json' } = req.query;
    
    const grantSource = await GrantSource.findOne({ 
      _id: sourceId, 
      userId: req.user._id 
    });
    
    if (!grantSource) {
      return res.status(404).json({ 
        success: false,
        message: 'Grant source not found' 
      });
    }
    
    const grants = grantSource.grants;
    
    if (format === 'csv') {
      // Convert to CSV
      const headers = ['Title', 'Amount', 'Deadline', 'Status', 'Description', 'Categories'];
      const csvRows = [];
      
      // Add header
      csvRows.push(headers.join(','));
      
      // Add data rows
      grants.forEach(grant => {
        const row = [
          `"${(grant.title || '').replace(/"/g, '""')}"`,
          grant.amount || '',
          grant.deadline ? new Date(grant.deadline).toISOString().split('T')[0] : '',
          grant.status || '',
          `"${(grant.description || '').replace(/"/g, '""')}"`,
          `"${(grant.categories || []).join(';')}"`
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=grants_${grantSource.name}_${Date.now()}.csv`);
      return res.send(csvContent);
    } else {
      // Default to JSON
      res.json({
        success: true,
        source: {
          id: grantSource._id,
          name: grantSource.name,
          type: grantSource.type
        },
        grants,
        exportDate: new Date(),
        count: grants.length
      });
    }
  } catch (error) {
    console.error('Export grants error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to export grants',
      error: error.message 
    });
  }
};

/**
 * Get grant categories (unique across user's sources)
 */
exports.getGrantCategories = async (req, res) => {
  try {
    const grantSources = await GrantSource.find({ userId: req.user._id });
    
    const categories = new Set();
    grantSources.forEach(source => {
      if (source.category) {
        categories.add(source.category);
      }
      source.grants.forEach(grant => {
        if (grant.categories && Array.isArray(grant.categories)) {
          grant.categories.forEach(cat => categories.add(cat));
        }
      });
    });
    
    res.json({
      success: true,
      categories: Array.from(categories).sort()
    });
  } catch (error) {
    console.error('Get grant categories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch grant categories',
      error: error.message 
    });
  }
};

/**
 * Get upcoming grant deadlines
 */
exports.getUpcomingDeadlines = async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query;
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));
    
    const grantSources = await GrantSource.find({ userId: req.user._id });
    
    let upcomingGrants = [];
    grantSources.forEach(source => {
      source.grants.forEach(grant => {
        if (grant.deadline) {
          const deadline = new Date(grant.deadline);
          const now = new Date();
          
          if (deadline >= now && deadline <= futureDate) {
            upcomingGrants.push({
              ...grant.toObject(),
              sourceId: source._id,
              sourceName: source.name,
              daysUntil: Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
            });
          }
        }
      });
    });
    
    // Sort by deadline (closest first)
    upcomingGrants.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    // Apply limit
    if (limit) {
      upcomingGrants = upcomingGrants.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      grants: upcomingGrants,
      count: upcomingGrants.length,
      days: parseInt(days)
    });
  } catch (error) {
    console.error('Get upcoming deadlines error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch upcoming deadlines',
      error: error.message 
    });
  }
};