// backend/routes/clients.js
const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authMiddleware } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// GET all clients for authenticated user with search and pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 GET /api/clients - User:', req.user.id);

    const {
      search,
      status,
      category,
      priority,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { userId: req.user.id };
    console.log('📋 Base query:', { userId: req.user.id });

    // Enhanced Search – With all relevant fields
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { organizationName: searchRegex },
        { primaryContactName: searchRegex },
        { emailAddress: searchRegex },
        { category: searchRegex },
        { missionStatement: searchRegex },
        { serviceArea: searchRegex },
        { focusAreas: { $in: [searchRegex] } },
        { tags: { $in: [searchRegex] } },
        { fundingAreas: { $in: [searchRegex] } }
      ];

      console.log('🔎 Enhanced search query for:', search);
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
      console.log('📊 Status filter applied:', status);
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
      console.log('🎯 Category filter applied:', category);
    }

    // Priority filter
    if (priority && priority !== 'all') {
      query.priority = priority;
      console.log('🚩 Priority filter applied:', priority);
    }

    // Sort configuration
    const sortConfig = {};
    const validSortFields = ['organizationName', 'category', 'priority', 'status', 'createdAt', 'updatedAt', 'lastContact'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortConfig[sortField] = sortOrder === 'desc' ? -1 : 1;

    console.log('📈 Sort config:', sortConfig);

    const clients = await Client.find(query)
      .sort(sortConfig)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Client.countDocuments(query);

    console.log(`✅ Found ${clients.length} clients for user ${req.user.id} out of ${total} total`);

    // Debug: Log category distribution for found clients
    const categoryCounts = {};
    clients.forEach(client => {
      const cat = client.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    console.log('📊 Category distribution in results:', categoryCounts);

    res.json({
      success: true,
      clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('❌ Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
});

// GET single client
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 GET /api/clients/:id - Client:', req.params.id, 'User:', req.user.id);

    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!client) {
      console.log('❌ Client not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    console.log('✅ Client found:', {
      id: client._id,
      organizationName: client.organizationName,
      category: client.category,
      priority: client.priority,
      status: client.status
    });

    res.json({
      success: true,
      client
    });

  } catch (error) {
    console.error('❌ Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client',
      error: error.message
    });
  }
});

// CREATE new client - WITH ENHANCED VALIDATION
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('🆕 POST /api/clients - User:', req.user.id);

    // Pre-validate required fields before creating client
    if (!req.body.organizationName || !req.body.primaryContactName || !req.body.emailAddress) {
      const missingFields = [];
      if (!req.body.organizationName) missingFields.push('organizationName');
      if (!req.body.primaryContactName) missingFields.push('primaryContactName');
      if (!req.body.emailAddress) missingFields.push('emailAddress');
      
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missingFields,
        details: 'Organization name, primary contact name, and email address are required'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(req.body.emailAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
        field: 'emailAddress',
        value: req.body.emailAddress
      });
    }

    // Validate enum fields
    const organizationTypeOptions = [
      'Nonprofit 501(c)(3)', 'Nonprofit 501(c)(4)', 'Nonprofit 501(c)(6)',
      'Government Agency', 'Educational Institution', 'For-Profit Corporation',
      'Small Business', 'Startup', 'Community Organization',
      'Religious Organization', 'Foundation', 'Other'
    ];

    if (req.body.organizationType && !organizationTypeOptions.includes(req.body.organizationType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid organization type. Must be one of: ${organizationTypeOptions.join(', ')}`,
        field: 'organizationType',
        value: req.body.organizationType,
        allowedValues: organizationTypeOptions
      });
    }

    const clientData = {
      ...req.body,
      userId: req.user.id
    };

    // Enhanced array formatting with validation
    const arrayFields = ['focusAreas', 'fundingAreas', 'grantSources', 'tags', 'socialMediaLinks'];
    arrayFields.forEach(field => {
      if (clientData[field]) {
        if (Array.isArray(clientData[field])) {
          clientData[field] = clientData[field]
            .filter(item => item && item.toString().trim() !== '')
            .map(item => item.toString().trim());
        } else {
          clientData[field] = [clientData[field].toString().trim()];
        }
      } else {
        clientData[field] = [];
      }
    });

    // Set default avatar if not provided
    if (!clientData.avatar) {
      clientData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(clientData.organizationName)}&background=random`;
    }

    console.log('🧹 Cleaned client data for creation:', {
      organizationName: clientData.organizationName,
      category: clientData.category,
      focusAreas: clientData.focusAreas,
      fundingAreas: clientData.fundingAreas
    });

    const client = new Client(clientData);
    const savedClient = await client.save();

    console.log('✅ Client created successfully:', {
      id: savedClient._id,
      organizationName: savedClient.organizationName,
      category: savedClient.category,
      priority: savedClient.priority,
      focusAreas: savedClient.focusAreas
    });

    // 🔔 NOTIFICATION INTEGRATION - Send client creation notification
    try {
      console.log('📢 Attempting to create notification for new client...');
      
      const notification = await notificationService.createClientNotification(
        req.user.id,
        savedClient.organizationName,
        savedClient._id.toString()
      );
      
      console.log('✅ Client creation notification sent successfully:', {
        notificationId: notification._id,
        clientName: savedClient.organizationName,
        userId: req.user.id
      });
      
    } catch (notificationError) {
      console.error('❌ Failed to create client notification:', notificationError);
      // Don't fail the client creation if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      client: savedClient
    });

  } catch (error) {
    console.error('❌ Create client error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email or organization name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create client',
      error: error.message
    });
  }
});

