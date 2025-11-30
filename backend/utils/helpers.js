const User = require('../models/User');
const Client = require('../models/Client');
const Template = require('../models/Template');
const Grant = require('../models/Grant');
const Notification = require('../models/Notification');

async function createDemoUsers() {
  try {
    const demoUsers = [
      {
        name: "Demo User",
        email: "demo@grantfunds.com",
        password: "demo123",
        role: "Grant Manager",
        avatar: "https://i.pravatar.cc/150?img=45",
        approved: true,
        emailVerified: true
      },
      {
        name: "Alex Murphy",
        email: "admin@deleuxedesign.com",
        password: "AlexMurphy",
        role: "admin",
        avatar: "https://i.pravatar.cc/150?img=1",
        approved: true,
        emailVerified: true
      }
    ];
    
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ ${userData.role} user created: ${userData.email}`);
      } else {
        if (userData.role === 'admin') {
          await User.findOneAndUpdate(
            { email: userData.email },
            { 
              role: 'admin',
              approved: true,
              name: userData.name
            }
          );
          console.log(`✅ Admin user updated: ${userData.email}`);
        } else {
          console.log(`ℹ️  User already exists: ${userData.email}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  }
}

async function createDemoClients() {
  try {
    const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
    if (!demoUser) {
      console.log('❌ Demo user not found for creating demo clients');
      return;
    }
    const existingClients = await Client.find({ userId: demoUser._id });
    if (existingClients.length > 0) {
      console.log(`ℹ️  ${existingClients.length} demo clients already exist`);
      return;
    }
    const demoClients = [
      {
        organizationName: 'GreenTech Initiative',
        primaryContactName: 'Sarah Chen',
        titleRole: 'Executive Director',
        emailAddress: 'sarah.chen@greentech.org',
        phoneNumbers: '+1 (555) 123-4567',
        status: 'active',
        tags: ['Environment', 'Technology', 'Non-Profit'],
        notes: 'Very responsive and organized. Great partnership potential.',
        grantsSubmitted: 12,
        grantsAwarded: 8,
        totalFunding: '$450,000',
        avatar: 'https://i.pravatar.cc/150?img=1',
        userId: demoUser._id
      },
      {
        organizationName: 'Community Health Alliance',
        primaryContactName: 'David Kim',
        titleRole: 'Program Director',
        emailAddress: 'david.kim@communityhealth.org',
        phoneNumbers: '+1 (555) 987-6543',
        status: 'active',
        tags: ['Healthcare', 'Community', 'Non-Profit'],
        notes: 'Focuses on healthcare access in underserved communities.',
        grantsSubmitted: 8,
        grantsAwarded: 5,
        totalFunding: '$280,000',
        avatar: 'https://i.pravatar.cc/150?img=32',
        userId: demoUser._id
      },
      {
        organizationName: 'Future Leaders Foundation',
        primaryContactName: 'Maria Rodriguez',
        titleRole: 'Development Director',
        emailAddress: 'maria.rodriguez@futureleaders.org',
        phoneNumbers: '+1 (555) 456-7890',
        status: 'prospect',
        tags: ['Education', 'Youth', 'Mentorship'],
        notes: 'New prospect - follow up in 2 weeks.',
        grantsSubmitted: 3,
        grantsAwarded: 1,
        totalFunding: '$75,000',
        avatar: 'https://i.pravatar.cc/150?img=28',
        userId: demoUser._id
      }
    ];
    for (const clientData of demoClients) {
      const client = new Client(clientData);
      await client.save();
      console.log(`✅ Demo client created: ${clientData.organizationName}`);
    }
    console.log(`🎉 Created ${demoClients.length} demo clients`);
  } catch (error) {
    console.error('❌ Error creating demo clients:', error);
  }
}

