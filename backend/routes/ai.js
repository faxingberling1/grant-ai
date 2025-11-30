const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authMiddleware } = require('../middleware/auth');

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// Health check endpoint
router.get('/health', authMiddleware, async (req, res) => {
  try {
    // Test the Gemini connection with a simple prompt
    const result = await model.generateContent('Hello');
    await result.response;
    res.json({ 
      status: 'connected', 
      message: 'Gemini API is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini health check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to connect to Gemini API',
      error: error.message 
    });
  }
});

// Generate content endpoint
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { prompt, context, tone, length, format } = req.body;
    
    // Construct a detailed prompt for grant writing
    const fullPrompt = buildGrantWritingPrompt(prompt, context, tone, length, format);
    
    console.log('🤖 Gemini AI Request:', {
      promptLength: prompt?.length,
      section: context?.section,
      tone,
      length,
      format
    });
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const content = response.text();
    
    console.log('✅ Gemini AI Response:', {
      contentLength: content?.length,
      section: context?.section
    });
    
    res.json({ 
      success: true, 
      content: content,
      usage: {
        prompt_tokens: result.usageMetadata?.promptTokenCount || 0,
        completion_tokens: result.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: result.usageMetadata?.totalTokenCount || 0
      },
      model: 'gemini-pro',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate content',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Improve content endpoint
router.post('/improve', authMiddleware, async (req, res) => {
  try {
    const { content, improvement_type, context } = req.body;
    
    const improvementPrompts = {
      clarity: `Improve the clarity of this grant writing content while maintaining its professional tone. Make it easier to understand without losing important information:\n\n${content}`,
      persuasiveness: `Make this grant proposal content more persuasive and compelling. Strengthen the arguments and make it more convincing to funders:\n\n${content}`,
      professionalism: `Enhance the professional tone and formality of this grant writing content. Make it more suitable for a formal grant application:\n\n${content}`,
      completeness: `Expand this content to make it more comprehensive. Add missing details and ensure it covers all necessary aspects for a grant proposal:\n\n${content}`,
      alignment: `Improve the alignment of this content with grant requirements. Ensure it directly addresses typical grant reviewer criteria:\n\n${content}`
    };
    
    const prompt = improvementPrompts[improvement_type] || improvementPrompts.clarity;
    
    // Build context information
    const contextInfo = buildContextInfo(context);
    const fullPrompt = `${prompt}\n\n${contextInfo}`;
    
    console.log('🔧 Gemini AI Improvement Request:', {
      improvementType: improvement_type,
      contentLength: content?.length,
      context: context?.clientInfo?.name
    });
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const improvedContent = response.text();
    
    console.log('✅ Gemini AI Improvement Response:', {
      improvedContentLength: improvedContent?.length
    });
    
    res.json({ 
      success: true, 
      improved_content: improvedContent,
      improvement_type: improvement_type,
      model: 'gemini-pro',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error improving content with Gemini:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to improve content',
      message: error.message 
    });
  }
});

// Analyze content endpoint
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { content, analysis_type, context } = req.body;
    
    const analysisPrompts = {
      strength: `Analyze the strengths of this grant writing content and provide specific feedback. Identify what works well and why:\n\n${content}`,
      alignment: `Analyze how well this content aligns with standard grant requirements. Check for compliance with grant writing best practices:\n\n${content}`,
      impact: `Assess the impact and persuasiveness of this content. How effective would it be in convincing grant reviewers:\n\n${content}`,
      readability: `Analyze the readability and clarity of this content. Provide suggestions for improving understanding and flow:\n\n${content}`
    };
    
    const prompt = analysisPrompts[analysis_type] || analysisPrompts.strength;
    
    // Build context information
    const contextInfo = buildContextInfo(context);
    const fullPrompt = `${prompt}\n\n${contextInfo}\n\nProvide your analysis in a structured format with specific recommendations.`;
    
    console.log('📊 Gemini AI Analysis Request:', {
      analysisType: analysis_type,
      contentLength: content?.length
    });
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const analysis = response.text();
    
    console.log('✅ Gemini AI Analysis Response:', {
      analysisLength: analysis?.length
    });
    
    res.json({ 
      success: true, 
      analysis: analysis,
      analysis_type: analysis_type,
      model: 'gemini-pro',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing content with Gemini:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze content',
      message: error.message 
    });
  }
});

