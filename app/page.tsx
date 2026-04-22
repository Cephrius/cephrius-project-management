"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  FileText,
  FolderKanban,
  Hammer,
  HardHat,
  LayoutDashboard,
  Plus,
  Receipt,
  Search,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

const REQUEST_DEMO_HREF = "/request-demo";
const SITE_URL = "https://jobsyte.co";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const HEADER_ENTER_DURATION = 1.15;
const HERO_ENTER_DURATION = 1.35;
const SECTION_ENTER_DURATION = 1.15;
const CARD_REVEAL_DURATION = 0.85;
const LOGO_MARQUEE_DURATION = 40;
const HOVER_SPRING = {
  type: "spring",
  stiffness: 135,
  damping: 18,
  mass: 0.9,
} as const;
const HOVER_CARD_SHADOW = "0 24px 60px -32px hsl(var(--primary) / 0.35)";
const HOVER_SOFT_SHADOW = "0 18px 40px -28px hsl(var(--primary) / 0.28)";
const CTA_HOVER = {
  y: -3,
  scale: 1.02,
  boxShadow: "0 22px 48px -24px hsl(var(--primary) / 0.55)",
} as const;
const METRIC_CARD_HOVER = {
  y: -6,
  scale: 1.014,
  boxShadow: HOVER_CARD_SHADOW,
} as const;
const LIST_CARD_HOVER = {
  y: -3,
  scale: 1.008,
  boxShadow: HOVER_SOFT_SHADOW,
} as const;
const LOGO_CARD_HOVER = {
  y: -6,
  scale: 1.035,
  rotate: -0.45,
  boxShadow: HOVER_SOFT_SHADOW,
} as const;
const COLLABORATION_CARD_HOVER = {
  y: -10,
  scale: 1.012,
  rotateX: 1.8,
  boxShadow: HOVER_CARD_SHADOW,
} as const;
const FEATURE_HIGHLIGHTS = [
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
const FAQ_ITEMS = [
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

const HOME_PAGE_STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "JobSyte",
    url: SITE_URL,
    logo: `${SITE_URL}/image.png`,
    email: "sales@jobsyte.com",
    description:
      "Construction project management software built for sub-contractors working with national home builders.",
    foundingDate: "2025",
    parentOrganization: {
      "@type": "Organization",
      name: "Cephrius Technologies",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JobSyte",
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: "JobSyte",
      url: SITE_URL,
    },
    inLanguage: "en-US",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JobSyte",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "ProjectManagementApplication",
    operatingSystem: "Web, iOS, Android",
    url: SITE_URL,
    description:
      "JobSyte helps contractors manage projects, schedule jobs, track invoices, and keep field and office teams aligned in one workflow.",
    featureList: [
      "Project management",
      "12-month job scheduling",
      "Crew and roster management",
      "Invoice issuance and reconciliation",
      "Payroll queue",
      "Profitability and accounting snapshots",
      "Global search across projects, jobs, employees, and invoices",
      "Role-based, company-scoped access",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/request-demo`,
    },
    audience: {
      "@type": "Audience",
      audienceType: "Contractors, subcontractors, and home builders",
    },
    publisher: {
      "@type": "Organization",
      name: "JobSyte",
      url: SITE_URL,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  },
];
const HERO_STAGGER_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};
const HERO_ITEM = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: HERO_ENTER_DURATION * 0.66, ease: EASE_OUT },
  },
};
const STAGGER_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.14,
    },
  },
};

const REVEAL_ITEM = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: CARD_REVEAL_DURATION, ease: EASE_OUT },
  },
};

const SIDEBAR_NAV = [
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

const METRIC_CARDS = [
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

const HIGH_VALUE_JOBS = [
  { rank: 1, title: "Final Grade", project: "35523 Pontiac Dr", amount: "$8,450" },
  { rank: 2, title: "Pad Build", project: "112 Sample Street", amount: "$6,200" },
  { rank: 3, title: "Rough Grade", project: "1093 Sample Street", amount: "$4,980" },
];

const OVERDUE_JOBS = [
  { title: "Knockdown", due: "2026-02-18", project: "1123 Sample Street" },
  { title: "Final Grade", due: "2026-02-19", project: "78 Birch Ln" },
];

const MONTHLY_SNAPSHOT = [
  { label: "Jobs completed", value: "26" },
  { label: "Invoices issued", value: "140" },
  { label: "Revenue billed", value: "$44,314" },
  { label: "Completion rate", value: "78%" },
];

const QUICK_ACTIONS = [
  { label: "New Project", icon: FolderKanban },
  { label: "New Invoice", icon: DollarSign },
  { label: "Search", icon: BarChart3 },
  { label: "Settings", icon: CheckCircle2 },
];

const JOB_CALENDAR_ENTRIES = [
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

const WEEKLY_JOBS = [
  {
    id: "Pad Build",
    date: "2026-02-20",
    address: "35523 Pontiac Dr",
  },
   {
    id: "Knockdown",
    date: "2026-02-23",
    address: "35523 Pontiac Dr",
  },
   {
    id: "Final Grade",
    date: "2026-03-04",
    address: "35523 Pontiac Dr",
  },
   {
    id: "Framing",
    date: "2026-03-16",
    address: "35523 Pontiac Dr",
  },
];

const RECENT_INVOICES = [
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

const HOME_BUILDER_LOGOS = [
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

const HOME_BUILDER_LOGO_WHEEL = [...HOME_BUILDER_LOGOS, ...HOME_BUILDER_LOGOS];

type CollaborationCard = {
  title: string;
  description: string;
  visual: "invite" | "edit" | "feedback";
};

const COLLABORATION_CARDS: CollaborationCard[] = [
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

function CollaborationVisual({
  visual,
}: {
  visual: CollaborationCard["visual"];
}) {
  if (visual === "invite") {
    return (
      <div className="space-y-3">
        {[
          { name: "Knockdown", line: "24151 Wayland St", badge: "Due today" },
          { name: "Rough Grade", line: "35523 Pontiac Dr", badge: "Due today" },
          {
            name: "Final Grade",
            line: "112 Sample Street",
            badge: "Incomplete",
          },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.line}</p>
            </div>
            <div className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              {item.badge}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visual === "edit") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-background p-3">
          <p className="text-sm font-medium">Project 35523 Pontiac Dr</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Jobs: Rough Grade, Final Grade, Inspection.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Pipeline Status</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              106 open
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            {["Projects", "Jobs", "Invoices"].map((name) => (
              <span
                key={name}
                className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Invoice Summary</p>
          <p className="mt-1 text-xs text-muted-foreground">
            140 invoices issued in February. Total amount issued: $44,314.00.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>
      <div className="mt-3 rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-xs text-muted-foreground">
        Recent invoice: INV-2060204-9236
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Billing snapshot</span>
        <span>Open Invoices</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Keep marketing schema in the HTML so crawlers can match it with the page copy. */}
      {HOME_PAGE_STRUCTURED_DATA.map((schema, index) => (
        <script
          key={`jobsyte-home-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
        <motion.div
          className="absolute -top-40 left-[-10rem] h-[34rem] w-[34rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklch, var(--primary) 35%, transparent) 0%, transparent 70%)",
            willChange: "transform, opacity",
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, 96, 0],
                  scale: [1, 1.06, 1],
                  opacity: [0.7, 0.95, 0.7],
                }
          }
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-56 right-[-12rem] h-[38rem] w-[38rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklch, var(--primary) 22%, transparent) 0%, transparent 72%)",
            willChange: "transform, opacity",
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, -78, 0],
                  scale: [1, 1.05, 1],
                  opacity: [0.6, 0.9, 0.6],
                }
          }
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <motion.div
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 md:px-8"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: HEADER_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="JobSyte home"
            >
              <Image
                src="/banner_dark_trans.png"
                alt="JobSyte"
                width={400}
                height={100}
                className="h-8 sm:h-9 md:h-10 w-auto"
                priority
              />
            </Link>
          </div>
      
          <div className="hidden items-center gap-2 justify-end md:flex">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-4"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="rounded-full px-4 shadow-sm"
              asChild
            >
              <Link href={REQUEST_DEMO_HREF}>
                Request a demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-12 sm:pt-16 md:px-8 md:pt-20">
        <motion.section
          className="mx-auto max-w-3xl text-center"
          variants={HERO_STAGGER_CONTAINER}
          initial={shouldReduceMotion ? "visible" : "hidden"}
          animate="visible"
        >
          <motion.div
            variants={HERO_ITEM}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-foreground/80 shadow-sm"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              <Sparkles className="size-3" />
              Live
            </span>
            Now in early access for sub-contractors
          </motion.div>
          <motion.h1
            variants={HERO_ITEM}
            className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Construction project management,{" "}
            <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
              built for the field
            </span>
          </motion.h1>
          <motion.p
            variants={HERO_ITEM}
            className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            JobSyte keeps projects, job schedules, invoices, dashboard
            reporting, and global search in one workflow — so your field and
            office teams move as one.
          </motion.p>

          <motion.div
            variants={HERO_ITEM}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.div
              whileHover={shouldReduceMotion ? undefined : CTA_HOVER}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={HOVER_SPRING}
            >
              <Button size="lg" className="rounded-full px-7 shadow-md" asChild>
                <Link href={REQUEST_DEMO_HREF}>
                  Request a demo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            variants={HERO_ITEM}
            className="mt-7 hidden items-center justify-center text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground md:flex"
            animate={
              shouldReduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }
            }
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            Scroll to explore
            <ChevronDown className="ml-2 size-4" />
          </motion.div>
        </motion.section>

        <motion.section
          id="dashboard-preview"
          className="relative mt-16 hidden rounded-3xl border border-primary/20 bg-sidebar/40 p-3 shadow-2xl shadow-primary/10 backdrop-blur supports-backdrop-filter:bg-sidebar/40 min-[1025px]:left-1/2 min-[1025px]:block min-[1025px]:w-[min(96vw,108rem)] min-[1025px]:-translate-x-1/2 min-[1025px]:p-4 min-[1440px]:w-[min(97vw,120rem)]"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <aside className="hidden flex-col rounded-2xl border border-border/70 bg-card/80 p-3 lg:flex">
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                  AC
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Acme Construction</p>
                  <p className="text-xs text-muted-foreground">JobSyte Portal</p>
                </div>
              </div>

              <nav className="mt-4 space-y-0.5">
                {SIDEBAR_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                        item.active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </div>
                  );
                })}
              </nav>

              <div className="mt-auto rounded-xl border border-border bg-card px-3 py-2">
                <p className="text-sm font-medium">v0.2.1</p>
                <p className="text-xs text-muted-foreground">Powered by Cephrius</p>
              </div>
            </aside>

            <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-foreground/80 font-medium">Dashboard</span>
                  <span>/</span>
                  <span>Overview</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground sm:flex">
                    <Search className="size-3.5" />
                    Search projects, jobs, invoices…
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-border"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-semibold text-primary">Dashboard</h2>
                <p className="text-sm text-muted-foreground">
                  Today&apos;s schedule, this week&apos;s pipeline, and billing at a glance.
                </p>
              </div>

              <motion.div
                className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                variants={STAGGER_CONTAINER}
                initial={shouldReduceMotion ? "visible" : "hidden"}
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                {METRIC_CARDS.map((metric) => {
                  const Icon = metric.icon;
                  const FooterIcon = metric.footerIcon ?? Clock;
                  return (
                    <motion.article
                      key={metric.label}
                      className="rounded-xl border border-primary/20 bg-card p-3"
                      variants={REVEAL_ITEM}
                      whileHover={shouldReduceMotion ? undefined : METRIC_CARD_HOVER}
                      transition={HOVER_SPRING}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="size-4 text-primary" />
                        </div>
                        <p className="text-xs font-medium text-primary/80">
                          {metric.label}
                        </p>
                      </div>
                      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">
                        {metric.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                      <div className="my-3 h-px bg-border/70" />
                      {metric.accent === "progress" ? (
                        <>
                          <div className="flex items-center gap-1.5 text-xs">
                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{metric.footer}</span>
                          </div>
                          <div className="mt-2">
                            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>Completion rate</span>
                              <span className="font-medium">{metric.progress}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${metric.progress}%` }}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 text-xs">
                            <FooterIcon className="size-3.5 text-muted-foreground" />
                            <span>{metric.footer}</span>
                          </div>
                          <p className="mt-0.5 pl-5 text-[11px] text-muted-foreground">
                            {metric.footerMeta}
                          </p>
                        </>
                      )}
                    </motion.article>
                  );
                })}
              </motion.div>

              <div className="mt-4 grid gap-3 xl:grid-cols-[2fr_1fr]">
                <motion.article
                  className="rounded-xl border border-primary/20 bg-card p-3"
                  whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                  transition={HOVER_SPRING}
                >
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Jobs Calendar · Next 12 Months
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Browse future months to view scheduled jobs, then select a
                      date for details.
                    </p>
                  </div>

                  <div className="mt-3 grid gap-4 lg:grid-cols-[240px_1fr]">
                    <div>
                      <p className="text-sm font-medium">February 2026</p>
                      <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-xs">
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(
                          (day) => {
                            const isActive = day === 26;
                            const isMarked = [
                              1, 5, 6, 10, 11, 12, 18, 20, 23, 24, 25, 27, 28,
                            ].includes(day);
                            return (
                              <div
                                key={day}
                                className={`rounded-md border px-0 py-1.5 ${isActive
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : isMarked
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-transparent bg-background text-muted-foreground"
                                  }`}
                              >
                                {day}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    <motion.div
                      className="space-y-2"
                      variants={STAGGER_CONTAINER}
                      initial={shouldReduceMotion ? "visible" : "hidden"}
                      whileInView="visible"
                      viewport={{ once: true, margin: "-80px" }}
                    >
                      {JOB_CALENDAR_ENTRIES.map((entry) => (
                        <motion.div
                          key={`${entry.date}-${entry.title}`}
                          className="rounded-lg border border-border p-2.5"
                          variants={REVEAL_ITEM}
                          whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                          transition={HOVER_SPRING}
                        >
                          <p className="text-sm font-semibold">{entry.date}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.detail}
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${entry.status === "Completed"
                              ? "bg-emerald-500/15 text-emerald-700"
                              : "bg-muted text-muted-foreground"
                              }`}
                          >
                            {entry.status}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.article>

                <div className="flex flex-col gap-3">
                  <motion.article
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-3"
                    whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                    transition={HOVER_SPRING}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-destructive" />
                      <p className="text-sm font-semibold text-destructive">Overdue Jobs</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {OVERDUE_JOBS.length} jobs past scheduled date
                    </p>
                    <div className="mt-3 space-y-2">
                      {OVERDUE_JOBS.map((job) => (
                        <div
                          key={job.title}
                          className="flex items-start justify-between gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{job.title}</p>
                            <p className="text-xs text-muted-foreground">Due: {job.due}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">
                            Overdue
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.article>

                  <motion.article
                    className="rounded-xl border border-primary/20 bg-card p-3"
                    whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                    transition={HOVER_SPRING}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-primary">Jobs This Week</p>
                        <p className="text-xs text-muted-foreground">
                          Incomplete jobs scheduled for this week.
                        </p>
                      </div>
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {WEEKLY_JOBS.length}
                      </span>
                    </div>

                    <motion.div
                      className="mt-3 space-y-2"
                      variants={STAGGER_CONTAINER}
                      initial={shouldReduceMotion ? "visible" : "hidden"}
                      whileInView="visible"
                      viewport={{ once: true, margin: "-80px" }}
                    >
                      {WEEKLY_JOBS.map((job) => (
                        <motion.div
                          key={job.id}
                          className="rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2 dark:bg-primary/10"
                          variants={REVEAL_ITEM}
                          whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                          transition={HOVER_SPRING}
                        >
                          <p className="text-sm font-medium">{job.id}</p>
                          <p className="text-xs text-muted-foreground">{job.date}</p>
                          <p className="text-xs text-muted-foreground">{job.address}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.article>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <motion.article
                  className="rounded-xl border border-primary/20 bg-card p-3"
                  whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                  transition={HOVER_SPRING}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <p className="text-sm font-semibold text-primary">Recent Invoices</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 rounded-md border-primary/30 text-xs hover:bg-primary/10">
                      View all
                    </Button>
                  </div>

                  <motion.div
                    className="mt-3 space-y-2"
                    variants={STAGGER_CONTAINER}
                    initial={shouldReduceMotion ? "visible" : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                  >
                    {RECENT_INVOICES.map((invoice) => (
                      <motion.div
                        key={invoice.invoice}
                        className="flex items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 p-2.5 dark:bg-primary/10"
                        variants={REVEAL_ITEM}
                        whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                        transition={HOVER_SPRING}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{invoice.invoice}</p>
                          <p className="text-xs text-muted-foreground">{invoice.date}</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {invoice.amount}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.article>

                <motion.article
                  className="rounded-xl border border-primary/20 bg-card p-3"
                  whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                  transition={HOVER_SPRING}
                >
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-semibold text-primary">Top Jobs by Value</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Highest-priced jobs this period.
                  </p>

                  <motion.div
                    className="mt-3 space-y-2"
                    variants={STAGGER_CONTAINER}
                    initial={shouldReduceMotion ? "visible" : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                  >
                    {HIGH_VALUE_JOBS.map((job) => (
                      <motion.div
                        key={job.title}
                        className="flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 p-2.5 dark:bg-primary/10"
                        variants={REVEAL_ITEM}
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {job.rank}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.project}</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                          {job.amount}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.article>
              </div>

              <div className="mt-4 grid gap-3 grid-cols-1 lg:grid-cols-3">
                <motion.article
                  className="rounded-xl border border-primary/20 bg-card p-3"
                  whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                  transition={HOVER_SPRING}
                >
                  <p className="text-sm font-semibold text-primary">Quick Actions</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {QUICK_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <div
                          key={action.label}
                          className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-background py-5 text-center transition-colors hover:bg-primary/10"
                        >
                          <Icon className="size-5 text-primary" />
                          <span className="text-[11px] font-medium leading-tight">
                            {action.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.article>

                <motion.article
                  className="rounded-xl border border-primary/20 bg-card p-3"
                  whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                  transition={HOVER_SPRING}
                >
                  <p className="text-sm font-semibold text-primary">February Snapshot</p>
                  <p className="text-xs text-muted-foreground">At a glance for this month.</p>
                  <div className="mt-3 space-y-2">
                    {MONTHLY_SNAPSHOT.map((row, idx) => (
                      <div key={row.label}>
                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-xs text-muted-foreground">{row.label}</span>
                          <span className="text-sm font-semibold tabular-nums">{row.value}</span>
                        </div>
                        {idx < MONTHLY_SNAPSHOT.length - 1 && (
                          <div className="h-px bg-border/70" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.article>

                <motion.article
                  className="rounded-xl border border-dashed border-primary/20 bg-card p-3"
                  whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                  transition={HOVER_SPRING}
                >
                  <p className="text-sm font-semibold text-muted-foreground">💡 Widget Ideas</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Notifications panel: upcoming deadlines, expiring documents.
                    <br />
                    Project health indicators based on completion rate.
                    <br />
                    Revenue forecasts from open jobs and historical conversions.
                  </p>
                </motion.article>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="features"
          className="mt-20"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-4" />
              Why JobSyte
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Everything a sub-contractor needs, none of the noise
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
              Six core surfaces, one shared source of truth. JobSyte was built
              alongside crews in the field, not assumed from a spreadsheet.
            </p>
          </div>

          <motion.div
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {FEATURE_HIGHLIGHTS.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  variants={REVEAL_ITEM}
                  whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                  transition={HOVER_SPRING}
                  className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur transition-colors hover:border-primary/40"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                  />
                  <div className="relative flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="relative mt-5 text-lg font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="relative mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.article>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section
          id="how-it-works"
          className="mt-24"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <CalendarClock className="size-4" />
              How JobSyte fits your day
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              From morning huddle to end-of-month billing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
              JobSyte mirrors how sub-contractors actually work — schedule the
              week, dispatch crews, capture the work, and bill it out without
              re-keying anything.
            </p>
          </div>

          <motion.div
            className="mt-12 grid gap-4 lg:grid-cols-3"
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {[
              {
                step: "01",
                icon: CalendarDays,
                title: "Plan the week",
                body: "Open the 12-month calendar to see what's due, assign crews, and flag overdue jobs before they slip.",
                bullets: ["Drag-aware scheduling", "Superintendent assignment", "Overdue alerts"],
              },
              {
                step: "02",
                icon: HardHat,
                title: "Run the day",
                body: "Field crews see today's stops, mark jobs complete, and the dashboard updates the office in real time.",
                bullets: ["Mobile-first crew view", "One-tap completion", "Live pipeline counters"],
              },
              {
                step: "03",
                icon: Receipt,
                title: "Bill it out",
                body: "Convert completed jobs into invoices, track issued vs. paid, and reconcile against the project ledger.",
                bullets: ["Job → invoice in one click", "Paid / Issued tracking", "Monthly revenue snapshot"],
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <motion.article
                  key={step.step}
                  variants={REVEAL_ITEM}
                  whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                  transition={HOVER_SPRING}
                  className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-xs font-mono font-semibold tracking-widest text-primary/40">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                  <ul className="mt-4 space-y-1.5">
                    {step.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                        <span className="text-foreground/80">{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section
          id="modules"
          className="mt-24"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="grid items-end gap-6 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <LayoutDashboard className="size-4" />
                One workspace for the whole business
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                Every module, wired together
              </h2>
            </div>
            <p className="text-muted-foreground md:text-lg">
              No more juggling spreadsheets, calendars, and accounting docs.
              Projects feed jobs, jobs feed invoices, invoices feed accounting —
              and a single search bar covers all of it.
            </p>
          </div>

          <motion.div
            className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {[
              { icon: FolderKanban, title: "Projects", body: "Centralize project addresses, superintendents, and active scope." },
              { icon: CalendarDays, title: "Jobs", body: "Schedule, assign, and complete jobs against any active project." },
              { icon: HardHat, title: "Employees & Crews", body: "Roster, crew composition, and workforce analytics in one view." },
              { icon: Wallet, title: "Payroll", body: "Ready-to-pay queue with crew capacity and assignment load." },
              { icon: Receipt, title: "Invoices", body: "Issue, search, and reconcile invoices against project addresses." },
              { icon: BarChart3, title: "Accounting", body: "Project profitability and revenue snapshots for the month." },
              { icon: Search, title: "Global Search", body: "Find any project, employee, crew, payment, or invoice instantly." },
              { icon: Settings, title: "Settings", body: "Per-company preferences, release notes, and team controls." },
            ].map((mod) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.title}
                  variants={REVEAL_ITEM}
                  whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                  transition={HOVER_SPRING}
                  className="rounded-xl border border-primary/20 bg-card/80 p-4 backdrop-blur transition-colors hover:border-primary/40"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <p className="mt-3 text-sm font-semibold">{mod.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{mod.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section
          className="mt-24"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-card/40 p-8 backdrop-blur md:p-10">
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { value: "1", label: "Login that opens every workflow" },
                { value: "8", label: "Modules wired into a shared ledger" },
                { value: "12mo", label: "Forward calendar visibility" },
                { value: "0", label: "Spreadsheets you need to maintain" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-semibold tracking-tight text-primary md:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mt-24 text-center"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Trusted by sub-contractors working with national builders
          </p>
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card/70 py-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
            <motion.div
              className="flex w-max items-center gap-4 px-4"
              animate={
                shouldReduceMotion ? undefined : { x: ["0%", "-50%"] }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: LOGO_MARQUEE_DURATION, ease: "linear", repeat: Infinity }
              }
              style={{ willChange: "transform" }}
            >
              {HOME_BUILDER_LOGO_WHEEL.map((logo, index) => (
                <motion.div
                  key={`${logo.src}-${index}`}
                  className="flex h-20 w-44 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white px-4 py-3 shadow-sm ring-1 ring-black/5"
                  whileHover={shouldReduceMotion ? undefined : LOGO_CARD_HOVER}
                  transition={HOVER_SPRING}
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={176}
                    height={68}
                    className="h-auto max-h-12 w-full object-contain"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="collaboration"
          className="mt-20"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Users className="size-4" />
              Operations visibility
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Run projects, jobs, and invoices from one dashboard
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              JobSyte keeps schedule focus, pipeline health, and billing
              activity connected so your team can move faster with fewer
              handoffs.
            </p>
          </div>

          <motion.div
            className="mt-10 grid gap-6 lg:grid-cols-3"
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {COLLABORATION_CARDS.map((card) => (
              <motion.article
                key={card.title}
                variants={REVEAL_ITEM}
                style={{ transformPerspective: 1200 }}
                whileHover={
                  shouldReduceMotion ? undefined : COLLABORATION_CARD_HOVER
                }
                transition={HOVER_SPRING}
              >
                <div className="rounded-3xl border border-border bg-card p-5">
                  <CollaborationVisual visual={card.visual} />
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                  {card.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{card.description}</p>
                <Link
                  href={REQUEST_DEMO_HREF}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  Explore module
                  <ArrowRight className="size-4" />
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="mt-24"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <HardHat className="size-4" />
              Built for sub-contractor reality
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Stop pretending PM software made for general contractors fits your crew
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              JobSyte was shaped by sub-contractors running grading, framing,
              and finishing crews. Every screen earns its place — nothing
              exists just because enterprise PM tools have it.
            </p>
          </div>

          <motion.div
            className="mt-10 grid gap-4 md:grid-cols-2"
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {[
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
            ].map((row, idx) => (
              <motion.article
                key={`pain-${idx}`}
                variants={REVEAL_ITEM}
                whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                transition={HOVER_SPRING}
                className="grid gap-4 rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur md:grid-cols-2"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="size-5 shrink-0 text-destructive" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                      Before JobSyte
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{row.pain}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      With JobSyte
                    </p>
                    <p className="mt-1 text-sm text-foreground">{row.fix}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="mt-24"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-4" />
              Capabilities
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Everything you need to run a sub-contracting business — already wired up
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Not a roadmap. Not coming soon. These are the surfaces shipping
              in JobSyte today.
            </p>
          </div>

          <motion.div
            className="mt-10 grid gap-4 md:grid-cols-2"
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {[
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
            ].map(({ Icon, title, outcome }) => (
              <motion.article
                key={title}
                variants={REVEAL_ITEM}
                whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                transition={HOVER_SPRING}
                className="rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur"
              >
                <div className="flex size-10 items-center justify-center rounded-lg border border-border/70 bg-background text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{outcome}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="mt-24"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <FileText className="size-4" />
              Frequently asked
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              The questions sub-contractors actually ask before switching
            </h2>
          </div>

          <motion.div
            className="mt-10 grid gap-4 md:grid-cols-2"
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {FAQ_ITEMS.map(({ q, a }) => (
              <motion.article
                key={q}
                variants={REVEAL_ITEM}
                whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                transition={HOVER_SPRING}
                className="rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur"
              >
                <h3 className="text-base font-semibold tracking-tight">{q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>
      </div>

      <footer className="relative z-10 border-t border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center" aria-label="JobSyte home">
                <Image
                  src="/banner_dark_trans.png"
                  alt="JobSyte"
                  width={400}
                  height={100}
                  className="h-9 w-auto dark:hidden"
                />
                <Image
                  src="/banner_dark_trans.png"
                  alt="JobSyte"
                  width={400}
                  height={100}
                  className="hidden h-9 w-auto dark:block"
                />
              </Link>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                Construction project management built for sub-contractors. Keep
                your field and office on the same page.
              </p>
            </div>
           
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Account</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
                <li><Link href={REQUEST_DEMO_HREF} className="hover:text-foreground">Get started</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Contact</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:sales@jobsyte.com" className="hover:text-foreground">sales@jobsyte.com</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
            <p>© 2026 JobSyte. All rights reserved.</p>
            <p>Powered by Cephrius Technologies</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