async function createDemoTemplates() {
  try {
    const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
    if (!demoUser) {
      console.log('❌ Demo user not found for creating demo templates');
      return;
    }
    const existingTemplates = await Template.find({ createdBy: demoUser._id });
    if (existingTemplates.length > 0) {
      console.log(`ℹ️  ${existingTemplates.length} demo templates already exist`);
      return;
    }
    const demoTemplates = [
      {
        title: 'Initial Grant Inquiry',
        subject: 'Grant Opportunity Inquiry - [Client Name]',
        category: 'proposal',
        description: 'Template for initial contact about grant opportunities',
        content: `Dear [Client Name],
  I hope this email finds you well. I am writing to inquire about potential grant opportunities that may be available for your organization.
  Based on your work in [Field/Area], I believe there are several funding opportunities that could be a great fit. I would be happy to discuss:
  • Current grant opportunities that align with your mission
  • Application timelines and requirements
  • How we can collaborate to strengthen your proposals
  Please let me know if you would be available for a brief call next week to explore these possibilities further.
  Best regards,
  [Your Name]`,
        icon: 'fas fa-handshake',
        usageCount: 45,
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: demoUser._id
      },
      {
        title: 'Proposal Follow-up',
        subject: 'Follow-up: [Grant Name] Proposal Submission',
        category: 'followup',
        description: 'Follow up on submitted grant proposal',
        content: `Dear [Client Name],
  I wanted to follow up on the grant proposal we submitted on [Date] for the [Grant Name] opportunity.
  I've been monitoring the application status and wanted to check if you have received any updates or if there are any additional materials needed from our end.
  If you have any questions or would like to discuss next steps, please don't hesitate to reach out.
  Thank you for your partnership in this important work.
  Best regards,
  [Your Name]`,
        icon: 'fas fa-sync',
        usageCount: 32,
        lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdBy: demoUser._id
      },
      {
        title: 'Meeting Request',
        subject: 'Grant Strategy Meeting Request',
        category: 'meeting',
        description: 'Request a meeting to discuss grant strategy',
        content: `Dear [Client Name],
  I would like to schedule a meeting to discuss your grant strategy and explore upcoming funding opportunities that could support your important work.
  During our meeting, we could cover:
  • Review of current grant pipeline
  • Upcoming deadlines and opportunities
  • Strategy for maximizing funding success
  • Any specific challenges or questions you may have
  Please let me know what time works best for you next week. I am available [Available Times].
  Looking forward to our conversation.
  Best regards,
  [Your Name]`,
        icon: 'fas fa-calendar',
        usageCount: 28,
        lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdBy: demoUser._id
      },
      {
        title: 'Thank You Note',
        subject: 'Thank You - [Topic] Discussion',
        category: 'thankyou',
        description: 'Express gratitude after a meeting or collaboration',
        content: `Dear [Client Name],
  Thank you for your time today. I truly enjoyed our conversation about [Topic] and am excited about the potential opportunities we discussed.
  I appreciate you sharing insights about [Specific Point] and look forward to exploring how we can work together to achieve your funding goals.
  Please don't hesitate to reach out if you have any additional questions in the meantime.
  Warm regards,
  [Your Name]`,
        icon: 'fas fa-heart',
        usageCount: 22,
        lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdBy: demoUser._id
      },
      {
        title: 'Deadline Reminder',
        subject: 'Reminder: [Grant Name] Deadline - [Date]',
        category: 'reminder',
        description: 'Remind clients about upcoming grant deadlines',
        content: `Dear [Client Name],
  This is a friendly reminder about the upcoming deadline for [Grant Name] on [Date].
  To ensure we have enough time to prepare a strong application, please make sure to:
  • Review the attached materials by [Review Date]
  • Provide any necessary documents by [Document Deadline]
  • Schedule a final review session if needed
  The deadline is approaching quickly, so let's make sure we're on track. Please let me know if you have any questions or need assistance with any part of the process.
  Best regards,
  [Your Name]`,
        icon: 'fas fa-bell',
        usageCount: 18,
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdBy: demoUser._id
      }
    ];
    for (const templateData of demoTemplates) {
      const template = new Template(templateData);
      await template.save();
      console.log(`✅ Demo template created: ${templateData.title}`);
    }
    console.log(`🎉 Created ${demoTemplates.length} demo templates`);
  } catch (error) {
    console.error('❌ Error creating demo templates:', error);
  }
}