// UPDATE client - WITH VALIDATION ENABLED
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 PUT /api/clients/:id - Client:', req.params.id, 'User:', req.user.id);

    // Find the client first to ensure it exists and belongs to the user
    const existingClient = await Client.findOne({ _id: req.params.id, userId: req.user.id });

    if (!existingClient) {
      console.log('❌ Client not found for update:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    console.log('📦 Raw update data received:', JSON.stringify(req.body, null, 2));

    // Create a safe update object that only includes fields that exist in the schema
    const updateData = {};
    
    // List of allowed fields from your Client schema
    const allowedFields = [
      'organizationName',
      'primaryContactName', 
      'titleRole',
      'emailAddress',
      'phoneNumbers',
      'organizationType',
      'category',
      'priority',
      'status',
      'focusAreas',
      'fundingAreas',
      'grantSources',
      'tags',
      'socialMediaLinks',
      'missionStatement',
      'serviceArea',
      'website',
      'avatar',
      'grantsSubmitted',
      'grantsAwarded',
      'totalFunding',
      'lastContact',
      'nextFollowUp',
      'notes'
    ];

    // Only copy allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Process array fields safely
    const arrayFields = ['focusAreas', 'fundingAreas', 'grantSources', 'tags', 'socialMediaLinks'];
    arrayFields.forEach(field => {
      if (updateData[field]) {
        if (Array.isArray(updateData[field])) {
          updateData[field] = updateData[field]
            .filter(item => item && item.toString().trim() !== '')
            .map(item => item.toString().trim());
        } else if (typeof updateData[field] === 'string') {
          updateData[field] = updateData[field]
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== '');
        } else {
          updateData[field] = [];
        }
      } else {
        updateData[field] = [];
      }
    });

    // Handle enum fields with validation
    const organizationTypeOptions = [
      'Nonprofit 501(c)(3)',
      'Nonprofit 501(c)(4)', 
      'Nonprofit 501(c)(6)',
      'Government Agency',
      'Educational Institution',
      'For-Profit Corporation',
      'Small Business',
      'Startup',
      'Community Organization',
      'Religious Organization',
      'Foundation',
      'Other'
    ];

    const priorityOptions = ['low', 'medium', 'high', 'critical'];
    const statusOptions = ['active', 'inactive', 'prospect'];
    const categoryOptions = [
      'Education',
      'Healthcare', 
      'Environment',
      'Arts & Culture',
      'Social Justice',
      'STEM Education',
      'Clean Energy',
      'Other'
    ];

    // Validate and normalize enum fields
    if (updateData.organizationType && !organizationTypeOptions.includes(updateData.organizationType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid organization type. Must be one of: ${organizationTypeOptions.join(', ')}`,
        field: 'organizationType',
        value: updateData.organizationType,
        allowedValues: organizationTypeOptions
      });
    }

    if (updateData.priority && !priorityOptions.includes(updateData.priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${priorityOptions.join(', ')}`,
        field: 'priority',
        value: updateData.priority,
        allowedValues: priorityOptions
      });
    }

    if (updateData.status && !statusOptions.includes(updateData.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${statusOptions.join(', ')}`,
        field: 'status',
        value: updateData.status,
        allowedValues: statusOptions
      });
    }

    if (updateData.category && !categoryOptions.includes(updateData.category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${categoryOptions.join(', ')}`,
        field: 'category',
        value: updateData.category,
        allowedValues: categoryOptions
      });
    }

    // Validate required fields
    if (updateData.organizationName !== undefined && !updateData.organizationName) {
      return res.status(400).json({
        success: false,
        message: 'Organization name is required',
        field: 'organizationName'
      });
    }

    if (updateData.primaryContactName !== undefined && !updateData.primaryContactName) {
      return res.status(400).json({
        success: false,
        message: 'Primary contact name is required',
        field: 'primaryContactName'
      });
    }

    if (updateData.emailAddress !== undefined) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!updateData.emailAddress) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required',
          field: 'emailAddress'
        });
      }
      if (!emailRegex.test(updateData.emailAddress)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address',
          field: 'emailAddress',
          value: updateData.emailAddress
        });
      }
    }

    // Validate number fields
    if (updateData.grantsSubmitted !== undefined) {
      const grantsSubmitted = parseInt(updateData.grantsSubmitted);
      if (isNaN(grantsSubmitted) || grantsSubmitted < 0) {
        return res.status(400).json({
          success: false,
          message: 'Grants submitted must be a non-negative number',
          field: 'grantsSubmitted',
          value: updateData.grantsSubmitted
        });
      }
      updateData.grantsSubmitted = grantsSubmitted;
    }

    if (updateData.grantsAwarded !== undefined) {
      const grantsAwarded = parseInt(updateData.grantsAwarded);
      if (isNaN(grantsAwarded) || grantsAwarded < 0) {
        return res.status(400).json({
          success: false,
          message: 'Grants awarded must be a non-negative number',
          field: 'grantsAwarded',
          value: updateData.grantsAwarded
        });
      }
      updateData.grantsAwarded = grantsAwarded;
    }

    // Validate grants awarded doesn't exceed grants submitted
    if (updateData.grantsAwarded !== undefined && updateData.grantsSubmitted !== undefined) {
      if (updateData.grantsAwarded > updateData.grantsSubmitted) {
        return res.status(400).json({
          success: false,
          message: 'Grants awarded cannot exceed grants submitted',
          field: 'grantsAwarded',
          grantsAwarded: updateData.grantsAwarded,
          grantsSubmitted: updateData.grantsSubmitted
        });
      }
    }

    console.log('🧹 Processed and validated update data:', {
      organizationName: updateData.organizationName,
      category: updateData.category,
      priority: updateData.priority,
      status: updateData.status,
      focusAreas: updateData.focusAreas,
      organizationType: updateData.organizationType
    });

    // Perform the update WITH VALIDATION ENABLED
    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { 
        new: true,
        runValidators: true, // VALIDATION ENABLED
        context: 'query'
      }
    );

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found after update attempt'
      });
    }

    console.log('✅ Client updated successfully with validation:', {
      id: updatedClient._id,
      organizationName: updatedClient.organizationName,
      category: updatedClient.category,
      priority: updatedClient.priority,
      status: updatedClient.status
    });

    res.json({
      success: true,
      message: 'Client updated successfully',
      client: updatedClient
    });

  } catch (error) {
    console.error('❌ Update client error:', error);

    // Enhanced error logging for validation
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value,
        kind: err.kind
      }));
      
      console.error('🔴 Validation Errors Details:', errors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors,
        errorType: 'ValidationError'
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        field: error.path,
        value: error.value,
        errorType: 'CastError'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry found - organization name or email already exists',
        errorType: 'DuplicateKeyError'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update client',
      error: error.message,
      errorType: error.name
    });
  }
});

