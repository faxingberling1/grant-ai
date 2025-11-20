// backend/routes/clients.js
const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authMiddleware } = require('../middleware/auth');

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

// CREATE new client
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('🆕 POST /api/clients - User:', req.user.id);

    console.log('📦 Request body with categories:', {
      organizationName: req.body.organizationName,
      category: req.body.category,
      priority: req.body.priority,
      focusAreas: req.body.focusAreas,
      fundingAreas: req.body.fundingAreas,
      grantSources: req.body.grantSources
    });

    const clientData = {
      ...req.body,
      userId: req.user.id
    };

    // Required field validation
    if (!clientData.organizationName || !clientData.primaryContactName || !clientData.emailAddress) {
      return res.status(400).json({
        success: false,
        message: 'Organization name, primary contact name, and email address are required'
      });
    }

    // Enhanced array formatting with validation
    const arrayFields = ['focusAreas', 'fundingAreas', 'grantSources', 'tags', 'socialMediaLinks'];
    arrayFields.forEach(field => {
      if (clientData[field]) {
        if (Array.isArray(clientData[field])) {
          // Filter out empty strings and ensure proper formatting
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

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      client: savedClient
    });

  } catch (error) {
    console.error('❌ Create client error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
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

// UPDATE client - FIXED VERSION
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 PUT /api/clients/:id - Client:', req.params.id, 'User:', req.user.id);

    console.log('📦 Raw update data received:', {
      organizationName: req.body.organizationName,
      category: req.body.category, // Log the incoming category
      priority: req.body.priority,
      // ... other fields you are interested in logging
    });

    // Find the client first to ensure it exists and belongs to the user
    const existingClient = await Client.findOne({ _id: req.params.id, userId: req.user.id });

    if (!existingClient) {
      console.log('❌ Client not found for update:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    console.log('📝 Client found, current category:', existingClient.category);

    // --- CRITICAL FIX: Use $set operator for findOneAndUpdate ---
    // Construct the update object using $set for explicit field updates
    const updateObject = {
      $set: {
        ...req.body, // Spread all fields from the request body
        updatedAt: new Date() // Ensure the timestamp is updated
      }
    };

    // Perform the update using findOneAndUpdate with $set
    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // Query
      updateObject,                                // Update object using $set
      { new: true, runValidators: true }          // Options: return updated doc, run validation
    );

    if (!updatedClient) {
      // This should ideally not happen if the client was found above,
      // but good to check.
      return res.status(404).json({
        success: false,
        message: 'Client not found after update attempt'
      });
    }

    console.log('✅ Client updated successfully in DB, new category:', updatedClient.category);

    res.json({
      success: true,
      message: 'Client updated successfully',
      client: updatedClient // Send back the updated client object
    });

  } catch (error) {
    console.error('❌ Update client error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error('Validation Errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update client',
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

// Debug - test client creation
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

module.exports = router;