async function createDemoGrants() {
  try {
    const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
    if (!demoUser) {
      console.log('❌ Demo user not found for creating demo grants');
      return;
    }
    const existingGrants = await Grant.find({ createdBy: demoUser._id });
    if (existingGrants.length > 0) {
      console.log(`ℹ️  ${existingGrants.length} demo grants already exist`);
      return;
    }
    const demoGrants = [
      {
        title: 'NSF STEM Education Grant',
        funder: 'National Science Foundation',
        category: 'education',
        deadline: new Date('2024-03-15'),
        maxAward: 500000,
        focusAreas: ['STEM Education', 'K-12', 'Underserved Communities'],
        eligibility: 'Non-profit organizations, educational institutions',
        description: 'Funding for innovative STEM education programs targeting underserved youth populations.',
        url: 'https://www.nsf.gov/funding/',
        status: 'active',
        createdBy: demoUser._id
      },
      {
        title: 'Environmental Conservation Program',
        funder: 'Environmental Protection Agency',
        category: 'environment',
        deadline: new Date('2024-04-20'),
        maxAward: 750000,
        focusAreas: ['Conservation', 'Climate Change', 'Sustainability'],
        eligibility: 'Non-profit organizations, government agencies',
        description: 'Grants for projects focused on environmental conservation and climate change mitigation.',
        url: 'https://www.epa.gov/grants',
        status: 'active',
        createdBy: demoUser._id
      },
      {
        title: 'Community Health Initiative',
        funder: 'Department of Health and Human Services',
        category: 'healthcare',
        deadline: new Date('2024-05-30'),
        maxAward: 1000000,
        focusAreas: ['Public Health', 'Community Wellness', 'Healthcare Access'],
        eligibility: 'Non-profit organizations, healthcare providers',
        description: 'Funding for community health programs improving access to healthcare services.',
        url: 'https://www.hhs.gov/grants/',
        status: 'active',
        createdBy: demoUser._id
      },
      {
        title: 'Youth Development Fund',
        funder: 'Department of Education',
        category: 'youth',
        deadline: new Date('2024-06-15'),
        maxAward: 300000,
        focusAreas: ['After-school Programs', 'Mentorship', 'Career Readiness'],
        eligibility: 'Non-profit organizations, schools, community centers',
        description: 'Support for youth development programs focusing on education and career readiness.',
        url: 'https://www.ed.gov/funding',
        status: 'active',
        createdBy: demoUser._id
      },
      {
        title: 'Arts and Culture Grant',
        funder: 'National Endowment for the Arts',
        category: 'arts',
        deadline: new Date('2024-07-01'),
        maxAward: 250000,
        focusAreas: ['Arts Education', 'Cultural Programs', 'Community Arts'],
        eligibility: 'Non-profit organizations, arts institutions',
        description: 'Funding for arts and cultural programs that engage communities.',
        url: 'https://www.arts.gov/grants',
        status: 'active',
        createdBy: demoUser._id
      }
    ];
    for (const grantData of demoGrants) {
      const grant = new Grant(grantData);
      await grant.save();
      console.log(`✅ Demo grant created: ${grantData.title}`);
    }
    console.log(`🎉 Created ${demoGrants.length} demo grants`);
  } catch (error) {
    console.error('❌ Error creating demo grants:', error);
  }
}

async function createDemoNotifications() {
  try {
    const demoUser = await User.findOne({ email: "demo@grantfunds.com" });
    if (!demoUser) {
      console.log('❌ Demo user not found for creating demo notifications');
      return;
    }
    
    const existingNotifications = await Notification.countDocuments({ userId: demoUser._id });
    if (existingNotifications > 0) {
      console.log(`ℹ️  ${existingNotifications} demo notifications already exist`);
      return;
    }
    
    const NotificationService = require('./services/NotificationService');
    const notificationService = new NotificationService();
    
    const demoNotifications = [
      {
        userId: demoUser._id,
        type: 'grant_deadline',
        title: 'Grant Deadline Approaching',
        message: 'NSF STEM Education Grant deadline in 3 days',
        priority: 'urgent',
        data: { grantId: 'demo-grant-1', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        actionUrl: '/grants/demo-grant-1',
        isRead: false
      },
      {
        userId: demoUser._id,
        type: 'meeting_reminder',
        title: 'Meeting Reminder',
        message: 'Meeting with GreenTech Initiative in 30 minutes',
        priority: 'high',
        data: { meetingId: 'demo-meeting-1', clientName: 'GreenTech Initiative' },
        actionUrl: '/meetings/demo-meeting-1',
        isRead: false
      },
      {
        userId: demoUser._id,
        type: 'ai_completion',
        title: 'AI Writing Complete',
        message: 'Your grant proposal draft is ready for review',
        priority: 'medium',
        data: { documentTitle: 'Community Health Grant Proposal' },
        actionUrl: '/ai-writing',
        isRead: true
      },
      {
        userId: demoUser._id,
        type: 'email_sent',
        title: 'Email Sent Successfully',
        message: 'Proposal follow-up sent to Community Health Alliance',
        priority: 'low',
        data: { clientName: 'Community Health Alliance', subject: 'Grant Proposal Follow-up' },
        actionUrl: '/communication',
        isRead: true
      },
      {
        userId: demoUser._id,
        type: 'system_alert',
        title: 'New Feature Available',
        message: 'Check out the new AI writing templates in your dashboard',
        priority: 'medium',
        data: { feature: 'ai_templates' },
        actionUrl: '/ai-writing',
        isRead: false
      }
    ];
    
    for (const notificationData of demoNotifications) {
      await notificationService.createNotification(notificationData);
    }
    
    console.log(`🎉 Created ${demoNotifications.length} demo notifications`);
  } catch (error) {
    console.error('❌ Error creating demo notifications:', error);
  }
}

async function initializeDemoData() {
  console.log('📦 Initializing database with demo data...');
  await createDemoUsers();
  await createDemoClients();
  await createDemoTemplates();
  await createDemoGrants();
  await createDemoNotifications();
  console.log('✅ Database initialization complete!');
}

module.exports = {
  createDemoUsers,
  createDemoClients,
  createDemoTemplates,
  createDemoGrants,
  createDemoNotifications,
  initializeDemoData
};