// EMERGENCY UPDATE - NO VALIDATION (Keep as backup)
router.patch('/:id/emergency-update', authMiddleware, async (req, res) => {
  try {
    console.log('🚨 EMERGENCY UPDATE /api/clients/:id/emergency-update - Client:', req.params.id);
    
    const result = await Client.updateOne(
      { _id: req.params.id, userId: req.user.id },
      { 
        $set: {
          ...req.body,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Fetch the updated client
    const updatedClient = await Client.findOne({ _id: req.params.id, userId: req.user.id });

    console.log('✅ Emergency update successful');
    
    res.json({
      success: true,
      message: 'Client updated successfully (emergency mode)',
      client: updatedClient
    });

  } catch (error) {
    console.error('❌ Emergency update error:', error);
    res.status(500).json({
      success: false,
      message: 'Emergency update failed',
      error: error.message
    });
  }
});

// DELETE client
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/clients/:id - Client:', req.params.id, 'User:', req.user.id);

    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    console.log('✅ Client deleted:', client.organizationName);

    res.json({
      success: true,
      message: 'Client deleted successfully',
      deletedClient: {
        id: client._id,
        organizationName: client.organizationName
      }
    });

  } catch (error) {
    console.error('❌ Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
      error: error.message
    });
  }
});

// ADD communication to client
router.post('/:id/communications', authMiddleware, async (req, res) => {
  try {
    console.log('💬 POST /api/clients/:id/communications - Client:', req.params.id, 'User:', req.user.id);

    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const communication = {
      ...req.body,
      id: new Date().getTime().toString(),
      createdAt: new Date(),
      createdBy: req.user.id
    };

    // Use the instance method from the model
    await client.addCommunication(communication);

    console.log('✅ Communication added to client:', client.organizationName);

    res.status(201).json({
      success: true,
      message: 'Communication added successfully',
      communication,
      client: {
        id: client._id,
        organizationName: client.organizationName,
        lastContact: client.lastContact
      }
    });

  } catch (error) {
    console.error('❌ Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add communication',
      error: error.message
    });
  }
});

