// -------------------- IMPORTS --------------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://grant-ai-eight.vercel.app',   // ✅ Your Vercel frontend
    'https://grant-ai.onrender.com'        // ✅ Your Render backend (for testing)
  ],
  credentials: true,
}));
app.use(express.json());

// -------------------- DATABASE CONNECTION --------------------
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI not found. Please set it in Render Environment Variables.");
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// -------------------- USER MODEL --------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Grant Manager' },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

// -------------------- CREATE DEMO USERS --------------------
async function createDemoUsers() {
  try {
    const demoUsers = [
      {
        name: "Demo User",
        email: "demo@grantflow.com",
        password: "demo123",
        role: "Grant Manager",
        avatar: "https://i.pravatar.cc/150?img=45"
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@grantflow.com", 
        password: "password123",
        role: "Senior Grant Manager",
        avatar: "https://i.pravatar.cc/150?img=12"
      },
      {
        name: "Admin User",
        email: "admin@grantflow.com",
        password: "admin123",
        role: "Administrator",
        avatar: "https://i.pravatar.cc/150?img=1"
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Demo user created: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  }
}

// -------------------- AUTH ROUTES --------------------

// Register new user
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user (protected)
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
      return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user)
      return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// -------------------- HEALTH CHECK --------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Grant AI backend is running successfully 🚀'
  });
});

// -------------------- SERVER START --------------------
mongoose.connection.once('open', async () => {
  await createDemoUsers();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
