const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const User = require('../models/User');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

// GET /api/templates - Get all templates (system + user templates)
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    console.log('📥 GET /api/templates - Fetching templates');
    
    const { category, search } = req.query;
    
    let query = { isActive: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search in title, description, or subject
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build the main query: system templates OR user's templates
    let finalQuery = {
      $or: [
        { isSystemTemplate: true } // System templates available to all
      ]
    };
    
    // Add user-specific templates if user is authenticated
    if (req.user) {
      finalQuery.$or.push({
        isSystemTemplate: false,
        createdBy: req.user.id
      });
      console.log(`🔐 Fetching templates for user: ${req.user.email}`);
    } else {
      // For unauthenticated users, only show system templates
      finalQuery = { isSystemTemplate: true, ...query };
      console.log('👤 Fetching system templates for unauthenticated user');
    }
    
    // Add additional filters to the final query
    if (Object.keys(query).length > 1) {
      finalQuery = { ...finalQuery, ...query };
    }
    
    const templates = await Template.find(finalQuery).sort({ 
      isSystemTemplate: -1, // System templates first
      createdAt: -1 
    });
    
    const systemTemplatesCount = templates.filter(t => t.isSystemTemplate).length;
    const userTemplatesCount = templates.filter(t => !t.isSystemTemplate).length;
    
    console.log(`✅ Found ${templates.length} templates (${systemTemplatesCount} system, ${userTemplatesCount} user)`);
    
    res.json({
      success: true,
      count: templates.length,
      data: templates,
      user: req.user || null
    });
    
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
});

// GET /api/templates/:id - Get template by ID (optional auth)
router.get('/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    console.log(`📥 GET /api/templates/${req.params.id}`);
    
    let query = { _id: req.params.id, isActive: true };
    
    // If user is authenticated, show their templates OR system templates
    if (req.user) {
      query = {
        _id: req.params.id,
        isActive: true,
        $or: [
          { createdBy: req.user.id },
          { isSystemTemplate: true }
        ]
      };
    } else {
      // For unauthenticated users, only show system templates
      query.isSystemTemplate = true;
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
      user: req.user || null
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
});

// POST /api/templates - Create new template (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('📥 POST /api/templates - Creating template');
    
    const {
      title,
      subject,
      category,
      description,
      content,
      variables,
      icon,
      isSystemTemplate // Only allow admins to create system templates
    } = req.body;
    
    // Basic validation
    if (!title || !subject || !category || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, category, and content are required'
      });
    }
    
    // Regular users cannot create system templates
    if (isSystemTemplate && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create system templates'
      });
    }
    
    // Check if template with same title already exists for this user
    const existingTemplate = await Template.findOne({ 
      title: title.trim(),
      isActive: true,
      $or: [
        { createdBy: req.user.id },
        { isSystemTemplate: true } // Also check system templates
      ]
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
      isSystemTemplate: isSystemTemplate || false,
      createdBy: req.user.id
    };
    
    const template = new Template(templateData);
    const savedTemplate = await template.save();
    
    console.log(`✅ Template created: ${savedTemplate.title} (${savedTemplate.isSystemTemplate ? 'System' : 'User'} template)`);
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: savedTemplate,
      user: req.user
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
});