// GET client statistics
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    console.log('📊 GET /api/clients/stats/overview - User:', req.user.id);

    const totalClients = await Client.countDocuments({ userId: req.user.id });
    const activeClients = await Client.countDocuments({ userId: req.user.id, status: 'active' });
    const inactiveClients = await Client.countDocuments({ userId: req.user.id, status: 'inactive' });
    const prospectClients = await Client.countDocuments({ userId: req.user.id, status: 'prospect' });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClients = await Client.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get clients needing follow-up
    const clientsNeedingFollowUp = await Client.countDocuments({
      userId: req.user.id,
      nextFollowUp: { $lte: new Date() },
      status: 'active'
    });

    res.json({
      success: true,
      stats: {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients,
        prospects: prospectClients,
        recent: recentClients,
        needingFollowUp: clientsNeedingFollowUp
      }
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client statistics',
      error: error.message
    });
  }
});

// ENHANCED CATEGORY STATS
router.get('/stats/categories', authMiddleware, async (req, res) => {
  try {
    console.log('📊 GET /api/clients/stats/categories - User:', req.user.id);

    // Use the static method from the model
    const categoryStats = await Client.getCategoryStats(req.user.id);

    // Format the response
    const formattedStats = {
      'all': {
        count: 0,
        active: 0,
        funding: 0,
        grantsSubmitted: 0,
        grantsAwarded: 0
      }
    };

    categoryStats.forEach(stat => {
      formattedStats[stat._id || 'Uncategorized'] = {
        count: stat.count,
        active: stat.active,
        funding: stat.totalFunding || 0,
        grantsSubmitted: stat.totalGrantsSubmitted,
        grantsAwarded: stat.totalGrantsAwarded
      };

      // Accumulate for 'all' category
      formattedStats.all.count += stat.count;
      formattedStats.all.active += stat.active;
      formattedStats.all.funding += stat.totalFunding || 0;
      formattedStats.all.grantsSubmitted += stat.totalGrantsSubmitted;
      formattedStats.all.grantsAwarded += stat.totalGrantsAwarded;
    });

    console.log('📈 Enhanced category statistics calculated:', Object.keys(formattedStats));

    res.json({
      success: true,
      stats: formattedStats,
      categories: Object.keys(formattedStats).filter(cat => cat !== 'all').sort()
    });

  } catch (error) {
    console.error('❌ Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics',
      error: error.message
    });
  }
});

