const AuthService = require('../services/AuthService');

const authService = new AuthService();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 Login attempt for: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required',
        errorCode: 'MISSING_CREDENTIALS'
      });
    }

    const result = await authService.login(email, password);
    
    console.log(`✅ Login successful: ${email} (${result.user.role})`);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(401).json({ 
      success: false,
      message: error.message,
      errorCode: error.message.includes('approved') ? 'ACCOUNT_PENDING_APPROVAL' : 'AUTH_ERROR'
    });
  }
};

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    
    res.status(201).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      error: error.message 
    });
  }
};

const getMe = async (req, res) => {
  res.json({ 
    success: true, 
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar
    }
  });
};

const sendVerificationEmail = async (req, res) => {
  try {
    const result = await authService.sendVerificationEmail(req.user);
    
    res.json({
      success: true,
      message: 'Verification email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Send verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: error.message
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    
    const result = await authService.verifyEmail(token);
    
    res.json({
      success: true,
      message: 'Email verified successfully',
      ...result
    });
  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const result = await authService.forgotPassword(email);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }
    
    const result = await authService.resetPassword(token, password);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
};

module.exports = {
  login,
  register,
  getMe,
  sendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword
};