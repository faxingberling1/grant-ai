const Client = require('../models/Client');
const NotificationService = require('./services/NotificationService');

const notificationService = new NotificationService();

const getClients = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: req.user._id };
    if (search) {
      query.$or = [
        { organizationName: { $regex: search, $options: 'i' } },
        { primaryContactName: { $regex: search, $options: 'i' } },
        { emailAddress: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('❌ Get clients error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('❌ Get client error:', error);
    res.status(500).json({ message: error.message });
  }
};

const createClient = async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      userId: req.user._id,
      avatar: req.body.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    };
    const client = new Client(clientData);
    const savedClient = await client.save();
    
    await notificationService.createNotification({
      userId: req.user.id,
      type: 'client_communication',
      title: 'New Client Added',
      message: `Successfully added ${savedClient.organizationName} to your client list`,
      data: { clientId: savedClient._id, clientName: savedClient.organizationName },
      actionUrl: `/clients/${savedClient._id}`,
      priority: 'medium'
    });
    
    res.status(201).json(savedClient);
  } catch (error) {
    console.error('❌ Create client error:', error);
    res.status(400).json({ message: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    console.log('🔄 PUT /api/clients/:id - Client:', req.params.id, 'User:', req.user._id);
    
    const existingClient = await Client.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existingClient) {
      console.log('❌ Client not found for update:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    console.log('📝 Client found, current category:', existingClient.category);
    
    const updateObject = {
      $set: {
        ...req.body,
        updatedAt: new Date()
      }
    };

    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateObject,
      { new: true, runValidators: true }
    );
    
    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found after update attempt'
      });
    }
    
    console.log('✅ Client updated successfully in DB, new category:', updatedClient.category);
    res.json({
      success: true,
      message: 'Client updated successfully',
      client: updatedClient
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
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('❌ Delete client error:', error);
    res.status(500).json({ message: error.message });
  }
};

const addCommunication = async (req, res) => {
  try {
    const client = await Client.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    client.communicationHistory.push({
      ...req.body,
      date: new Date()
    });
    client.lastContact = new Date();
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('❌ Add communication error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  addCommunication
};