// GET clients by category
router.get('/category/:category', authMiddleware, async (req, res) => {
  try {
    const { category } = req.params;
    console.log('🎯 GET /api/clients/category/:category - Category:', category, 'User:', req.user.id);

    const clients = await Client.findByCategory(req.user.id, category);

    res.json({
      success: true,
      clients,
      category,
      count: clients.length
    });

  } catch (error) {
    console.error('❌ Get clients by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients by category',
      error: error.message
    });
  }
});

// SEARCH clients with advanced filtering
router.get('/search/advanced', authMiddleware, async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      priority,
      organizationType,
      minGrants,
      maxGrants
    } = req.query;

    console.log('🔍 Advanced search - User:', req.user.id, 'Filters:', req.query);

    let query = Client.find().byUser(req.user.id);

    // Apply search if provided
    if (search) {
      query = query.search(search);
    }

    // Apply filters
    if (category && category !== 'all') {
      query = query.byCategory(category);
    }

    if (status && status !== 'all') {
      query = query.byStatus(status);
    }

    if (priority && priority !== 'all') {
      query = query.byPriority(priority);
    }

    if (organizationType && organizationType !== 'all') {
      query = query.where({ organizationType });
    }

    if (minGrants) {
      query = query.where('grantsSubmitted').gte(parseInt(minGrants));
    }

    if (maxGrants) {
      query = query.where('grantsSubmitted').lte(parseInt(maxGrants));
    }

    const clients = await query.sort({ createdAt: -1 });

    res.json({
      success: true,
      clients,
      count: clients.length,
      filters: req.query
    });

  } catch (error) {
    console.error('❌ Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform advanced search',
      error: error.message
    });
  }
});

// Debug - category test
router.get('/debug/category-test', authMiddleware, async (req, res) => {
  try {
    console.log('🔐 DEBUG /api/clients/debug/category-test - User:', req.user.id);

    const clients = await Client.find({ userId: req.user.id }).limit(5);
    const categorySample = clients.map(client => ({
      id: client._id,
      organizationName: client.organizationName,
      category: client.category,
      priority: client.priority,
      focusAreas: client.focusAreas,
      fundingAreas: client.fundingAreas,
      grantSources: client.grantSources,
      tags: client.tags,
      status: client.status
    }));

    // Get category distribution
    const categoryStats = await Client.getCategoryStats(req.user.id);

    res.json({
      success: true,
      message: 'Category data test successful',
      sampleData: categorySample,
      categoryStats: categoryStats,
      totalClients: await Client.countDocuments({ userId: req.user.id })
    });

  } catch (error) {
    console.error('❌ Category debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Category debug test failed',
      error: error.message
    });
  }
});

