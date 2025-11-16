backend
├── .env
├── node_modules
├── package-lock.json
├── package.json
└── server.js

frontend
├── .env
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
│   │   │   ├── Clients
│   │   │   │   ├── BulkEmail.js
│   │   │   │   ├── CalendarModal.css
│   │   │   │   ├── CalendarModal.js
│   │   │   │   ├── ClientCommunication.js
│   │   │   │   ├── ClientDetails.js
│   │   │   │   ├── ClientEmails.js
│   │   │   │   ├── ClientForm.js
│   │   │   │   ├── ClientList.js
│   │   │   │   ├── Clients.css
│   │   │   │   ├── Clients.js
│   │   │   │   ├── CommunicationHistory.js
│   │   │   │   ├── CommunicationHub.css
│   │   │   │   ├── CommunicationHub.js
│   │   │   │   └── CommunicationThread.js
│   │   │   ├── CommunicationHub
│   │   │   │   ├── EmailComposer.css
│   │   │   │   ├── EmailComposer.js
│   │   │   │   ├── EmailTemplates.css
│   │   │   │   └── EmailTemplates.js
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
│   │   │   │   ├── ClientProfile.js
│   │   │   │   ├── GrantRecommendations.js
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
│   │   └── TemplatesContext.js
│   ├── index.css
│   ├── index.js
│   └── services
│       ├── grantWatchApi.js
│       └── grantsGovApi.js
└── vercel.json