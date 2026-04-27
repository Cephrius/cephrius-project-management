import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  FolderKanban,
  Hammer,
  HardHat,
  LayoutDashboard,
  Receipt,
  Search,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

export const SITE_URL = "https://jobsyte.co";
export const REQUEST_DEMO_HREF = "/request-demo";

export const FEATURE_HIGHLIGHTS: ReadonlyArray<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: LayoutDashboard,
    title: "Unified dashboard",
    description:
      "Today's schedule, this week's pipeline, and billing health side-by-side — no tab juggling.",
  },
  {
    icon: CalendarClock,
    title: "Field-ready scheduling",
    description:
      "12-month job calendar with status flags so superintendents and crews stay on the same page.",
  },
  {
    icon: Receipt,
    title: "Invoices that close fast",
    description:
      "Issue, track, and reconcile invoices against active projects with audit-ready totals.",
  },
  {
    icon: Hammer,
    title: "Built for sub-contractors",
    description:
      "Designed around the day-to-day of grading, framing, and finishing crews — not generic PM bloat.",
  },
  {
    icon: Shield,
    title: "Secure by default",
    description:
      "Company-scoped data, role-based access, and a portal your office and field teams trust.",
  },
  {
    icon: Zap,
    title: "Global search",
    description:
      "Find a project, employee, crew, payment, or invoice in one keystroke from anywhere in the app.",
  },
];

export const FAQ_ITEMS = [
  {
    q: "Who is JobSyte built for?",
    a: "Sub-contractors working with national home builders — grading, framing, finishing, concrete, and similar trades. If you run crews against a list of project addresses, JobSyte fits.",
  },
  {
    q: "Do I have to migrate everything at once?",
    a: "No. Most teams start with the projects and jobs modules, get the calendar accurate, then layer in invoices and payroll. Your data stays company-scoped the whole way.",
  },
  {
    q: "Does the field crew need a separate app?",
    a: "No. JobSyte is mobile-friendly out of the box. Crews open the same dashboard you use in the office and tap to mark jobs complete.",
  },
  {
    q: "How does billing work?",
    a: "Completed jobs roll up against project addresses. Issue an invoice, mark it paid when the check clears, and the monthly snapshot reflects it immediately.",
  },
  {
    q: "Is my data secure?",
    a: "Every record is company-scoped with role-based access. Office staff, superintendents, and crew leads only see what they should.",
  },
  {
    q: "Can I get a demo?",
    a: "Yes — request one and we'll walk through your actual workflow on a live JobSyte instance with sample data.",
  },
] as const;

export const SIDEBAR_NAV: ReadonlyArray<{
  label: string;
  icon: LucideIcon;
  active?: boolean;
}> = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Projects", icon: FolderKanban },
  { label: "Jobs", icon: CalendarDays },
  { label: "Employees & Crews", icon: HardHat },
  { label: "Payroll", icon: Wallet },
  { label: "Invoices", icon: Receipt },
  { label: "Accounting", icon: BarChart3 },
  { label: "Search", icon: Search },
  { label: "Settings", icon: Settings },
];

export const METRIC_CARDS = [
  {
    label: "Schedule Focus",
    value: "12",
    subtitle: "Jobs due today",
    footer: "1 incomplete this week",
    footerMeta: "Feb 15 – Feb 21",
    icon: CalendarDays,
    footerIcon: Clock,
    accent: "footer",
  },
  {
    label: "Work Pipeline",
    value: "106",
    subtitle: "Open jobs",
    footer: "26 completed in February",
    footerMeta: "Completion rate · 78%",
    icon: TrendingUp,
    footerIcon: CheckCircle2,
    accent: "progress",
    progress: 78,
  },
  {
    label: "Active Projects",
    value: "153",
    subtitle: "Active projects",
    footer: "$284,120 pipeline value",
    footerMeta: "Across 28 superintendents",
    icon: FolderKanban,
    footerIcon: BarChart3,
    accent: "footer",
  },
  {
    label: "Invoices · February",
    value: "140",
    subtitle: "Invoices issued",
    footer: "Total: $44,314.00",
    footerMeta: "12 paid · 128 issued",
    icon: DollarSign,
    footerIcon: DollarSign,
    accent: "footer",
  },
] as const;