// Debug - test client creation WITH NOTIFICATION
router.post('/debug/test-create', authMiddleware, async (req, res) => {
  try {
    console.log('🧪 DEBUG /api/clients/debug/test-create - User:', req.user.id);

    const testClientData = {
      organizationName: 'Test Organization ' + Date.now(),
      primaryContactName: 'Test Contact',
      emailAddress: `test${Date.now()}@example.com`,
      category: 'Education', // Default to a valid category
      priority: 'high',
      focusAreas: ['STEM Education', 'Test Focus'],
      fundingAreas: ['Test Funding'],
      grantSources: ['1', '2'],
      tags: ['test', 'debug'],
      userId: req.user.id
    };

    const client = new Client(testClientData);
    const savedClient = await client.save();

    console.log('✅ Test client created successfully:', savedClient.organizationName);

    // 🔔 NOTIFICATION INTEGRATION - Send test client creation notification
    try {
      console.log('📢 Attempting to create notification for test client...');
      
      const notification = await notificationService.createClientNotification(
        req.user.id,
        savedClient.organizationName,
        savedClient._id.toString()
      );
      
      console.log('✅ Test client notification sent successfully:', {
        notificationId: notification._id,
        clientName: savedClient.organizationName
      });
      
    } catch (notificationError) {
      console.error('❌ Failed to create test client notification:', notificationError);
      // Don't fail the test client creation if notification fails
    }

    res.json({
      success: true,
      message: 'Test client created successfully',
      client: savedClient
    });

  } catch (error) {
    console.error('❌ Test client creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Test client creation failed',
      error: error.message
    });
  }
});

// Debug - auth test
router.get('/debug/auth-test', authMiddleware, (req, res) => {
  console.log('🔐 DEBUG /api/clients/debug/auth-test - User:', req.user.id);
  res.json({
    success: true,
    message: 'Authentication is working correctly',
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

// Debug - notification test specifically for clients
router.post('/debug/notification-test', authMiddleware, async (req, res) => {
  try {
    console.log('🔔 DEBUG /api/clients/debug/notification-test - User:', req.user.id);

    const { clientName = 'Test Client' } = req.body;

    // Test notification creation directly
    const notification = await notificationService.createClientNotification(
      req.user.id,
      clientName,
      'test-client-id-' + Date.now()
    );

    console.log('✅ Client notification test successful:', {
      notificationId: notification._id,
      clientName: clientName,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Client notification test successful',
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Client notification test error:', error);
    res.status(500).json({
      success: false,
      message: 'Client notification test failed',
      error: error.message
    });
  }
});

// Debug - test validation for specific client
router.post('/debug/validate-client', authMiddleware, async (req, res) => {
  try {
    console.log('🧪 DEBUG /api/clients/debug/validate-client - User:', req.user.id);
    
    const testData = {
      ...req.body,
      userId: req.user.id
    };

    console.log('📦 Test data for validation:', testData);

    // Try to create a client instance to test validation
    const testClient = new Client(testData);
    
    // Manually validate
    const validationError = testClient.validateSync();
    
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      console.log('❌ Validation failed:', errors);
      
      return res.json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    console.log('✅ Validation passed');
    
    res.json({
      success: true,
      message: 'Validation passed'
    });

  } catch (error) {
    console.error('❌ Validation test error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation test failed',
      error: error.message
    });
  }
});

// Debug - test update with specific data
router.post('/debug/test-update/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🧪 DEBUG /api/clients/debug/test-update/:id - Client:', req.params.id, 'User:', req.user.id);

    const existingClient = await Client.findOne({ _id: req.params.id, userId: req.user.id });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    console.log('📦 Test update data:', updateData);

    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found after update'
      });
    }

    console.log('✅ Test update successful:', {
      id: updatedClient._id,
      organizationName: updatedClient.organizationName,
      category: updatedClient.category
    });

    res.json({
      success: true,
      message: 'Test update successful',
      client: updatedClient
    });

  } catch (error) {
    console.error('❌ Test update error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error in test update',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Test update failed',
      error: error.message
    });
  }
});

