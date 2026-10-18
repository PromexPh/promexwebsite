// Central re-export barrel — all email functions live in lib/emails/
// Import from here for backwards-compatibility with existing API routes.

export { sendCandidateWelcome }        from './emails/welcomeCandidate';
export { sendEmployerWelcome }         from './emails/welcomeEmployer';
export { sendApplicationConfirmation } from './emails/applicationConfirmation';
export { sendNewApplicationAlert }     from './emails/newApplicationAlert';
export { sendStatusUpdate }            from './emails/applicationStatusUpdate';
export { sendApplicationWithdrawal }   from './emails/applicationWithdrawal';
export { sendNewEmployerAlert }        from './emails/newEmployerAlert';
export { sendInquiryAlert,
         sendInquiryConfirmation }     from './emails/employerInquiryReceived';
export { sendJobPostingLive }          from './emails/jobPostingLive';
export { sendJobPostingExpiring }      from './emails/jobPostingExpiring';
export { sendProfileCompletionReminder } from './emails/profileCompletionReminder';
