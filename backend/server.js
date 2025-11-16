// server.js - PRODUCTION READY with Environment Configuration
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// -------------------- ENVIRONMENT CONFIGURATION --------------------
// Determine which .env file to load based on NODE_ENV
const envFile = process.env.NODE_ENV === 'development' ? '.env.local' : '.env.production';
require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });

console.log('🚀 Environment Configuration:');
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'production'}`);
console.log(`   - Environment File: ${envFile}`);
console.log(`   - MongoDB: ${process.env.MONGO_URI ? 'URI Found' : 'URI Missing'}`);
console.log(`   - JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Missing'}`);
console.log(`   - Port: ${process.env.PORT || 5000}`);

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://grant-ai-eight.vercel.app',
    'https://grant-ai-git-main-alex-murphys-projects.vercel.app',
    'https://grant-ai-alex-murphys-projects.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
}));
app.use(express.json());

// -------------------- DATABASE CONNECTION --------------------
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI not found in environment variables.");
  console.error("   Please check your .env file configuration.");
  process.exit(1);
}

// Enhanced MongoDB connection with better error handling
const connectDB = async () => {
  try {
    console.log(`🔗 Attempting to connect to MongoDB...`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('   Please check your MONGO_URI and network connection');
    process.exit(1);
  }
};

// -------------------- MODELS --------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Grant Manager' },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

const communicationSchema = new mongoose.Schema({
  type: { type: String, enum: ['email', 'call', 'meeting', 'note'], required: true },
  direction: { type: String, enum: ['incoming', 'outgoing'] },
  subject: String,
  content: String,
  preview: String,
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'delivered', 'read', 'completed'], default: 'sent' },
  important: { type: Boolean, default: false },
  duration: String,
  attachments: [String]
});

const socialMediaSchema = new mongoose.Schema({
  platform: String,
  url: String
});

