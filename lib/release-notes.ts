export type ReleaseNote = {
  version: string;
  releasedOn: string;
  majorAdditions?: string[];
  changes: string[];
  bugFixes: string[];
};
// New releases every tuesday (Or whenever I finish a batch of features and fixes that feel worth sharing)
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "v0.1.8a",
    releasedOn: "Mar 24, 2026",
    majorAdditions: [
      "Introduced quick job completion directly from the projects view — an inline checklist lets users toggle individual job statuses with optimistic UI updates, and a companion modal drawer provides a focused job-by-job review flow.",
      "Refactored the settings page into discrete, focused card components: Account Details, Business Profile, Appearance, Preferences, Security, and Data & Session.",
    ],
    changes: [
      "Redesigned the dashboard layout with improved color consistency, visual hierarchy, and responsiveness across mobile and desktop widths.",
      "Added a Mark Complete toggle button on dashboard job cards for one-click completion directly from the daily calendar view.",
      "Extended project server actions to support toggling job completion state from the projects page.",
      "Removed a duplicate dashboard page implementation left over from an earlier build to eliminate conflicting route handlers.",
    ],
    bugFixes: [
      "Corrected dashboard calendar styling regressions introduced during the layout refactor.",
      "Fixed app-shell and sidebar layout inconsistencies exposed when the dashboard view was restructured.",
    ],
  },
  {
    version: "v0.1.7a",
    releasedOn: "Mar 10, 2026",
    majorAdditions: [
      "Added multi-company support with a company switcher in the sidebar and header for both desktop and mobile views.",
      "Introduced company creation and deletion with full cascading data cleanup.",
    ],
    changes: [
      "All pages, jobs, projects, invoices, and search results now filter by the active company context.",
      "Active company selection is persisted across sessions using cookies and local storage.",
      "Settings and profile management updated to include company-specific data.",
      "Search suggestions now respect the active company context.",
    ],
    bugFixes: [],
  },
  {
    version: "v0.1.6a",
    releasedOn: "Feb 18, 2026",
    changes: [],
    bugFixes: [
      "Enhanced UI responsiveness in Header component; improved layout and styling for better mobile and desktop views."
    ],
  },
  {
    version: "v0.1.5a",
    releasedOn: "Feb 16, 2026",
    majorAdditions: [
      "Added in-app CSV import for projects and jobs with dry-run validation, summary reporting, and direct create/append behavior.",
      "Added street-level folders to grouped project view so projects are organized by subdivision -> builder -> street -> Jobs.",
      "Expanded invoice management with edit and delete actions, including full line-item editing (description, amount, address, subdivision, and builder).",
    ],
    changes: [
      "Extended invoice editing to recalculate subtotal values from updated line items.",
      "Improved project actions and import controls so they adapt cleanly on smaller screens.",
      "Refined grouped project rows and project cards for better wrapping and readability on mobile widths.",
    ],
    bugFixes: [
      "Resolved invoice item insert failures caused by null subdivision snapshots violating database constraints.",
      "Fixed search behavior where suggestions did not reopen after pressing Escape and continuing to type.",
      "Fixed multiple header and projects layout overflow issues on narrow/mobile viewports.",
    ],
  },
  {
    version: "v0.1.4a",
    releasedOn: "Feb 13, 2026",
    changes: [
      "Made scheduled completion optional for jobs in both add and edit flows.",
      "Added project-scoped job title and price prefill behavior with a price combobox tied to each project.",
      "Split project address capture into Street Number and Street Address while keeping concatenated address display.",
      "Added global search quick action to create a new project with auto-prefilled street number and street address.",
      "Added grouped-view Add Project buttons per subdivision with automatic subdivision preselection.",
    ],
    bugFixes: [
      "Improved search query parsing for compact address inputs like 3049Tong Lane.",
      "Enforced numeric-only street number validation in project forms and server actions.",
      "Persisted selected project and grouped expansion state when navigating back to Projects.",
      "Stabilized grouped expansion persistence so folders stay open until explicitly closed or user sign-out.",
      "Refined mobile header spacing and search control layout behavior for small screens.",
    ],
  },
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
