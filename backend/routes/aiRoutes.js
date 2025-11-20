const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Test the Gemini connection with a simple prompt
    const result = await model.generateContent('Hello');
    await result.response;
    res.json({ status: 'connected', message: 'Gemini API is working' });
  } catch (error) {
    console.error('Gemini health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to Gemini API' });
  }
});

// Generate content endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt, context, tone, length, format } = req.body;
    
    // Construct a detailed prompt for grant writing
    const fullPrompt = buildGrantWritingPrompt(prompt, context, tone, length, format);
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const content = response.text();
    
    res.json({ 
      success: true, 
      content: content,
      usage: {
        prompt_tokens: result.usageMetadata?.promptTokenCount || 0,
        completion_tokens: result.usageMetadata?.candidatesTokenCount || 0
      }
    });
    
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate content',
      message: error.message 
    });
  }
});

// Improve content endpoint
router.post('/improve', async (req, res) => {
  try {
    const { content, improvement_type, context } = req.body;
    
    const improvementPrompts = {
      clarity: `Improve the clarity of this grant writing content while maintaining its professional tone: ${content}`,
      persuasiveness: `Make this grant proposal content more persuasive and compelling: ${content}`,
      conciseness: `Make this content more concise while preserving all key information: ${content}`,
      professionalism: `Enhance the professional tone and formality of this grant writing content: ${content}`
    };
    
    const prompt = improvementPrompts[improvement_type] || improvementPrompts.clarity;
    const fullPrompt = `${prompt}\n\nContext: Client - ${context.client?.name}, Grant - ${context.grant?.title}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const improvedContent = response.text();
    
    res.json({ 
      success: true, 
      improved_content: improvedContent 
    });
    
  } catch (error) {
    console.error('Error improving content with Gemini:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to improve content' 
    });
  }
});

// Analyze content endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { content, analysis_type, context } = req.body;
    
    const analysisPrompts = {
      strength: `Analyze the strengths of this grant writing content and provide specific feedback: ${content}`,
      weakness: `Identify weaknesses or areas for improvement in this grant writing content: ${content}`,
      compliance: `Check if this grant content complies with standard grant writing guidelines and requirements: ${content}`,
      completeness: `Analyze if this grant section is complete and covers all necessary elements: ${content}`
    };
    
    const prompt = analysisPrompts[analysis_type] || analysisPrompts.strength;
    const fullPrompt = `${prompt}\n\nProvide your analysis in a structured format with specific recommendations.`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const analysis = response.text();
    
    res.json({ 
      success: true, 
      analysis: analysis 
    });
    
  } catch (error) {
    console.error('Error analyzing content with Gemini:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze content' 
    });
  }
});

// Helper function to build grant writing prompts
function buildGrantWritingPrompt(prompt, context, tone = 'professional', length = 'medium', format = 'paragraph') {
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
  
  return `
You are an expert grant writing assistant. Generate content for a grant proposal with the following specifications:

CLIENT INFORMATION:
- Organization: ${client?.name || 'Not specified'}
- Mission: ${client?.mission || 'Not specified'}
- Focus Areas: ${client?.focusAreas?.join(', ') || 'Not specified'}

GRANT INFORMATION:
- Grant Title: ${grant?.title || 'Not specified'}
- Section: ${section || 'General'}

WRITING REQUIREMENTS:
- Tone: ${toneMap[tone] || 'professional'}
- Length: ${lengthMap[length] || '1-2 paragraphs'}
- Format: ${format}

SPECIFIC PROMPT: ${prompt}

Please generate high-quality grant writing content that aligns with the client's mission and the grant requirements. Focus on creating compelling, well-structured content that would be effective in a grant proposal.
`;
}

module.exports = router;