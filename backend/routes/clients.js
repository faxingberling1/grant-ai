const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const authMiddleware = require('../middleware/auth');

// GET all clients for authenticated user with search and pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = { userId: req.user._id };
    
    // Search functionality
    if (search) {
      query.$or = [
        { organizationName: { $regex: search, $options: 'i' } },
        { primaryContactName: { $regex: search, $options: 'i' } },
        { emailAddress: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const clients = await Client.find(query)
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Client.countDocuments(query);
    
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
    console.error('Get clients error:', error);
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
    const client = await Client.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Client not found' 
      });
    }
    
    res.json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Get client error:', error);
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
    const clientData = {
      ...req.body,
      userId: req.user._id,
      avatar: req.body.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    };
    
    // Validate required fields
    if (!clientData.organizationName || !clientData.primaryContactName || !clientData.emailAddress) {
      return res.status(400).json({
        success: false,
        message: 'Organization name, primary contact name, and email address are required'
      });
    }
    
    const client = new Client(clientData);
    const savedClient = await client.save();
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      client: savedClient
    });
  } catch (error) {
    console.error('Create client error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to create client',
      error: error.message 
    });
  }
});

// UPDATE client
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Client not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Client updated successfully',
      client
    });
  } catch (error) {
    console.error('Update client error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
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
    const client = await Client.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Client not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
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
    const client = await Client.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Client not found' 
      });
    }
    
    const communication = {
      ...req.body,
      date: new Date()
    };
    
    client.communicationHistory.push(communication);
    client.lastContact = new Date();
    await client.save();
    
    res.status(201).json({
      success: true,
      message: 'Communication added successfully',
      client
    });
  } catch (error) {
    console.error('Add communication error:', error);
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
    const totalClients = await Client.countDocuments({ userId: req.user._id });
    const activeClients = await Client.countDocuments({ userId: req.user._id, status: 'active' });
    const inactiveClients = await Client.countDocuments({ userId: req.user._id, status: 'inactive' });
    const prospectClients = await Client.countDocuments({ userId: req.user._id, status: 'prospect' });
    
    // Recent clients (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentClients = await Client.countDocuments({ 
      userId: req.user._id, 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    res.json({
      success: true,
      stats: {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients,
        prospects: prospectClients,
        recent: recentClients
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch client statistics',
      error: error.message 
    });
  }
});

module.exports = router;