// NEW: Client document management routes
router.post('/:id/documents', authMiddleware, async (req, res) => {
  try {
    console.log('📄 POST /api/clients/:id/documents - Client:', req.params.id, 'User:', req.user.id);

    const client = await Client.findOne({ _id: req.params.id, userId: req.user.id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const documentData = {
      ...req.body,
      uploadedBy: req.user.id
    };

    await client.addDocument(documentData);
    await client.updateDocumentStats();

    console.log('✅ Document added to client:', client.organizationName);

    res.status(201).json({
      success: true,
      message: 'Document added successfully',
      document: client.documents[client.documents.length - 1]
    });

  } catch (error) {
    console.error('❌ Add document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add document',
      error: error.message
    });
  }
});

// GET client documents
router.get('/:id/documents', authMiddleware, async (req, res) => {
  try {
    console.log('📄 GET /api/clients/:id/documents - Client:', req.params.id, 'User:', req.user.id);

    const client = await Client.findOne({ _id: req.params.id, userId: req.user.id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      documents: client.documents,
      documentStats: client.documentStats
    });

  } catch (error) {
    console.error('❌ Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
});

// DELETE client document
router.delete('/:id/documents/:docId', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/clients/:id/documents/:docId - Client:', req.params.id, 'Document:', req.params.docId);

    const client = await Client.findOne({ _id: req.params.id, userId: req.user.id });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.removeDocument(req.params.docId);
    await client.updateDocumentStats();

    console.log('✅ Document deleted from client:', client.organizationName);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// NEW: Client bulk operations
router.post('/bulk/update-status', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 POST /api/clients/bulk/update-status - User:', req.user.id);
    
    const { clientIds, status } = req.body;

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client IDs array is required'
      });
    }

    if (!status || !['active', 'inactive', 'prospect'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const result = await Client.updateMany(
      { _id: { $in: clientIds }, userId: req.user.id },
      { $set: { status, updatedAt: new Date() } }
    );

    console.log('✅ Bulk status update successful:', {
      matched: result.matchedCount,
      modified: result.modifiedCount
    });

    res.json({
      success: true,
      message: `Status updated for ${result.modifiedCount} clients`,
      stats: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('❌ Bulk update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client statuses',
      error: error.message
    });
  }
});

// NEW: Client export data
router.get('/export/data', authMiddleware, async (req, res) => {
  try {
    console.log('📤 GET /api/clients/export/data - User:', req.user.id);

    const clients = await Client.find({ userId: req.user.id })
      .select('-communicationHistory -documents -__v')
      .sort({ organizationName: 1 });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=clients-export.json');

    res.json({
      success: true,
      exportDate: new Date().toISOString(),
      totalClients: clients.length,
      clients: clients
    });

  } catch (error) {
    console.error('❌ Client export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export client data',
      error: error.message
    });
  }
});

// NEW: Client import validation
router.post('/import/validate', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 POST /api/clients/import/validate - User:', req.user.id);

    const { clients } = req.body;

    if (!clients || !Array.isArray(clients)) {
      return res.status(400).json({
        success: false,
        message: 'Clients array is required'
      });
    }

    const validationResults = {
      valid: [],
      invalid: [],
      duplicates: []
    };

    for (const clientData of clients) {
      try {
        const testClient = new Client({
          ...clientData,
          userId: req.user.id
        });

        const validationError = testClient.validateSync();
        
        if (validationError) {
          validationResults.invalid.push({
            client: clientData,
            errors: Object.values(validationError.errors).map(err => ({
              field: err.path,
              message: err.message
            }))
          });
        } else {
          // Check for duplicates
          const existingClient = await Client.findOne({
            userId: req.user.id,
            $or: [
              { organizationName: clientData.organizationName },
              { emailAddress: clientData.emailAddress }
            ]
          });

          if (existingClient) {
            validationResults.duplicates.push({
              client: clientData,
              existingClient: {
                id: existingClient._id,
                organizationName: existingClient.organizationName
              }
            });
          } else {
            validationResults.valid.push(clientData);
          }
        }
      } catch (error) {
        validationResults.invalid.push({
          client: clientData,
          errors: [{ field: 'general', message: error.message }]
        });
      }
    }

    res.json({
      success: true,
      validation: validationResults,
      summary: {
        total: clients.length,
        valid: validationResults.valid.length,
        invalid: validationResults.invalid.length,
        duplicates: validationResults.duplicates.length
      }
    });

  } catch (error) {
    console.error('❌ Import validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate import data',
      error: error.message
    });
  }
});

module.exports = router;