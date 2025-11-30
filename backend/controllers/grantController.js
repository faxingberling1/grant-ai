const Grant = require('../models/Grant');

const getGrantSources = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { 
      status: 'active',
      isActive: true 
    };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { funder: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { focusAreas: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const grants = await Grant.find(query)
      .sort({ deadline: 1, createdAt: -1 })
      .select('-isActive');
    
    console.log(`✅ Found ${grants.length} grant sources`);
    res.json(grants);
  } catch (error) {
    console.error('❌ Error fetching grant sources:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching grant sources',
      error: error.message 
    });
  }
};

const getGrantSourceById = async (req, res) => {
  try {
    const grant = await Grant.findOne({
      _id: req.params.id,
      status: 'active',
      isActive: true
    });
    
    if (!grant) {
      return res.status(404).json({
        success: false,
        message: 'Grant source not found'
      });
    }
    
    res.json({
      success: true,
      data: grant
    });
  } catch (error) {
    console.error('❌ Error fetching grant source:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid grant ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching grant source',
      error: error.message
    });
  }
};

const createGrant = async (req, res) => {
  try {
    const {
      title,
      funder,
      category,
      deadline,
      maxAward,
      focusAreas,
      eligibility,
      description,
      url,
      clientId
    } = req.body;
    
    if (!title || !funder || !category || !deadline || !maxAward || !eligibility) {
      return res.status(400).json({
        success: false,
        message: 'Title, funder, category, deadline, maxAward, and eligibility are required'
      });
    }
    
    const grantData = {
      title: title.trim(),
      funder: funder.trim(),
      category,
      deadline: new Date(deadline),
      maxAward: Number(maxAward),
      focusAreas: focusAreas || [],
      eligibility: eligibility.trim(),
      description: description?.trim() || '',
      url: url || '',
      status: 'draft',
      createdBy: req.user._id,
      clientId: clientId || null
    };
    
    const grant = new Grant(grantData);
    const savedGrant = await grant.save();
    
    console.log(`✅ Grant created: ${savedGrant.title} for user: ${req.user.email}`);
    
    res.status(201).json({
      success: true,
      message: 'Grant created successfully',
      data: savedGrant
    });
  } catch (error) {
    console.error('❌ Error creating grant:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating grant',
      error: error.message
    });
  }
};

const getUserGrants = async (req, res) => {
  try {
    const { status, clientId } = req.query;
    let query = { createdBy: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (clientId) {
      query.clientId = clientId;
    }
    
    const grants = await Grant.find(query)
      .sort({ createdAt: -1 })
      .populate('clientId', 'organizationName primaryContactName');
    
    res.json({
      success: true,
      data: grants,
      count: grants.length
    });
  } catch (error) {
    console.error('❌ Error fetching user grants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grants',
      error: error.message
    });
  }
};

const updateGrant = async (req, res) => {
  try {
    const grant = await Grant.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!grant) {
      return res.status(404).json({
        success: false,
        message: 'Grant not found'
      });
    }
    
    const updatedGrant = await Grant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Grant updated successfully',
      data: updatedGrant
    });
  } catch (error) {
    console.error('❌ Error updating grant:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating grant',
      error: error.message
    });
  }
};

module.exports = {
  getGrantSources,
  getGrantSourceById,
  createGrant,
  getUserGrants,
  updateGrant
};