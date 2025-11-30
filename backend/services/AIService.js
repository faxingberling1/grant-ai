const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getEnvConfig } = require('../config/environment');

class AIService {
  constructor() {
    const config = getEnvConfig();
    
    try {
      if (config.GEMINI_API_KEY) {
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        console.log('✅ Google Gemini AI initialized successfully');
      } else {
        console.log('⚠️  GEMINI_API_KEY not found - AI features will be disabled');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Gemini:', error.message);
    }
  }

  buildGrantWritingPrompt(prompt, context, tone = 'professional', length = 'medium', format = 'paragraph') {
    const { client, grant, section } = context;
    const toneMap = {
      professional: "professional and formal",
      persuasive: "compelling and persuasive", 
      concise: "concise and direct",
      narrative: "storytelling and engaging"
    };
    const lengthMap = {
      short: "2-3 sentences",
      medium: "1-2 paragraphs", 
      long: "3-4 paragraphs"
    };
    const formatMap = {
      paragraph: "paragraph format",
      bullet: "bullet points",
      structured: "structured with headings"
    };
    
    let contextInfo = '';
    if (client) {
      contextInfo += `
  CLIENT INFORMATION:
  - Organization: ${client.organizationName || 'Not specified'}
  - Mission: ${client.missionStatement || 'Not specified'}
  - Focus Areas: ${client.focusAreas?.join(', ') || 'Not specified'}`;
    }
    if (grant) {
      contextInfo += `
  GRANT INFORMATION:
  - Grant Title: ${grant.title || 'Not specified'}
  - Funder: ${grant.funder || 'Not specified'}
  - Category: ${grant.category || 'Not specified'}`;
    }
    if (section) {
      contextInfo += `
  SECTION: ${section}`;
    }
    
    return `
  You are an expert grant writing assistant with extensive experience in nonprofit funding and proposal writing. Generate high-quality grant proposal content with the following specifications:
  ${contextInfo}
  WRITING REQUIREMENTS:
  - Tone: ${toneMap[tone] || 'professional'}
  - Length: ${lengthMap[length] || '1-2 paragraphs'}
  - Format: ${formatMap[format] || 'paragraph format'}
  - Quality: Compelling, well-researched, and persuasive
  SPECIFIC PROMPT: ${prompt}
  IMPORTANT GUIDELINES:
  - Focus on creating content that would be highly effective in securing grant funding
  - Use concrete examples and data where appropriate
  - Ensure alignment with the organization's mission and goals
  - Maintain a professional yet compelling tone
  - Structure the content for maximum impact and readability
  Please generate the requested grant writing content:
  `;
  }

  handleAIError(error) {
    console.error('🤖 AI Service Error:', error);
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
      return {
        userMessage: 'AI service configuration error. Please contact administrator.',
        errorCode: 'INVALID_API_KEY',
        statusCode: 503
      };
    } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return {
        userMessage: 'AI service quota exceeded. Please try again later.',
        errorCode: 'QUOTA_EXCEEDED',
        statusCode: 503
      };
    } else if (error.message.includes('safety') || error.message.includes('blocked')) {
      return {
        userMessage: 'Content was blocked for safety reasons. Please modify your prompt.',
        errorCode: 'SAFETY_BLOCKED',
        statusCode: 400
      };
    } else if (error.message.includes('timeout') || error.message.includes('network')) {
      return {
        userMessage: 'AI service timeout. Please try again.',
        errorCode: 'NETWORK_ERROR',
        statusCode: 503
      };
    } else {
      return {
        userMessage: 'Failed to process AI request. Please try again.',
        errorCode: 'AI_SERVICE_ERROR',
        statusCode: 500
      };
    }
  }

  async generateContent(prompt, context, tone, length, format) {
    if (!this.genAI || !this.model) {
      throw new Error('AI service is not configured');
    }

    const fullPrompt = this.buildGrantWritingPrompt(prompt, context, tone, length, format);
    console.log(`🤖 Generating content with Gemini`);
    
    const result = await this.model.generateContent(fullPrompt);
    const response = await result.response;
    const content = response.text();

    return {
      content,
      usage: {
        prompt_tokens: result.usageMetadata?.promptTokenCount || 0,
        completion_tokens: result.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: result.usageMetadata?.totalTokenCount || 0
      }
    };
  }

  async improveContent(content, improvementType, context) {
    if (!this.genAI || !this.model) {
      throw new Error('AI service is not configured');
    }

    const improvementPrompts = {
      clarity: `Improve the clarity and readability of this grant writing content while maintaining its professional tone. Focus on making it easier to understand:
  ${content}`,
      persuasiveness: `Make this grant proposal content more persuasive and compelling. Strengthen the arguments and make it more convincing to funders:
  ${content}`,
      conciseness: `Make this content more concise while preserving all key information and impact. Remove redundancy and tighten the language:
  ${content}`,
      professionalism: `Enhance the professional tone and formality of this grant writing content. Ensure it meets high standards of grant writing:
  ${content}`,
      impact: `Increase the impact and emotional appeal of this content while maintaining professionalism. Make the outcomes more compelling:
  ${content}`
    };

    const prompt = improvementPrompts[improvementType] || improvementPrompts.clarity;
    let fullPrompt = prompt;
    
    if (context?.clientId) {
      fullPrompt += `
  Context: Client - ${context.clientName}`;
    }

    console.log(`🔧 Improving content with type: ${improvementType}`);
    const result = await this.model.generateContent(fullPrompt);
    const response = await result.response;
    const improvedContent = response.text();

    return {
      improvedContent,
      usage: {
        prompt_tokens: result.usageMetadata?.promptTokenCount || 0,
        completion_tokens: result.usageMetadata?.candidatesTokenCount || 0
      }
    };
  }

  async analyzeContent(content, analysisType, context) {
    if (!this.genAI || !this.model) {
      throw new Error('AI service is not configured');
    }

    const analysisPrompts = {
      strength: `Analyze the strengths of this grant writing content and provide specific, actionable feedback. Focus on what works well:
  ${content}`,
      weakness: `Identify weaknesses or areas for improvement in this grant writing content. Be constructive and specific:
  ${content}`,
      compliance: `Check if this grant content complies with standard grant writing guidelines and requirements. Identify any compliance issues:
  ${content}`,
      completeness: `Analyze if this grant section is complete and covers all necessary elements. Identify any missing components:
  ${content}`,
      scoring: `Provide a score out of 10 for this grant content and detailed feedback on how to improve. Consider clarity, persuasiveness, and structure:
  ${content}`
    };

    const prompt = analysisPrompts[analysisType] || analysisPrompts.strength;
    const fullPrompt = `${prompt}
  Provide your analysis in a structured, actionable format with specific recommendations.`;

    console.log(`🔍 Analyzing content with type: ${analysisType}`);
    const result = await this.model.generateContent(fullPrompt);
    const response = await result.response;
    const analysis = response.text();

    return {
      analysis,
      usage: {
        prompt_tokens: result.usageMetadata?.promptTokenCount || 0,
        completion_tokens: result.usageMetadata?.candidatesTokenCount || 0
      }
    };
  }
}

module.exports = AIService;