const clientSchema = new mongoose.Schema({
  organizationName: { type: String, required: true },
  primaryContactName: { type: String, required: true },
  titleRole: String,
  emailAddress: { type: String, required: true },
  phoneNumbers: String,
  additionalContactName: String,
  additionalContactTitle: String,
  additionalContactEmail: String,
  additionalContactPhone: String,
  mailingAddress: String,
  website: String,
  socialMediaLinks: [socialMediaSchema],
  taxIdEIN: String,
  organizationType: String,
  missionStatement: String,
  focusAreas: [String],
  serviceArea: String,
  annualBudget: String,
  staffCount: String,
  status: { type: String, enum: ['active', 'inactive', 'prospect'], default: 'active' },
  tags: [String],
  notes: String,
  avatar: String,
  grantsSubmitted: { type: Number, default: 0 },
  grantsAwarded: { type: Number, default: 0 },
  totalFunding: { type: String, default: '$0' },
  lastContact: { type: Date, default: Date.now },
  communicationHistory: [communicationSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

clientSchema.index({ userId: 1 });
clientSchema.index({ emailAddress: 1 });
clientSchema.index({ organizationName: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ tags: 1 });
clientSchema.index({ createdAt: -1 });

clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Client = mongoose.model('Client', clientSchema);

// -------------------- AUTH MIDDLEWARE --------------------
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('🔐 Auth middleware error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// -------------------- DEMO DATA --------------------
async function createDemoUsers() {
  try {
    const demoUsers = [
      {
        name: "Demo User",
        email: "demo@grantfunds.com",
        password: "demo123",
        role: "Grant Manager",
        avatar: "https://i.pravatar.cc/150?img=45"
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Demo user created: ${userData.email}`);
      } else {
        console.log(`ℹ️  Demo user already exists: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  }
}

async function createDemoClients() {
  try {
    const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
    if (!demoUser) {
      console.log('❌ Demo user not found for creating demo clients');
      return;
    }

    const existingClients = await Client.find({ userId: demoUser._id });
    if (existingClients.length > 0) {
      console.log(`ℹ️  ${existingClients.length} demo clients already exist`);
      return;
    }

    const demoClients = [
      {
        organizationName: 'GreenTech Initiative',
        primaryContactName: 'Sarah Chen',
        titleRole: 'Executive Director',
        emailAddress: 'sarah.chen@greentech.org',
        phoneNumbers: '+1 (555) 123-4567',
        status: 'active',
        tags: ['Environment', 'Technology', 'Non-Profit'],
        notes: 'Very responsive and organized. Great partnership potential.',
        grantsSubmitted: 12,
        grantsAwarded: 8,
        totalFunding: '$450,000',
        avatar: 'https://i.pravatar.cc/150?img=1',
        userId: demoUser._id
      },
      {
        organizationName: 'Community Health Alliance',
        primaryContactName: 'David Kim',
        titleRole: 'Program Director',
        emailAddress: 'david.kim@communityhealth.org',
        phoneNumbers: '+1 (555) 987-6543',
        status: 'active',
        tags: ['Healthcare', 'Community', 'Non-Profit'],
        notes: 'Focuses on healthcare access in underserved communities.',
        grantsSubmitted: 8,
        grantsAwarded: 5,
        totalFunding: '$280,000',
        avatar: 'https://i.pravatar.cc/150?img=32',
        userId: demoUser._id
      },
      {
        organizationName: 'Future Leaders Foundation',
        primaryContactName: 'Maria Rodriguez',
        titleRole: 'Development Director',
        emailAddress: 'maria.rodriguez@futureleaders.org',
        phoneNumbers: '+1 (555) 456-7890',
        status: 'prospect',
        tags: ['Education', 'Youth', 'Mentorship'],
        notes: 'New prospect - follow up in 2 weeks.',
        grantsSubmitted: 3,
        grantsAwarded: 1,
        totalFunding: '$75,000',
        avatar: 'https://i.pravatar.cc/150?img=28',
        userId: demoUser._id
      }
    ];

    for (const clientData of demoClients) {
      const client = new Client(clientData);
      await client.save();
      console.log(`✅ Demo client created: ${clientData.organizationName}`);
    }
    
    console.log(`🎉 Created ${demoClients.length} demo clients`);
  } catch (error) {
    console.error('❌ Error creating demo clients:', error);
  }
}

// -------------------- ROUTES --------------------

// Health check with detailed environment info
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Grant AI backend is running successfully 🚀',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0',
    nodeVersion: process.version,
    platform: process.platform
  });
});

// Test endpoint for connection testing
app.get('/api/test-connection', (req, res) => {
  res.json({
    success: true,
    message: `Backend connection successful - ${process.env.NODE_ENV || 'production'} environment`,
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists with this email' });

    const newUser = await User.create({
      name,
      email,
      password,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.correctPassword(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// Client routes
app.get('/api/clients', authMiddleware, async (req, res) => {
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
});

app.get('/api/clients/:id', authMiddleware, async (req, res) => {
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
});

app.post('/api/clients', authMiddleware, async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      userId: req.user._id,
      avatar: req.body.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    };
    
    const client = new Client(clientData);
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    console.error('❌ Create client error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('❌ Update client error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/clients/:id', authMiddleware, async (req, res) => {
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
});

app.post('/api/clients/:id/communications', authMiddleware, async (req, res) => {
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
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GrantFlow CRM Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/*',
      clients: '/api/clients/*',
      health: '/api/health',
      test: '/api/test-connection'
    }
  });
});

// -------------------- ERROR HANDLING --------------------
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// -------------------- SERVER START --------------------
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Initialize demo data
    console.log('📦 Initializing database with demo data...');
    await createDemoUsers();
    await createDemoClients();
    console.log('✅ Database initialization complete!');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log('\n🎯 ==========================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
      console.log(`⏰ Started: ${new Date().toISOString()}`);
      console.log('🎯 ==========================================\n');
      
      console.log('📋 Available endpoints:');
      console.log(`   GET  /              - API information`);
      console.log(`   GET  /api/health    - Health check`);
      console.log(`   GET  /api/test-connection - Connection test`);
      console.log(`   POST /api/auth/login - User login`);
      console.log(`   POST /api/auth/register - User registration`);
      console.log(`   GET  /api/clients   - Get all clients (auth required)`);
      console.log('\n🔐 Demo credentials:');
      console.log('   Email: demo@grantfunds.com');
      console.log('   Password: demo123');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔻 Shutting down server gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔻 Server termination signal received...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
  process.exit(0);
});

// Start the server
startServer();