// Get AI templates endpoint
router.get('/templates/:templateType', authMiddleware, async (req, res) => {
  try {
    const { templateType } = req.params;
    
    const templates = {
      needs_statement: [
        {
          id: '1',
          name: 'Community Needs Assessment',
          description: 'Template for describing community problems and needs',
          structure: ['Problem Statement', 'Data & Statistics', 'Impact Description', 'Urgency'],
          prompt: 'Write a compelling needs statement for a grant proposal focusing on community needs and gaps in services.',
          example: 'The community faces significant challenges in [area]. Recent data shows [statistics]. This requires immediate intervention to address [specific needs].'
        },
        {
          id: '2',
          name: 'Program Gap Analysis',
          description: 'Identify gaps in existing services and programs',
          structure: ['Current Services', 'Identified Gaps', 'Target Population', 'Proposed Solution'],
          prompt: 'Create a gap analysis showing the need for a new program or service.',
          example: 'While current services address [existing services], there remains a critical gap in [specific area] affecting [target population].'
        }
      ],
      objectives: [
        {
          id: '1',
          name: 'SMART Objectives',
          description: 'Specific, Measurable, Achievable, Relevant, Time-bound objectives',
          structure: ['Specific', 'Measurable', 'Achievable', 'Relevant', 'Time-bound'],
          prompt: 'Develop SMART objectives for a grant proposal that are clear and achievable.',
          example: 'Increase program participation by 40% within 12 months, serving 500+ beneficiaries with measurable outcomes.'
        },
        {
          id: '2',
          name: 'Program Outcomes',
          description: 'Define expected program outcomes and impact',
          structure: ['Short-term Outcomes', 'Long-term Impact', 'Measurement Methods', 'Timeline'],
          prompt: 'Outline the expected outcomes and impact of the proposed program.',
          example: 'Short-term: Improved skills in 80% of participants. Long-term: Sustainable community impact through capacity building.'
        }
      ],
      methodology: [
        {
          id: '1',
          name: 'Program Implementation Plan',
          description: 'Detailed program activities and implementation steps',
          structure: ['Activities', 'Timeline', 'Staffing', 'Resources', 'Monitoring'],
          prompt: 'Describe the methodology and implementation plan for the proposed program.',
          example: 'Phase 1: Community assessment (Months 1-2). Phase 2: Program implementation (Months 3-9). Phase 3: Evaluation and reporting (Months 10-12).'
        }
      ],
      evaluation: [
        {
          id: '1',
          name: 'Program Evaluation Plan',
          description: 'Comprehensive evaluation framework and methods',
          structure: ['Evaluation Questions', 'Data Collection', 'Analysis Methods', 'Reporting'],
          prompt: 'Develop an evaluation plan to measure program success and impact.',
          example: 'Mixed-methods evaluation including pre/post surveys, focus groups, and outcome tracking to measure program effectiveness.'
        }
      ],
      budget: [
        {
          id: '1',
          name: 'Budget Narrative Template',
          description: 'Justify and explain budget items clearly',
          structure: ['Personnel Costs', 'Operating Expenses', 'Equipment', 'Indirect Costs'],
          prompt: 'Write a budget narrative that clearly justifies each expense in the proposal.',
          example: 'Personnel costs include program coordinator and support staff to ensure effective program implementation and monitoring.'
        }
      ]
    };

    const templateList = templates[templateType] || [];
    
    res.json({
      success: true,
      templates: templateList,
      count: templateList.length,
      template_type: templateType,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
      message: error.message
    });
  }
});

// Helper function to build grant writing prompts
function buildGrantWritingPrompt(prompt, context, tone = 'professional', length = 'medium', format = 'paragraph') {
  const { clientInfo, grantInfo, section, sectionLabel } = context;
  
  const toneMap = {
    professional: "professional, formal, and authoritative",
    persuasive: "compelling, persuasive, and convincing",
    compassionate: "empathetic, compassionate, and understanding", 
    data_driven: "data-focused, evidence-based, and analytical",
    storytelling: "narrative, engaging, and story-driven"
  };
  
  const lengthMap = {
    short: "2-3 concise paragraphs",
    medium: "4-6 well-developed paragraphs", 
    long: "7-10 comprehensive paragraphs",
    extensive: "detailed and thorough coverage"
  };
  
  const formatMap = {
    paragraph: "paragraph format with smooth transitions",
    bullet_points: "bullet points with clear structure",
    structured: "structured sections with headings"
  };

  return `
You are an expert grant writing assistant with extensive experience in securing funding for non-profit organizations. Generate high-quality grant proposal content with the following specifications:

CLIENT ORGANIZATION CONTEXT:
- Organization Name: ${clientInfo?.name || 'Not specified'}
- Mission: ${clientInfo?.mission || 'Not specified'}
- Focus Areas: ${clientInfo?.focusAreas?.join(', ') || 'Not specified'}
- Category: ${clientInfo?.category || 'Not specified'}

GRANT PROPOSAL CONTEXT:
- Grant Section: ${sectionLabel || section || 'General Content'}
- Grant Information: ${grantInfo?.title ? `Applying for: ${grantInfo.title}` : 'General grant application'}

CONTENT REQUIREMENTS:
- Tone: ${toneMap[tone] || 'professional and formal'}
- Length: ${lengthMap[length] || '4-6 well-developed paragraphs'}
- Format: ${formatMap[format] || 'paragraph format with smooth transitions'}
- Audience: Grant reviewers and funding organization staff

SPECIFIC CONTENT REQUEST:
${prompt}

CRITICAL INSTRUCTIONS:
1. Create compelling, evidence-based content that would persuade grant reviewers
2. Align the content with the client organization's mission and focus areas
3. Use appropriate grant writing terminology and professional language
4. Ensure logical flow and clear organization of ideas
5. Include concrete examples and specific details where appropriate
6. Focus on impact, outcomes, and measurable results
7. Maintain the specified tone and length requirements

Generate the grant proposal content now:
`;
}

// Helper function to build context information
function buildContextInfo(context) {
  const { clientInfo, grantInfo, section } = context || {};
  
  let contextText = 'CONTEXT INFORMATION:\n';
  
  if (clientInfo) {
    contextText += `- Client: ${clientInfo.name || 'Unknown'}\n`;
    contextText += `- Mission: ${clientInfo.mission || 'Not specified'}\n`;
    if (clientInfo.focusAreas?.length > 0) {
      contextText += `- Focus Areas: ${clientInfo.focusAreas.join(', ')}\n`;
    }
  }
  
  if (grantInfo) {
    contextText += `- Grant: ${grantInfo.title || 'Unknown'}\n`;
  }
  
  if (section) {
    contextText += `- Section: ${section}\n`;
  }
  
  return contextText;
}

module.exports = router;