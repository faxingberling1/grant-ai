const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role approved createdAt');
    console.log('📊 Current users in database:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Approved: ${user.approved}`);
    });
    
    res.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const checkAdmin = async (req, res) => {
  try {
    const adminUser = await User.findOne({ email: "admin@deleuxedesign.com" });
    
    if (!adminUser) {
      return res.json({
        success: false,
        message: 'Admin user not found'
      });
    }

    const testPassword = "AlexMurphy";
    const isPasswordCorrect = await adminUser.correctPassword(testPassword);
    
    res.json({
      success: true,
      adminUser: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        approved: adminUser.approved,
        createdAt: adminUser.createdAt,
        passwordHashExists: !!adminUser.password,
        passwordCorrect: isPasswordCorrect
      },
      testResults: {
        providedPassword: testPassword,
        isPasswordCorrect: isPasswordCorrect
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    const adminUser = await User.findOne({ email: "admin@deleuxedesign.com" });
    
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    adminUser.password = "AlexMurphy";
    await adminUser.save();

    const isPasswordCorrect = await adminUser.correctPassword("AlexMurphy");

    res.json({
      success: true,
      message: 'Admin password reset successfully',
      passwordWorks: isPasswordCorrect,
      admin: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        approved: adminUser.approved
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const emergencyAdminReset = async (req, res) => {
  try {
    await User.deleteOne({ email: "admin@deleuxedesign.com" });
    
    const adminUser = new User({
      name: "Alex Murphy",
      email: "admin@deleuxedesign.com",
      password: "AlexMurphy",
      role: "admin",
      avatar: "https://i.pravatar.cc/150?img=1",
      approved: true,
      emailVerified: true
    });
    
    await adminUser.save();
    
    console.log('🆘 EMERGENCY ADMIN RESET COMPLETE');
    
    res.json({
      success: true,
      message: 'Admin account reset successfully',
      credentials: {
        email: "admin@deleuxedesign.com",
        password: "AlexMurphy"
      }
    });
  } catch (error) {
    console.error('❌ Emergency reset error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const setupAdmin = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && !req.headers['x-admin-secret']) {
      return res.status(403).json({
        success: false,
        message: 'Admin setup not allowed in production without secret'
      });
    }

    const adminData = {
      name: "Alex Murphy",
      email: "admin@deleuxedesign.com",
      password: "AlexMurphy",
      role: "admin",
      avatar: "https://i.pravatar.cc/150?img=1",
      approved: true,
      emailVerified: true
    };

    let adminUser = await User.findOne({ email: adminData.email });
    
    if (adminUser) {
      adminUser.name = adminData.name;
      adminUser.role = adminData.role;
      adminUser.approved = adminData.approved;
      adminUser.avatar = adminData.avatar;
      adminUser.password = adminData.password;
      await adminUser.save();
      
      console.log(`✅ Admin account updated: ${adminData.email}`);
    } else {
      adminUser = new User(adminData);
      await adminUser.save();
      console.log(`✅ Admin account created: ${adminData.email}`);
    }

    res.json({
      success: true,
      message: 'Admin account setup successfully',
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('❌ Admin setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup admin account',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  checkAdmin,
  resetAdminPassword,
  emergencyAdminReset,
  setupAdmin
};