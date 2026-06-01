"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HIGH_VALUE_JOBS,
  JOB_CALENDAR_ENTRIES,
  METRIC_CARDS,
  MONTHLY_SNAPSHOT,
  OVERDUE_JOBS,
  QUICK_ACTIONS,
  RECENT_INVOICES,
  SIDEBAR_NAV,
  WEEKLY_JOBS,
} from "@/components/landing/marketing-data";
import {
  EASE_OUT,
  HOVER_SPRING,
  LIST_CARD_HOVER,
  METRIC_CARD_HOVER,
  REVEAL_ITEM,
  SECTION_ENTER_DURATION,
  STAGGER_CONTAINER,
} from "@/components/landing/marketing-motion";

export function DashboardPreviewSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
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
                aria-label="Add new item"
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
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
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
                    })}
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
                      whileHover={
                        shouldReduceMotion ? undefined : LIST_CARD_HOVER
                      }
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
            </motion.article>

            <div className="flex flex-col gap-3">
              <motion.article
                className="rounded-xl border border-destructive/30 bg-destructive/5 p-3"
                whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
                transition={HOVER_SPRING}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-destructive" />
                  <p className="text-sm font-semibold text-destructive">
                    Overdue Jobs
                  </p>
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
                        <p className="truncate text-sm font-medium">
                          {job.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {job.due}
                        </p>
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
                    <p className="text-sm font-semibold text-primary">
                      Jobs This Week
                    </p>
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
                      whileHover={
                        shouldReduceMotion ? undefined : LIST_CARD_HOVER
                      }
                      transition={HOVER_SPRING}
                    >
                      <p className="text-sm font-medium">{job.id}</p>
                      <p className="text-xs text-muted-foreground">{job.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.address}
                      </p>
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
                  <p className="text-sm font-semibold text-primary">
                    Recent Invoices
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 rounded-md border-primary/30 text-xs hover:bg-primary/10"
                >
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
                    whileHover={
                      shouldReduceMotion ? undefined : LIST_CARD_HOVER
                    }
                    transition={HOVER_SPRING}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {invoice.invoice}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.date}
                      </p>
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
                <p className="text-sm font-semibold text-primary">
                  Top Jobs by Value
                </p>
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
                      <p className="truncate text-sm font-medium">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.project}
                      </p>
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
              <p className="text-sm font-semibold text-primary">
                Quick Actions
              </p>
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
              <p className="text-sm font-semibold text-primary">
                February Snapshot
              </p>
              <p className="text-xs text-muted-foreground">
                At a glance for this month.
              </p>
              <div className="mt-3 space-y-2">
                {MONTHLY_SNAPSHOT.map((row, idx) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-xs text-muted-foreground">
                        {row.label}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {row.value}
                      </span>
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
              <p className="text-sm font-semibold text-muted-foreground">
                💡 Widget Ideas
              </p>
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
  );
}