// PUT /api/templates/:id - Update template (requires auth)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`📥 PUT /api/templates/${req.params.id}`);
    
    const {
      title,
      subject,
      category,
      description,
      content,
      variables,
      icon,
      isSystemTemplate
    } = req.body;
    
    // Check if template exists and user has permission
    const existingTemplate = await Template.findOne({
      _id: req.params.id,
      isActive: true,
      $or: [
        { createdBy: req.user.id }, // User's own templates
        { isSystemTemplate: true, createdBy: req.user.id } // User's system templates (if any)
      ]
    });
    
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or you do not have permission to edit this template'
      });
    }
    
    // Regular users cannot convert to system templates
    if (isSystemTemplate && !req.user.isAdmin && !existingTemplate.isSystemTemplate) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create system templates'
      });
    }
    
    // Check for duplicate title (excluding current template)
    if (title && title !== existingTemplate.title) {
      const duplicateTemplate = await Template.findOne({
        title: title.trim(),
        isActive: true,
        $or: [
          { createdBy: req.user.id },
          { isSystemTemplate: true }
        ],
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
    
    // Only allow admins to change system template status
    if (isSystemTemplate !== undefined && req.user.isAdmin) {
      updateData.isSystemTemplate = isSystemTemplate;
    }
    
    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    console.log(`✅ Template updated: ${updatedTemplate.title}`);
    
    res.json({
      success: true,
      message: 'Template updated successfully',
      data: updatedTemplate,
      user: req.user
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
});

// DELETE /api/templates/:id - Soft delete template (requires auth)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`📥 DELETE /api/templates/${req.params.id}`);
    
    const template = await Template.findOne({
      _id: req.params.id,
      isActive: true,
      createdBy: req.user.id, // Users can only delete their own templates
      isSystemTemplate: false // Cannot delete system templates
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or you do not have permission to delete this template'
      });
    }
    
    // Soft delete by setting isActive to false
    await Template.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    console.log(`✅ Template deleted: ${template.title}`);
    
    res.json({
      success: true,
      message: 'Template deleted successfully',
      user: req.user
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
});

// PATCH /api/templates/:id/usage - Increment usage count (optional auth)
router.patch('/:id/usage', optionalAuthMiddleware, async (req, res) => {
  try {
    console.log(`📥 PATCH /api/templates/${req.params.id}/usage`);
    
    let query = { 
      _id: req.params.id,
      isActive: true 
    };
    
    // If user is authenticated, allow usage of their templates OR system templates
    if (req.user) {
      query = {
        _id: req.params.id,
        isActive: true,
        $or: [
          { createdBy: req.user.id },
          { isSystemTemplate: true }
        ]
      };
    } else {
      // For unauthenticated users, only allow usage of system templates
      query.isSystemTemplate = true;
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
      user: req.user || null
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
});

// ADMIN: Create system templates for all users
router.post('/admin/create-system-templates', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create system templates'
      });
    }
    
    console.log('🌱 Creating system templates for all users...');
    
    const systemTemplates = [
      {
        title: "Grant Proposal Follow-up",
        subject: "Follow-up on our grant proposal submission",
        category: "followup",
        description: "Professional follow-up email for submitted grant proposals",
        content: `Dear [Client Name],

I hope this email finds you well. I wanted to follow up on the grant proposal we submitted to [Grant Name] on [Date].

The proposal requested funding of [Amount] for your [Project Name] initiative, focusing on [Field/Area]. 

I will continue to monitor the status and will notify you immediately if we receive any updates from the funder. In the meantime, please don't hesitate to reach out if you have any questions or additional information to share.

Best regards,
[Your Name]
Grant Writing Specialist`,
        variables: ['[Client Name]', '[Grant Name]', '[Date]', '[Amount]', '[Project Name]', '[Field/Area]', '[Your Name]'],
        icon: 'fas fa-sync',
        isSystemTemplate: true
      },
      {
        title: "Meeting Request Template",
        subject: "Meeting to discuss grant opportunities",
        category: "meeting",
        description: "Professional email template for scheduling grant-related meetings",
        content: `Dear [Client Name],

I hope you're having a productive week. I'm writing to schedule a meeting to discuss potential grant opportunities for your organization.

Based on your work in [Field/Area], I've identified several funding sources that align well with your mission and could provide significant support for your programs.

Would you be available for a 30-minute call sometime next week? I'm available on [Available Times]. Please let me know what works best for your schedule.

Looking forward to connecting and exploring how we can secure funding to advance your important work.

Best regards,
[Your Name]
Grant Consultant`,
        variables: ['[Client Name]', '[Field/Area]', '[Available Times]', '[Your Name]'],
        icon: 'fas fa-calendar',
        isSystemTemplate: true
      },
      {
        title: "Thank You Note Template",
        subject: "Thank you for your partnership",
        category: "thankyou",
        description: "Warm thank you email for clients and partners",
        content: `Dear [Client Name],

I wanted to take a moment to express my sincere gratitude for the opportunity to work with you on your grant application for [Grant Name].

Your dedication to [Field/Area] and the thoughtful way you've developed your [Project Name] initiative is truly inspiring. It's been a pleasure collaborating with you to craft a compelling proposal that I believe has excellent potential for funding.

Thank you for your partnership and trust in our services. I look forward to continuing to support your important work.

With appreciation,
[Your Name]`,
        variables: ['[Client Name]', '[Grant Name]', '[Field/Area]', '[Project Name]', '[Your Name]'],
        icon: 'fas fa-heart',
        isSystemTemplate: true
      },
      {
        title: "Grant Application Reminder",
        subject: "Upcoming grant deadline reminder",
        category: "reminder",
        description: "Reminder email for approaching grant deadlines",
        content: `Dear [Client Name],

This is a friendly reminder about the upcoming deadline for the [Grant Name] grant application. The submission deadline is [Deadline].

We currently have the following materials prepared:
- [List of prepared documents]

The following items still need attention:
- [List of pending items]

Please review the attached materials and let me know if you have any questions or need to provide additional information. I recommend we finalize everything by [Review Date] to ensure we have time for any last-minute adjustments.

Looking forward to completing this strong application together.

Best regards,
[Your Name]`,
        variables: ['[Client Name]', '[Grant Name]', '[Deadline]', '[Review Date]', '[Your Name]'],
        icon: 'fas fa-bell',
        isSystemTemplate: true
      },
      {
        title: "Initial Grant Proposal",
        subject: "Grant proposal for [Project Name]",
        category: "proposal",
        description: "Comprehensive grant proposal template",
        content: `Dear [Grant Review Committee],

I am writing to submit a proposal on behalf of [Organization Name] for your [Grant Name] funding opportunity. Our project, "[Project Name]," aligns perfectly with your mission to support [Field/Area] and addresses a critical need in our community.

**Project Overview**
[Project Name] aims to [brief project description]. This initiative will serve [target population] and achieve [expected outcomes].

**Key Objectives**
1. [Objective 1]
2. [Objective 2] 
3. [Objective 3]

**Budget Request**
We are requesting [Amount] to support [brief budget breakdown].

**Organization Background**
[Organization Name] has been serving the community since [year] with a proven track record in [relevant experience].

We are confident that [Project Name] will deliver significant impact and look forward to the possibility of partnering with you.

Sincerely,
[Your Name]
[Title]
[Organization Name]`,
        variables: ['[Grant Review Committee]', '[Organization Name]', '[Grant Name]', '[Project Name]', '[Field/Area]', '[Amount]', '[Your Name]', '[Title]'],
        icon: 'fas fa-handshake',
        isSystemTemplate: true
      }
    ];

    // Remove existing system templates to avoid duplicates
    await Template.deleteMany({ isSystemTemplate: true });
    console.log('✅ Cleared existing system templates');
    
    // Create new system templates
    const createdTemplates = await Template.insertMany(systemTemplates);
    console.log(`✅ Created ${createdTemplates.length} system templates`);
    
    res.json({
      success: true,
      message: `Created ${createdTemplates.length} system templates available to all users`,
      data: createdTemplates
    });
    
  } catch (error) {
    console.error('❌ Error creating system templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating system templates',
      error: error.message
    });
  }
});

// Debug route to check template status
router.get('/debug/status', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking template status');
    
    // Check total templates in database
    const totalTemplates = await Template.countDocuments({ isActive: true });
    const systemTemplates = await Template.countDocuments({ isActive: true, isSystemTemplate: true });
    const userTemplates = await Template.countDocuments({ isActive: true, isSystemTemplate: false });
    
    // Check templates for current user if authenticated
    let userSpecificTemplates = 0;
    if (req.user) {
      userSpecificTemplates = await Template.countDocuments({ 
        createdBy: req.user.id, 
        isActive: true,
        isSystemTemplate: false
      });
    }
    
    res.json({
      success: true,
      debug: {
        totalTemplates,
        systemTemplates,
        userTemplates,
        userSpecificTemplates,
        currentUser: req.user ? {
          id: req.user.id,
          email: req.user.email,
          isAdmin: req.user.isAdmin
        } : null
      }
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;