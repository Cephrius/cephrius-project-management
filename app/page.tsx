"use client";

import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ChevronDown,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

const REQUEST_DEMO_HREF = "/request-demo";
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const STAGGER_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const REVEAL_ITEM = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

const HEADER_LINKS = [
  { label: "Dashboard", hasChevron: false },
  { label: "Projects", hasChevron: false },
  { label: "Invoices", hasChevron: false },
  { label: "Settings", hasChevron: false },
  { label: "Search", hasChevron: true },
];

type SidebarItem = {
  label: string;
  icon: LucideIcon;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: FolderOpen },
  { label: "Invoices", icon: FileText },
  { label: "Settings", icon: Settings },
];

const FAVORITES = [
  { label: "North Ridge", tone: "bg-amber-500" },
  { label: "Oakline Homes", tone: "bg-emerald-500" },
  { label: "Westfield", tone: "bg-indigo-500" },
];

const METRIC_CARDS = [
  {
    label: "Schedule Focus",
    value: "12",
    subtitle: "Jobs due today",
    footer: "1 incomplete this week (Feb 15 - Feb 21)",
  },
  {
    label: "Work Pipeline",
    value: "106",
    subtitle: "Open Jobs",
    footer: "26 completed in February",
  },
  {
    label: "Projects",
    value: "153",
    subtitle: "Active Projects",
    footer: "Open Projects",
  },
  {
    label: "Invoices (February 2026)",
    value: "140",
    subtitle: "Invoices Issued",
    footer: "Total Amount Issued: $44,314.00",
  },
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
    id: "123",
    date: "2026-02-20",
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

const TRUSTED_LOGOS = [
  "Cephrius Steel",
  "Oakline Homes",
  "North Ridge",
  "Westfield",
  "Luminous",
];

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
            <div className="rounded-full bg-orange-600 text-white px-2 py-1 text-xs font-medium ">
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
    <main className="min-h-screen bg-muted/25 text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
        <motion.div
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 md:px-8"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="JobSyte home"
            >
              <Image
                src="/banner_light_trans.png"
                alt="JobSyte"
                width={400}
                height={100}
                className="h-7 w-auto dark:hidden"
                priority
              />
              <Image
                src="/banner_dark_trans.png"
                alt="JobSyte"
                width={480}
                height={100}
                className="hidden h-7 w-auto dark:block"
                priority
              />
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              {HEADER_LINKS.map((link) => (
                <button
                  key={link.label}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  type="button"
                >
                  {link.label}
                  {link.hasChevron && <ChevronDown className="size-3.5" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher hideLabel />
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl px-4"
              asChild
            >
              <Link href={REQUEST_DEMO_HREF}>
                Book a demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-16 md:px-8 md:pt-20">
        <motion.section
          className="mx-auto max-w-3xl text-center"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
              Live
            </span>
            Built for contractor teams
          </div>
          <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            Today&apos;s schedule, this week&apos;s pipeline, and billing at a
            glance.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
            JobSyte brings dashboard metrics, jobs calendar, project activity,
            invoice totals, and global search into one workflow.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="rounded-xl px-7" asChild>
              <Link href={REQUEST_DEMO_HREF}>
                Request a demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hidden rounded-xl px-7 md:inline-flex"
              asChild
            >
              <Link href="#dashboard-preview">See dashboard flow</Link>
            </Button>
          </div>
        </motion.section>

        <motion.section
          id="dashboard-preview"
          className="relative mt-14 hidden rounded-3xl border border-border/70 bg-card/95 p-3 shadow-xl shadow-foreground/5 md:left-1/2 md:block md:w-[min(120vw,108rem)] md:-translate-x-1/2 md:p-4"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <aside className="hidden rounded-2xl border border-border/70 bg-background/70 p-3 lg:block">
              <div className="rounded-xl border border-border bg-card px-3 py-2">
                <p className="text-sm font-semibold">Cephrius Steel LLC</p>
                <p className="text-xs text-muted-foreground">JobSyte Portal</p>
              </div>

              <nav className="mt-4 space-y-1">
                {SIDEBAR_ITEMS.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      index === 0
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Favorites
                </p>
                <div className="mt-2 space-y-2">
                  {FAVORITES.map((favorite) => (
                    <div
                      key={favorite.label}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span
                        className={`size-2.5 rounded-sm ${favorite.tone}`}
                      />
                      {favorite.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card px-3 py-2">
                <p className="text-sm font-medium">v0.1.6a</p>
                <p className="text-xs text-muted-foreground">
                  Powered by Cephrius
                </p>
              </div>
            </aside>

            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight">
                    Dashboard
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Today&apos;s schedule, this week&apos;s pipeline, and
                    billing at a glance.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-border"
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <motion.div
                className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                variants={STAGGER_CONTAINER}
                initial={shouldReduceMotion ? "visible" : "hidden"}
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                {METRIC_CARDS.map((metric) => (
                  <motion.article
                    key={metric.label}
                    className="rounded-xl border border-border bg-card p-3"
                    variants={REVEAL_ITEM}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            y: -4,
                            transition: { duration: 0.2, ease: "easeOut" },
                          }
                    }
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-5xl font-semibold tracking-tight">
                      {metric.value}
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {metric.subtitle}
                    </p>
                    <p className="mt-6 text-sm font-medium">{metric.footer}</p>
                  </motion.article>
                ))}
              </motion.div>

              <div className="mt-4 grid gap-3 xl:grid-cols-2">
                <article className="rounded-xl border border-border bg-card p-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Jobs Calendar (Next 12 Months)
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
                                className={`rounded-md border px-0 py-1.5 ${
                                  isActive
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
                        >
                          <p className="text-sm font-semibold">{entry.date}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.detail}
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              entry.status === "Completed"
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
                </article>

                <article className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        Jobs This Week
                      </p>
                      <p className="text-xs text-muted-foreground">
                        All incomplete jobs scheduled for this week.
                      </p>
                    </div>
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs text-primary">
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
                        className="rounded-lg border border-border px-2.5 py-2"
                        variants={REVEAL_ITEM}
                      >
                        <p className="text-sm font-semibold">{job.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.date}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {job.address}
                        </p>
                      </motion.div>
                    ))}

                    {WEEKLY_JOBS.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border px-2.5 py-3 text-sm text-muted-foreground">
                        No incomplete jobs this week.
                      </div>
                    )}
                  </motion.div>
                </article>
              </div>

              <article className="mt-4 rounded-xl border border-border bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Recent Invoices</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground">
                      <Search className="size-3.5" />
                      Search invoices
                    </div>
                    <Button size="sm" variant="outline" className="rounded-lg">
                      View all
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">Invoice #</th>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">
                          Project Address
                        </th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <motion.tbody
                      variants={STAGGER_CONTAINER}
                      initial={shouldReduceMotion ? "visible" : "hidden"}
                      whileInView="visible"
                      viewport={{ once: true, margin: "-80px" }}
                    >
                      {RECENT_INVOICES.map((invoice) => (
                        <motion.tr
                          key={invoice.invoice}
                          className="border-t border-border/70"
                          variants={REVEAL_ITEM}
                        >
                          <td className="px-3 py-2.5 font-medium">
                            {invoice.invoice}
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {invoice.date}
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {invoice.projectAddress}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                invoice.status === "Paid"
                                  ? "bg-emerald-500/10 text-emerald-700"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-medium">
                            {invoice.amount}
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              </article>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mt-14 text-center"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          <p className="text-xl font-medium text-foreground">
            Trusted by contractor teams
          </p>
          <motion.div
            className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-lg font-medium text-muted-foreground"
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {TRUSTED_LOGOS.map((name) => (
              <motion.span key={name} variants={REVEAL_ITEM}>
                {name}
              </motion.span>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          id="collaboration"
          className="mt-20"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Users className="size-4" />
              Operations visibility
            </p>
            <h2 className="mt-4 text-balance text-5xl font-semibold tracking-tight md:text-6xl">
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
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { y: -6, transition: { duration: 0.22, ease: "easeOut" } }
                }
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
      </div>

      <footer className="border-t border-border/60 bg-background/90">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center md:flex-row md:px-8 md:text-left">
          <Link
            href="/"
            className="flex items-center"
            aria-label="JobSyte home"
          >
            <Image
              src="/banner_light_trans.png"
              alt="JobSyte"
              width={400}
              height={100}
              className="h-8 w-auto dark:hidden"
            />
            <Image
              src="/banner_dark_trans.png"
              alt="JobSyte"
              width={480}
              height={100}
              className="hidden h-8 w-auto dark:block"
            />
          </Link>
          <p className="text-sm text-muted-foreground">
            Powered by Cephrius Technologies © 2026
          </p>
        </div>
      </footer>
    </main>
  );
}
