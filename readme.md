backend
├── .env
├── .env.production
├── config
│   ├── constants.js
│   ├── database.js
│   ├── environment.js
│   ├── index.js
│   └── mongoAtlas.js
├── controllers
│   ├── adminController.js
│   ├── aiController.js
│   ├── authController.js
│   ├── clientController.js
│   ├── debugController.js
│   ├── grantController.js
│   ├── notificationController.js
│   ├── templateController.js
│   └── userController.js
├── middleware
│   ├── admin.js
│   ├── auth.js
│   ├── errorHandler.js
│   ├── global.js
│   └── validation.js
├── models
│   ├── Client.js
│   ├── Document.js
│   ├── EmailVerification.js
│   ├── Grant.js
│   ├── GrantSource.js
│   ├── Meeting.js
│   ├── Notification.js
│   ├── PasswordReset.js
│   ├── Template.js
│   └── User.js
├── node_modules
├── package-lock.json
├── package.json
├── routes
│   ├── admin.js
│   ├── ai.js
│   ├── aiRoutes.js
│   ├── auth.js
│   ├── clients.js
│   ├── debug.js
│   ├── documents.js
│   ├── grantSources.js
│   ├── grants.js
│   ├── health.js
│   ├── meetings.js
│   ├── notifications.js
│   ├── templates.js
│   └── users.js
├── seeders
│   └── demoData.js
├── server.js
├── services
│   ├── AIService.js
│   ├── AuthService.js
│   ├── documentService.js
│   ├── emailService.js
│   ├── notificationService.js
│   ├── socketService.js
│   └── storageService.js
├── socket
│   └── notificationSocket.js
├── test-gmail.js
├── uploads
│   ├── documents
│   │   └── 69253140bf28db131c93f2ac
│   │       ├── doc_1764354412758_993491add611e302_AIE_Eric_Hicks.pdf
│   │       ├── doc_1764354715936_30b24beb30261eff_AIE_Eric_Hicks.pdf
│   │       ├── doc_1764354846029_bae47e0f13b2e604_AIE_Eric_Hicks.pdf
│   │       ├── doc_1764355290789_e5c0d09b7a2f904f_AIE_Eric_Hicks.pdf
│   │       ├── doc_1764355371046_b20d8d6df9c21e73_AIE_Eric_Hicks.pdf
│   │       ├── doc_1764355897105_ed282bf29bd2b315_AIE_Eric_Hicks.pdf
│   │       └── doc_1764359709013_025897945897bb31_AIE_Eric_Hicks.pdf
│   └── temp
└── utils
    ├── ai.js
    ├── helpers.js
    └── validators.js

frontend
├── .env.example
├── .env.local
├── .env.production
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
│   │   │   │   ├── CollaborationTools.css
│   │   │   │   ├── CollaborationTools.js
│   │   │   │   ├── ContentEditor.css
│   │   │   │   ├── ContentEditor.js
│   │   │   │   ├── TemplateLibrary.css
│   │   │   │   ├── TemplateLibrary.js
│   │   │   │   ├── WritingAssistant.css
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
│   │   │   ├── DashboardHeader.css
│   │   │   ├── DashboardHeader.js
│   │   │   ├── DashboardSidebar.css
│   │   │   ├── DashboardSidebar.js
│   │   │   ├── Documents
│   │   │   │   ├── DocumentList.css
│   │   │   │   ├── DocumentList.js
│   │   │   │   ├── DocumentPreview.css
│   │   │   │   ├── DocumentPreview.js
│   │   │   │   ├── DocumentUpload.css
│   │   │   │   ├── DocumentUpload.js
│   │   │   │   ├── Documents.css
│   │   │   │   ├── Documents.js
│   │   │   │   ├── StorageStats.css
│   │   │   │   └── StorageStats.js
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
│   │   │   ├── Notifications
│   │   │   │   ├── NotificationBell.css
│   │   │   │   ├── NotificationBell.js
│   │   │   │   ├── NotificationHub.css
│   │   │   │   ├── NotificationHub.js
│   │   │   │   ├── NotificationItem.css
│   │   │   │   ├── NotificationItem.js
│   │   │   │   ├── NotificationList.css
│   │   │   │   └── NotificationList.js
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
│   │   │   ├── Submissions
│   │   │   │   ├── SubmissionDetails.js
│   │   │   │   ├── SubmissionForm.js
│   │   │   │   ├── SubmissionList.js
│   │   │   │   ├── SubmissionTimeline.js
│   │   │   │   ├── Submissions.css
│   │   │   │   └── Submissions.js
│   │   │   └── UserManagement
│   │   │       ├── UserManagement.css
│   │   │       └── UserManagement.js
│   │   └── Login
│   │       ├── Login.css
│   │       ├── Login.js
│   │       ├── Register.css
│   │       └── Register.js
│   ├── config
│   │   └── api.config.js
│   ├── context
│   │   ├── AuthContext.js
│   │   ├── ClientsContext.js
│   │   ├── DocumentsContext.js
│   │   ├── NotificationContext.js
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
│       ├── notificationService.js
│       └── templateService.js
└── vercel.json