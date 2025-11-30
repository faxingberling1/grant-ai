// backend/utils/ai.js

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

function handleAIError(error) {
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

module.exports = { buildGrantWritingPrompt, handleAIError };