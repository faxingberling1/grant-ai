const Joi = require('joi');

const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const clientSchema = Joi.object({
  organizationName: Joi.string().min(2).max(100).required(),
  primaryContactName: Joi.string().min(2).max(50).required(),
  titleRole: Joi.string().max(50).optional(),
  emailAddress: Joi.string().email().required(),
  phoneNumbers: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive', 'prospect').default('active'),
  tags: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().max(1000).optional()
});

const templateSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  subject: Joi.string().min(2).max(200).required(),
  category: Joi.string().valid('proposal', 'followup', 'meeting', 'thankyou', 'reminder').required(),
  description: Joi.string().max(500).optional().allow(''),
  content: Joi.string().min(1).required(),
  variables: Joi.array().items(Joi.string()).optional(),
  icon: Joi.string().optional()
});

const grantSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  funder: Joi.string().min(2).max(100).required(),
  category: Joi.string().valid(
    'education', 'environment', 'healthcare', 'arts', 
    'community', 'technology', 'research', 'youth'
  ).required(),
  deadline: Joi.date().required(),
  maxAward: Joi.number().min(0).required(),
  focusAreas: Joi.array().items(Joi.string()).optional(),
  eligibility: Joi.string().min(10).required(),
  description: Joi.string().optional().allow(''),
  url: Joi.string().uri().optional().allow('')
});

const aiGenerateSchema = Joi.object({
  prompt: Joi.string().min(5).required(),
  context: Joi.object({
    clientId: Joi.string().optional(),
    grantId: Joi.string().optional(),
    section: Joi.string().optional(),
    documentTitle: Joi.string().optional()
  }).optional(),
  tone: Joi.string().valid('professional', 'persuasive', 'concise', 'narrative').default('professional'),
  length: Joi.string().valid('short', 'medium', 'long').default('medium'),
  format: Joi.string().valid('paragraph', 'bullet', 'structured').default('paragraph')
});

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  clientSchema,
  templateSchema,
  grantSchema,
  aiGenerateSchema
};