// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Ensures password is never returned in queries by default
  },
  avatar: {
    type: String,
    default: function() {
      // Generate unique default avatar
      const idHash = this._id ? this._id.hashCode() : Math.floor(Math.random() * 70);
      return `https://i.pravatar.cc/150?img=${Math.abs(idHash) % 70}`;
    }
  },
  approved: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'Grant Manager'],
      message: 'Role must be one of: user, admin, or Grant Manager'
    },
    default: 'user'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Hash password before saving (only if modified)
userSchema.pre('save', async function(next) {
  // Only hash if password is modified (or new user)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords (for login)
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Generate a numeric hash from string (for deterministic avatar)
String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
};

module.exports = mongoose.model('User', userSchema);