const AIService = require('../services/AIService');
const NotificationService = require('../services/notificationService');
const Client = require('../models/Client');
const Grant = require('../models/Grant');

const aiService = new AIService();
// FIX: Use NotificationService directly (it's an object with methods, not a class)
const notificationService = NotificationService;

const generateContent = async (req, res) => {
  try {
    const { prompt, context, tone = 'professional', length = 'medium', format = 'paragraph' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for content generation'
      });
    }
    
    let client = null;
    let grant = null;
    
    if (context?.clientId) {
      client = await Client.findOne({ 
        _id: context.clientId, 
        userId: req.user._id 
      });
    }
    
    if (context?.grantId) {
      grant = await Grant.findOne({
        _id: context.grantId,
        createdBy: req.user._id
      });
    }
    
    console.log(`🤖 Generating content with Gemini for user: ${req.user.email}`);
    
    const result = await aiService.generateContent(prompt, {
      client,
      grant,
      section: context?.section,
      ...context
    }, tone, length, format);
    
    const documentTitle = context?.documentTitle || 'Grant Document';
    
    // FIX: Check if notification service method exists before calling
    if (notificationService && notificationService.createAICompletionNotification) {
      await notificationService.createAICompletionNotification(req.user.id, documentTitle);
    } else {
      console.warn('⚠️ Notification service not available for AI completion notification');
    }
    
    console.log(`✅ Content generated successfully for user: ${req.user.email}`);
    
    res.json({
      success: true,
      content: result.content,
      usage: result.usage,
      metadata: {
        model: 'gemini-pro',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error generating content with Gemini:', error);
    const errorInfo = aiService.handleAIError(error);
    res.status(errorInfo.statusCode).json({
      success: false,
      message: errorInfo.userMessage,
      error: error.message,
      errorCode: errorInfo.errorCode
    });
  }
};

const improveContent = async (req, res) => {
  try {
    const { content, improvement_type = 'clarity', context } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for improvement'
      });
    }
    
    console.log(`🔧 Improving content with type: ${improvement_type} for user: ${req.user.email}`);
    
    const result = await aiService.improveContent(content, improvement_type, context);
    
    res.json({
      success: true,
      improved_content: result.improvedContent,
      improvement_type: improvement_type,
      usage: result.usage
    });
  } catch (error) {
    console.error('❌ Error improving content with Gemini:', error);
    const errorInfo = aiService.handleAIError(error);
    res.status(errorInfo.statusCode).json({
      success: false,
      message: errorInfo.userMessage,
      error: error.message,
      errorCode: errorInfo.errorCode
    });
  }
};

const analyzeContent = async (req, res) => {
  try {
    const { content, analysis_type = 'strength', context } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for analysis'
      });
    }
    
    console.log(`🔍 Analyzing content with type: ${analysis_type} for user: ${req.user.email}`);
    
    const result = await aiService.analyzeContent(content, analysis_type, context);
    
    res.json({
      success: true,
      analysis: result.analysis,
      analysis_type: analysis_type,
      usage: result.usage
    });
  } catch (error) {
    console.error('❌ Error analyzing content with Gemini:', error);
    const errorInfo = aiService.handleAIError(error);
    res.status(errorInfo.statusCode).json({
      success: false,
      message: errorInfo.userMessage,
      error: error.message,
      errorCode: errorInfo.errorCode
    });
  }
};

const getAITemplates = async (req, res) => {
  try {
    const { templateType } = req.params;
    
    const templateCategories = {
      needs_statement: [
        {
          id: '1',
          name: 'Community Needs Assessment',
          description: 'Template for describing community problems and needs',
          structure: ['Problem Statement', 'Data & Statistics', 'Impact Description', 'Urgency'],
          prompt: 'Write a compelling needs statement for a grant proposal focusing on community needs and gaps in services.'
        },
        {
          id: '2',
          name: 'Program Gap Analysis',
          description: 'Identify gaps in existing services and programs',
          structure: ['Current Services', 'Identified Gaps', 'Target Population', 'Proposed Solution'],
          prompt: 'Create a gap analysis showing the need for a new program or service.'
        }
      ],
      objectives: [
        {
          id: '1',
          name: 'SMART Objectives',
          description: 'Specific, Measurable, Achievable, Relevant, Time-bound objectives',
          structure: ['Specific', 'Measurable', 'Achievable', 'Relevant', 'Time-bound'],
          prompt: 'Develop SMART objectives for a grant proposal that are clear and achievable.'
        },
        {
          id: '2',
          name: 'Program Outcomes',
          description: 'Define expected program outcomes and impact',
          structure: ['Short-term Outcomes', 'Long-term Impact', 'Measurement Methods', 'Timeline'],
          prompt: 'Outline the expected outcomes and impact of the proposed program.'
        }
      ],
      methodology: [
        {
          id: '1',
          name: 'Program Implementation Plan',
          description: 'Detailed program activities and implementation steps',
          structure: ['Activities', 'Timeline', 'Staffing', 'Resources', 'Monitoring'],
          prompt: 'Describe the methodology and implementation plan for the proposed program.'
        },
        {
          id: '2',
          name: 'Project Timeline',
          description: 'Clear timeline for project activities and milestones',
          structure: ['Phase 1', 'Phase 2', 'Phase 3', 'Milestones', 'Deliverables'],
          prompt: 'Create a detailed project timeline with clear milestones and deliverables.'
        }
      ],
      evaluation: [
        {
          id: '1',
          name: 'Program Evaluation Plan',
          description: 'Comprehensive evaluation framework and methods',
          structure: ['Evaluation Questions', 'Data Collection', 'Analysis Methods', 'Reporting'],
          prompt: 'Develop an evaluation plan to measure program success and impact.'
        }
      ],
      budget: [
        {
          id: '1',
          name: 'Budget Narrative Template',
          description: 'Justify and explain budget items clearly',
          structure: ['Personnel Costs', 'Operating Expenses', 'Equipment', 'Indirect Costs'],
          prompt: 'Write a budget narrative that clearly justifies each expense in the proposal.'
        }
      ]
    };
    
    const templates = templateCategories[templateType] || [];
    
    res.json({
      success: true,
      templates: templates,
      category: templateType,
      count: templates.length
    });
  } catch (error) {
    console.error('❌ Error fetching AI templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

module.exports = {
  generateContent,
  improveContent,
  analyzeContent,
  getAITemplates
};