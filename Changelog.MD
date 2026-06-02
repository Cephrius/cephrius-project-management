# Developer Changelog

**Last Updated:** 2026-06-02  
**Branch:** `release/v0.3.0`  
**Range:** `release/v0.2.4..release/v0.3.0`  
**Commits Included:** 6

## v0.3.0

This changelog is generated from the commits pushed to `release/v0.3.0`.

## User-Facing Areas

### Calendar

- Added the dedicated Calendar route at `app/(jobsyte-app)/calendar/page.tsx`.
- Added `components/calendar/jobs-calendar-page.tsx` as the main calendar client for scheduled job browsing, job detail review, project navigation, filtering, and job-list reporting.
- Added Calendar navigation entries through `components/app-shell/sidebar-nav.tsx` and `components/document-title-sync.tsx`.
- Updated dashboard calendar behavior in `components/dashboard/month-jobs-calendar.tsx` and `app/(jobsyte-app)/dashboard/page.tsx` so dashboard scheduling stays current-month focused.

### Projects

- Added project preset management through `components/settings/settings-project-presets-card.tsx`, `app/(jobsyte-app)/settings/actions.ts`, and `app/(jobsyte-app)/settings/page.tsx`.
- Extended project creation and project actions in `app/(jobsyte-app)/projects/actions.ts` and `components/projects/new-project-dialog.tsx`.
- Preserved `builder_id` and `subdivision_id` through project list/group data so new projects can be seeded from grouped subdivision, builder, and street context.
- Added `components/projects/street-group-actions-menu.tsx` and `components/projects/subdivision-group-actions-menu.tsx` to consolidate row actions into menus.

### Filtering

- Added shared `components/ui/filter-dialog.tsx`.
- Moved filters into dialogs across accounting, expenses, employees, crews, roster, invoices, jobs, payroll, and projects pages.
- Kept filtering controls consistent with active-count and clear-filter behavior.

### Search

- Expanded `/search` and header suggestions to cover accounting, payments, expenses, employees, crews, invoices, jobs, and projects.
- Added related-record matching so project/address searches can surface linked jobs, invoices, accounting rows, expenses, and payroll activity.
- Updated header suggestions to include Accounting as a first-class result type.

## Commit Log

| Commit | Summary |
| --- | --- |
| `914e056` | Implemented project preset management in Projects and Settings. |
| `b025c71` | Refactored project data to carry builder/subdivision IDs through grouping and new-project flows. |
| `d21b3f0` | Added reusable `FilterDialog` and migrated page filters into modal dialogs. |
| `b59b2f4` | Added street group actions menu for create/delete project actions. |
| `289fbd6` | Added subdivision group actions menu and replaced separate row buttons. |
| `f3b2088` | Added Calendar page, current-month dashboard calendar behavior, document title updates, and broader search support. |

## Files Added

- `app/(jobsyte-app)/calendar/page.tsx`
- `components/calendar/jobs-calendar-page.tsx`
- `components/projects/street-group-actions-menu.tsx`
- `components/projects/subdivision-group-actions-menu.tsx`
- `components/settings/settings-project-presets-card.tsx`
- `components/ui/filter-dialog.tsx`

## Verification Notes

- Release notes source: `lib/release-notes.ts`
- Changelog source: `release/v0.2.4..release/v0.3.0`
- Generated from local `release/v0.3.0`, which tracks `origin/release/v0.3.0`.