export const HIGH_VALUE_JOBS = [
  { rank: 1, title: "Final Grade", project: "35523 Pontiac Dr", amount: "$8,450" },
  { rank: 2, title: "Pad Build", project: "112 Sample Street", amount: "$6,200" },
  { rank: 3, title: "Rough Grade", project: "1093 Sample Street", amount: "$4,980" },
];

export const OVERDUE_JOBS = [
  { title: "Knockdown", due: "2026-02-18", project: "1123 Sample Street" },
  { title: "Final Grade", due: "2026-02-19", project: "78 Birch Ln" },
];

export const MONTHLY_SNAPSHOT = [
  { label: "Jobs completed", value: "26" },
  { label: "Invoices issued", value: "140" },
  { label: "Revenue billed", value: "$44,314" },
  { label: "Completion rate", value: "78%" },
];

export const QUICK_ACTIONS: ReadonlyArray<{ label: string; icon: LucideIcon }> = [
  { label: "New Project", icon: FolderKanban },
  { label: "New Invoice", icon: DollarSign },
  { label: "Search", icon: BarChart3 },
  { label: "Settings", icon: CheckCircle2 },
];

export const JOB_CALENDAR_ENTRIES = [
  {
    date: "Thu, Feb 26",
    title: "Project: 112 Sample Street",
    detail: "Superintendent / GC: DeShawn Parker",
    status: "Incomplete",
  },
  {
    date: "Rough Grade",
    title: "Project: 1093 Sample Street",
    detail: "Superintendent / GC: Anthony Walker",
    status: "Completed",
  },
  {
    date: "Rough Grade",
    title: "Project: 1123 Sample Street",
    detail: "Superintendent / GC: Mike Johnson",
    status: "Incomplete",
  },
];

export const WEEKLY_JOBS = [
  { id: "Pad Build", date: "2026-02-20", address: "35523 Pontiac Dr" },
  { id: "Knockdown", date: "2026-02-23", address: "35523 Pontiac Dr" },
  { id: "Final Grade", date: "2026-03-04", address: "35523 Pontiac Dr" },
  { id: "Framing", date: "2026-03-16", address: "35523 Pontiac Dr" },
];

export const RECENT_INVOICES = [
  {
    invoice: "INV-2060204-9236",
    date: "2026-02-04",
    projectAddress: "35523 Pontiac Dr",
    status: "Issued",
    amount: "$4,314.00",
  },
  {
    invoice: "INV-2060202-9201",
    date: "2026-02-02",
    projectAddress: "112 Sample Street",
    status: "Paid",
    amount: "$2,180.00",
  },
  {
    invoice: "INV-2060131-9188",
    date: "2026-01-31",
    projectAddress: "1093 Sample Street",
    status: "Paid",
    amount: "$1,760.00",
  },
  {
    invoice: "INV-2060127-9139",
    date: "2026-01-27",
    projectAddress: "1123 Sample Street",
    status: "Issued",
    amount: "$980.00",
  },
];

export const HOME_BUILDER_LOGOS = [
  { src: "/homes/chesmar.png", alt: "Chesmar Homes" },
  { src: "/homes/davidweekly.png", alt: "David Weekley Homes" },
  { src: "/homes/DRHorton.png", alt: "D.R. Horton" },
  { src: "/homes/empire-logo.jpg", alt: "Empire Communities" },
  { src: "/homes/highlandhomes.png", alt: "Highland Homes" },
  { src: "/homes/HistorymakerHomes.png", alt: "HistoryMaker Homes" },
  { src: "/homes/Lennar.png", alt: "Lennar" },
  { src: "/homes/perry.png", alt: "Perry Homes" },
  { src: "/homes/westin.png", alt: "Westin Homes" },
];

export const HOME_BUILDER_LOGO_WHEEL = [
  ...HOME_BUILDER_LOGOS,
  ...HOME_BUILDER_LOGOS,
];

export type CollaborationCard = {
  title: string;
  description: string;
  visual: "invite" | "edit" | "feedback";
};

