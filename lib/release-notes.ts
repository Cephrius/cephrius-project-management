export type ReleaseNote = {
  version: string;
  releasedOn: string;
  changes: string[];
  bugFixes: string[];
};

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "v0.1.2",
    releasedOn: "Feb 13, 2026",
    changes: [
      "Added a full Settings page with account, profile, security, and data controls.",
      "Implemented working Preferences automation for reminders, weekly summaries, and product updates.",
      "Added styled system email templates aligned with the app visual language.",
      "Added data export endpoint for account and project records.",
    ],
    bugFixes: [
      "Invoice due date now defaults from user preference when left blank.",
      "Cron preference processing now guards against duplicate sends with metadata checkpoints.",
      "Improved reliability of multi-project invoice due-date behavior.",
    ],
  },
  {
    version: "v0.1.1",
    releasedOn: "Feb 12, 2026",
    changes: [
      "Refined invoice list interactions and selected-invoice detail behavior.",
      "Expanded global search coverage across projects, jobs, and invoices.",
      "Improved app shell responsiveness and sidebar interactions.",
    ],
    bugFixes: [
      "Fixed mobile experience by hiding invoice detail panel where space is constrained.",
      "Improved invoice filtering stability when selected records are removed from result sets.",
    ],
  },
  {
    version: "v0.1.0",
    releasedOn: "Feb 10, 2026",
    changes: [
      "Launched core JobSyte dashboard, projects, jobs, and invoice workflows.",
      "Added contractor profile bootstrapping through auth verification.",
      "Added project/job lifecycle controls and invoice generation from completed work.",
    ],
    bugFixes: [
      "Stabilized soft-delete behavior for projects, jobs, and invoices.",
      "Improved auth redirect handling after login and verification events.",
    ],
  },
];

export const LATEST_RELEASE = RELEASE_NOTES[0];
