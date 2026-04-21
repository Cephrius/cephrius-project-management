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
    version: "v0.2.1",
    releasedOn: "Apr 20, 2026",
    majorAdditions: [
      "Launched the Employees & Crews section with a full roster page, crew management, workforce analytics, and mobile-responsive layout.",
      "Added accounting expense management — create, edit, and delete project expenses with cost-type categorization and totals rolled into project profitability.",
      "Redesigned payroll with detailed per-job payment tracking, ready-to-pay prioritization, and an analytics sidebar.",
      "Extended global search to cover employees, crews, payments, and expenses in addition to projects, jobs, and invoices.",
      "Added a Recent Searches list on the /search page, persisted per user and company in Supabase so history survives across devices and sessions.",
    ],
    changes: [
      "Refactored the version changelog dialog into a concise bullet-point format with Features and Bug Fixes categories and a progressive-disclosure See more toggle for developer-level detail.",
      "Refactored the search results page into a clean list layout with filter pills, per-category sections, and consistent result rows.",
      "Added a 15-second pulse highlight animation on destination pages (jobs, employees, crews, invoices, payments, expenses) when navigated to from a search result, cancelable on any user interaction.",
      "Added a CompletedByCombobox for assigning completed jobs to an employee or crew.",
      "Added an Employee dialog for creating and editing employee profiles, plus an Employee Payments management dialog.",
      "Renamed the /employees route to /employees-crews with new sub-routes for roster and crews.",
      "Workforce alerts refactored from aggregate counts to per-entity dropdown notifications.",
      "Replaced Assignment Load and Crew Capacity Recharts bar charts with lighter-weight ranked lists and utilization progress bars.",
      "Added reusable FilterChip component and applied it to the crews, employees, and roster pages.",
      "Added search and filter controls to the crew overview and employee roster sections.",
      "Updated SEO metadata across the app and implemented sitemap generation.",
      "Simplified company membership mapping to reduce duplicated logic.",
    ],
    bugFixes: [
      "Fixed invoice pages printing a blank page by hardening the PrintButton with a styled print flow and loading state.",
      "Fixed dark-mode color mismatch between the Workforce Analytics panel and the Employee Roster by aligning panel backgrounds to bg-card.",
      "Fixed a missing closing div in the employees page two-column layout that caused rendering artifacts.",
      "Fixed tooltip text capitalization on the Assignment Load bar chart before chart removal.",
      "Fixed the Employee Roster table growing taller than its content by constraining the card to fit its contents with a max-height cap.",
      "Resolved PR #90 review issues flagged during the Employees & Crews feature review.",
      "Removed dead toTitleCase helper left over from the chart refactor.",
    ],
  },
  {
    version: "v0.1.9a",
    releasedOn: "Mar 27, 2026",
    majorAdditions: [
      "Added invoice payment tracking — each line item on an invoice can now be individually marked as paid or unpaid directly from the invoice detail page, with optimistic UI updates and toast confirmations.",
      "Added a bulk 'Mark All as Paid' action on invoice detail pages, with a confirmation dialog that locks all jobs on the invoice simultaneously.",
    ],
    changes: [
      "Invoice list now shows Issued, Due, Overdue, and Paid status badges on each card, with a status filter dropdown to narrow results.",
      "Invoice list gained a Bill-To filter dropdown so invoices can be scoped to a specific builder.",
      "Deleting an invoice now resets all associated jobs back to plain completed status — clearing is_invoiced, is_paid, and paid_at — so those jobs immediately become eligible for a new invoice.",
      "Paid invoice items are protected in the edit dialog and cannot be removed from an invoice once payment has been recorded.",
      "Edit invoice now supports adding new jobs to an existing invoice and automatically recalculates the subtotal from the updated line items.",
      "Job eligibility for invoicing now uses the is_invoiced flag directly instead of cross-checking the invoice_items table, making the create invoice flow more reliable.",
      "Jobs table and quick-job checklist now display Invoiced and Paid badges, and paid jobs have their completion toggle locked to prevent accidental status changes.",
    ],
    bugFixes: [
      "Fixed a race condition where optimistic payment toggle updates were being reverted to stale server data before router.refresh() had delivered new props.",
      "Resolved unique constraint errors when re-invoicing jobs that still had stale invoice_items rows from RLS-blocked deletes, by switching inserts to upsert with conflict resolution on job_id.",
      "Fixed invoice item queries silently returning no rows when payment tracking columns had not yet been migrated, by falling back to a basic column query and defaulting is_paid to false.",
    ],
  },
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