export const COLLABORATION_CARDS: CollaborationCard[] = [
  {
    title: "Schedule visibility",
    description:
      "Track today&apos;s jobs, upcoming work, and incomplete items before crews head to the field.",
    visual: "invite",
  },
  {
    title: "Pipeline control",
    description:
      "Monitor open jobs, completion pace, and project activity from one dashboard view.",
    visual: "edit",
  },
  {
    title: "Billing clarity",
    description:
      "See invoices issued, recent billing activity, and totals without jumping between screens.",
    visual: "feedback",
  },
];

export const MODULES: ReadonlyArray<{
  icon: LucideIcon;
  title: string;
  body: string;
}> = [
  {
    icon: FolderKanban,
    title: "Projects",
    body: "Centralize project addresses, superintendents, and active scope.",
  },
  {
    icon: CalendarDays,
    title: "Jobs",
    body: "Schedule, assign, and complete jobs against any active project.",
  },
  {
    icon: HardHat,
    title: "Employees & Crews",
    body: "Roster, crew composition, and workforce analytics in one view.",
  },
  {
    icon: Wallet,
    title: "Payroll",
    body: "Ready-to-pay queue with crew capacity and assignment load.",
  },
  {
    icon: Receipt,
    title: "Invoices",
    body: "Issue, search, and reconcile invoices against project addresses.",
  },
  {
    icon: BarChart3,
    title: "Accounting",
    body: "Project profitability and revenue snapshots for the month.",
  },
  {
    icon: Search,
    title: "Global Search",
    body: "Find any project, employee, crew, payment, or invoice instantly.",
  },
  {
    icon: Settings,
    title: "Settings",
    body: "Per-company preferences, release notes, and team controls.",
  },
];

export const WHY_JOBSYTE_PAINS: ReadonlyArray<{ pain: string; fix: string }> = [
  {
    pain: "Texts and group chats lose track of which jobs are actually done",
    fix: "One tap marks a job complete and updates the dashboard instantly",
  },
  {
    pain: "Spreadsheets need to be re-keyed every time a project address changes",
    fix: "Edit once at the project level — every job and invoice updates automatically",
  },
  {
    pain: "Invoices sit in someone's inbox waiting to be reconciled",
    fix: "Recent Invoices live next to the dashboard with paid/issued status at a glance",
  },
  {
    pain: "Field crews call the office to ask 'what's next this week?'",
    fix: "Crews open the app and see today's schedule, this week's pipeline, and overdue jobs",
  },
  {
    pain: "Month-end is a scramble across calendars, sheets, and email",
    fix: "Month snapshot, completion rate, and revenue billed are always one click away",
  },
];

export const CAPABILITIES: ReadonlyArray<{
  Icon: LucideIcon;
  title: string;
  outcome: string;
}> = [
  {
    Icon: CalendarClock,
    title: "Scope a 12-month schedule",
    outcome:
      "See every job booked through next year, jump to any month, and assign superintendents from the calendar.",
  },
  {
    Icon: HardHat,
    title: "Manage crews and rosters",
    outcome:
      "Build crews, track workforce composition, and surface who has capacity this week before you commit to a job.",
  },
  {
    Icon: Receipt,
    title: "Issue and reconcile invoices",
    outcome:
      "Generate invoices against project addresses, track issued vs. paid, and tie totals back to the project ledger.",
  },
  {
    Icon: Wallet,
    title: "Run payroll without re-keying",
    outcome:
      "Open the payroll queue, see crew assignments and hours, and pay the people who actually showed up.",
  },
  {
    Icon: BarChart3,
    title: "See profitability per project",
    outcome:
      "Watch revenue billed against open jobs so you know which projects are carrying the month before it ends.",
  },
  {
    Icon: Search,
    title: "Find anything in one keystroke",
    outcome:
      "Global search covers projects, employees, crews, payments, and invoices — no module hopping.",
  },
];

// Re-export icon set used by section components that need icons inline.
export {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  FolderKanban,
  Hammer,
  HardHat,
  LayoutDashboard,
  Receipt,
  Search,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
};
