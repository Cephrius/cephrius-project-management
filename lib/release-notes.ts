export type ReleaseNote = {
  version: string;
  releasedOn: string;
  changes: string[];
  bugFixes: string[];
};

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "v0.1.3a",
    releasedOn: "Feb 13, 2026",
    changes: [
      "Added smooth page transition animations when navigating between app routes.",
      "Introduced a click-to-open Version Changelog dialog directly from the sidebar version label.",
      "Refactored notification emails into centralized, reusable templates for reminders, weekly summaries, and product updates.",
      "Updated email copy to use human-readable month and year formatting (for example, Feb 2026).",
    ],
    bugFixes: [
      "Changelog popup now opens only once per new release version after deployment.",
      "Improved changelog dialog sizing behavior so width can be expanded beyond default dialog caps.",
      "Stabilized reminder template date labeling by passing explicit runtime context from cron processing.",
    ],
  },
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
