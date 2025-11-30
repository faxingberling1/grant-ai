const Template = require('../models/Template');
const User = require('../models/User');

const getTemplates = async (req, res) => {
  try {
    console.log('🔍 GET /api/templates - Processing request');
    const { category, search } = req.query;
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (req.user) {
      query.createdBy = req.user._id;
      console.log(`🔐 Fetching templates for authenticated user: ${req.user.email}`);
    } else {
      const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
      if (demoUser) {
        query.createdBy = demoUser._id;
        console.log('👤 Fetching demo templates for unauthenticated user');
      } else {
        console.log('❌ No demo user found, returning empty array');
        return res.json({
          success: true,
          count: 0,
          data: [],
          user: null
        });
      }
    }
    
    const templates = await Template.find(query).sort({ createdAt: -1 });
    console.log(`✅ Found ${templates.length} templates`);
    
    res.json({
      success: true,
      count: templates.length,
      data: templates,
      user: req.user ? {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      } : null
    });
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
};

const getTemplateById = async (req, res) => {
  try {
    console.log(`🔍 GET /api/templates/${req.params.id}`);
    let query = { _id: req.params.id, isActive: true };
    
    if (req.user) {
      query.createdBy = req.user._id;
    } else {
      const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
      if (demoUser) {
        query.createdBy = demoUser._id;
      }
    }
    
    const template = await Template.findOne(query);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      data: template,
      user: req.user ? {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      } : null
    });
  } catch (error) {
    console.error('❌ Error fetching template:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message
    });
  }
};

const createTemplate = async (req, res) => {
  try {
    console.log('🔍 POST /api/templates - Creating template');
    const {
      title,
      subject,
      category,
      description,
      content,
      variables,
      icon
    } = req.body;
    
    if (!title || !subject || !category || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, category, and content are required'
      });
    }
    
    const existingTemplate = await Template.findOne({ 
      title: title.trim(),
      isActive: true,
      createdBy: req.user._id
    });
    
    if (existingTemplate) {
      return res.status(409).json({
        success: false,
        message: 'A template with this title already exists'
      });
    }
    
    const templateData = {
      title: title.trim(),
      subject: subject.trim(),
      category,
      description: description?.trim() || '',
      content: content.trim(),
      variables: variables || [],
      icon: icon || 'fas fa-envelope',
      createdBy: req.user._id
    };
    
    const template = new Template(templateData);
    const savedTemplate = await template.save();
    console.log(`✅ Template created: ${savedTemplate.title}`);
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: savedTemplate,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('❌ Error creating template:', error);
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
      message: 'Error creating template',
      error: error.message
    });
  }
};

const updateTemplate = async (req, res) => {
  try {
    console.log(`🔍 PUT /api/templates/${req.params.id}`);
    const {
      title,
      subject,
      category,
      description,
      content,
      variables,
      icon
    } = req.body;
    
    const existingTemplate = await Template.findOne({
      _id: req.params.id,
      isActive: true,
      createdBy: req.user._id
    });
    
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    if (title && title !== existingTemplate.title) {
      const duplicateTemplate = await Template.findOne({
        title: title.trim(),
        isActive: true,
        createdBy: req.user._id,
        _id: { $ne: req.params.id }
      });
      
      if (duplicateTemplate) {
        return res.status(409).json({
          success: false,
          message: 'A template with this title already exists'
        });
      }
    }
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (subject) updateData.subject = subject.trim();
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description.trim();
    if (content) updateData.content = content.trim();
    if (variables) updateData.variables = variables;
    if (icon) updateData.icon = icon;
    
    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log(`✅ Template updated: ${updatedTemplate.title}`);
    res.json({
      success: true,
      message: 'Template updated successfully',
      data: updatedTemplate,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('❌ Error updating template:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    console.log(`🔍 DELETE /api/templates/${req.params.id}`);
    const template = await Template.findOne({
      _id: req.params.id,
      isActive: true,
      createdBy: req.user._id
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    await Template.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    console.log(`✅ Template deleted: ${template.title}`);
    res.json({
      success: true,
      message: 'Template deleted successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('❌ Error deleting template:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
};

const incrementUsage = async (req, res) => {
  try {
    console.log(`🔍 PATCH /api/templates/${req.params.id}/usage`);
    let query = { 
      _id: req.params.id,
      isActive: true 
    };
    
    if (req.user) {
      query.createdBy = req.user._id;
    } else {
      const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
      if (demoUser) {
        query.createdBy = demoUser._id;
      }
    }
    
    const template = await Template.findOne(query);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    const updatedTemplate = await Template.incrementUsage(req.params.id);
    console.log(`✅ Usage incremented for: ${updatedTemplate.title}`);
    
    res.json({
      success: true,
      message: 'Usage count updated',
      data: updatedTemplate,
      user: req.user ? {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      } : null
    });
  } catch (error) {
    console.error('❌ Error incrementing usage:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating usage count',
      error: error.message
    });
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementUsage
};