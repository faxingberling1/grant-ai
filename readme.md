backend
├── .env
├── .env.production
├── config
│   └── database.js
├── middleware
│   └── auth.js
├── models
│   ├── Client.js
│   ├── GrantSource.js
│   ├── Meeting.js
│   ├── Template.js
│   └── User.js
├── node_modules
├── package-lock.json
├── package.json
├── routes
│   ├── aiRoutes.js
│   ├── auth.js
│   ├── clients.js
│   ├── grantSources.js
│   ├── health.js
│   ├── meetings.js
│   └── templates.js
└── server.js

frontend
├── .env.local
├── .env.production
├── .gitignore
├── build
├── node_modules
├── package-lock.json
├── package.json
├── public
│   ├── index.html
│   └── manifest.json
├── src
│   ├── App.css
│   ├── App.js
│   ├── components
│   │   ├── Dashboard
│   │   │   ├── AIWriting
│   │   │   │   ├── AIWriting.css
│   │   │   │   ├── AIWriting.js
│   │   │   │   ├── CollaborationTools.js
│   │   │   │   ├── ContentEditor.js
│   │   │   │   ├── TemplateLibrary.js
│   │   │   │   └── WritingAssistant.js
│   │   │   ├── CalendarModal
│   │   │   │   ├── Calendar.css
│   │   │   │   ├── CalendarMain.js
│   │   │   │   ├── CalendarSidebar.css
│   │   │   │   ├── CalendarSidebar.js
│   │   │   │   ├── CalendarView.css
│   │   │   │   ├── CalendarView.js
│   │   │   │   ├── MeetingCard.css
│   │   │   │   ├── MeetingCard.js
│   │   │   │   ├── MeetingDetails.css
│   │   │   │   ├── MeetingDetails.js
│   │   │   │   ├── MeetingList.css
│   │   │   │   ├── MeetingList.js
│   │   │   │   ├── MeetingRoom.css
│   │   │   │   ├── MeetingRoom.js
│   │   │   │   ├── ScheduleMeeting.css
│   │   │   │   ├── ScheduleMeeting.js
│   │   │   │   ├── UpcomingMeetings.css
│   │   │   │   └── UpcomingMeetings.js
│   │   │   ├── Clients
│   │   │   │   ├── BulkEmail.js
│   │   │   │   ├── ClientCommunication.css
│   │   │   │   ├── ClientCommunication.js
│   │   │   │   ├── ClientDetails.css
│   │   │   │   ├── ClientDetails.js
│   │   │   │   ├── ClientEmails.css
│   │   │   │   ├── ClientEmails.js
│   │   │   │   ├── ClientForm.css
│   │   │   │   ├── ClientForm.js
│   │   │   │   ├── ClientList.css
│   │   │   │   ├── ClientList.js
│   │   │   │   ├── Clients.css
│   │   │   │   ├── Clients.js
│   │   │   │   ├── CommunicationHistory.js
│   │   │   │   ├── CommunicationHub.css
│   │   │   │   ├── CommunicationHub.js
│   │   │   │   └── CommunicationThread.js
│   │   │   ├── CommunicationHub
│   │   │   │   ├── Drafts.css
│   │   │   │   ├── Drafts.js
│   │   │   │   ├── EmailComposer.css
│   │   │   │   ├── EmailComposer.js
│   │   │   │   ├── EmailTemplates.css
│   │   │   │   ├── EmailTemplates.js
│   │   │   │   ├── Inbox.css
│   │   │   │   ├── Inbox.js
│   │   │   │   ├── Sent.css
│   │   │   │   ├── Sent.js
│   │   │   │   ├── Spam.css
│   │   │   │   ├── Spam.js
│   │   │   │   ├── Starred.css
│   │   │   │   ├── Starred.js
│   │   │   │   ├── Trash.css
│   │   │   │   └── Trash.js
│   │   │   ├── Dashboard.css
│   │   │   ├── Dashboard.js
│   │   │   ├── DashboardHeader.js
│   │   │   ├── DashboardSidebar.css
│   │   │   ├── DashboardSidebar.js
│   │   │   ├── Grants
│   │   │   │   ├── ClientGrantMatching.css
│   │   │   │   ├── ClientGrantMatching.js
│   │   │   │   ├── FindGrants.css
│   │   │   │   ├── FindGrants.js
│   │   │   │   ├── GrantDraft.css
│   │   │   │   ├── GrantDraft.js
│   │   │   │   ├── GrantForm.css
│   │   │   │   ├── GrantForm.js
│   │   │   │   ├── Grants.css
│   │   │   │   ├── Grants.js
│   │   │   │   ├── GrantsHeader.css
│   │   │   │   ├── GrantsHeader.js
│   │   │   │   └── GrantsManager.js
│   │   │   ├── Matching
│   │   │   │   ├── ClientProfile.css
│   │   │   │   ├── ClientProfile.js
│   │   │   │   ├── GrantRecommendations.js
│   │   │   │   ├── MatchResults.css
│   │   │   │   ├── MatchResults.js
│   │   │   │   ├── Matching.css
│   │   │   │   └── Matching.js
│   │   │   ├── Profile
│   │   │   │   ├── Profile.css
│   │   │   │   ├── Profile.js
│   │   │   │   ├── ProfileHeader.js
│   │   │   │   ├── ProfilePreferences.js
│   │   │   │   ├── ProfileSettings.js
│   │   │   │   └── SubscriptionPlan.js
│   │   │   ├── Reports
│   │   │   │   ├── ReportAnalytics.js
│   │   │   │   ├── ReportBuilder.js
│   │   │   │   ├── ReportEditor.js
│   │   │   │   ├── ReportSharing.js
│   │   │   │   ├── ReportTemplates.js
│   │   │   │   ├── Reports.css
│   │   │   │   └── Reports.js
│   │   │   ├── Settings
│   │   │   │   ├── DisableConfirmationModal.css
│   │   │   │   ├── DisableConfirmationModal.js
│   │   │   │   ├── IntegrationSettings.js
│   │   │   │   ├── PreferencesSettings.js
│   │   │   │   ├── SMTPSettings.css
│   │   │   │   ├── SMTPSettings.js
│   │   │   │   ├── SecuritySettings.js
│   │   │   │   ├── Settings.css
│   │   │   │   └── Settings.js
│   │   │   ├── Sources
│   │   │   │   ├── GrantWatchIntegration.css
│   │   │   │   ├── GrantWatchIntegration.js
│   │   │   │   ├── GrantsGovIntegration.css
│   │   │   │   ├── GrantsGovIntegration.js
│   │   │   │   ├── SourceDetails.css
│   │   │   │   ├── SourceDetails.js
│   │   │   │   ├── SourceForm.js
│   │   │   │   ├── SourceList.css
│   │   │   │   ├── SourceList.js
│   │   │   │   ├── Sources.css
│   │   │   │   └── Sources.js
│   │   │   └── Submissions
│   │   │       ├── SubmissionDetails.js
│   │   │       ├── SubmissionForm.js
│   │   │       ├── SubmissionList.js
│   │   │       ├── SubmissionTimeline.js
│   │   │       ├── Submissions.css
│   │   │       └── Submissions.js
│   │   └── Login
│   │       ├── Login.css
│   │       └── Login.js
│   ├── config
│   │   └── api.config.js
│   ├── context
│   │   ├── AuthContext.js
│   │   ├── ClientsContext.js
│   │   └── TemplatesContext.js
│   ├── index.css
│   ├── index.js
│   └── services
│       ├── api.js
│       ├── clientService.js
│       ├── emailService.js
│       ├── grantSourceService.js
│       ├── grantWatchApi.js
│       ├── grantsGovApi.js
│       ├── meetingService.js
│       └── templateService.js
└── vercel.json