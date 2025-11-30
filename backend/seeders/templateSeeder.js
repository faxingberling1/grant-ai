const mongoose = require('mongoose');
const Template = require('../models/Template');

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

const seedSystemTemplates = async () => {
  try {
    console.log('🌱 Seeding system templates...');
    
    // Remove existing system templates to avoid duplicates
    await Template.deleteMany({ isSystemTemplate: true });
    console.log('✅ Cleared existing system templates');
    
    // Create new system templates
    const createdTemplates = await Template.insertMany(systemTemplates);
    console.log(`✅ Created ${createdTemplates.length} system templates`);
    
    return createdTemplates;
  } catch (error) {
    console.error('❌ Error seeding system templates:', error);
    throw error;
  }
};

module.exports = { seedSystemTemplates, systemTemplates };