"use client";

import { useMemo, useState } from "react";
import { format, isSameMonth, isValid, parse, startOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ToggleJobCompleteButton } from "@/components/dashboard/toggle-job-complete-button";

const SELECTED_JOBS_VISIBLE_COUNT = 3;

export type CalendarJob = {
  id: string;
  title: string;
  scheduled_completion: string;
  is_completed: boolean;
  project_address: string;
  superintendent: string | null;
  price_cents?: number | null;
};

function parseYmd(value: string): Date {
  return parse(value, "yyyy-MM-dd", new Date());
}

function formatCurrency(cents: number | null | undefined) {
  if (!cents) return "$0.00";
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export function MonthJobsCalendar({
  jobs,
  monthStart,
  calendarEnd,
}: {
  jobs: CalendarJob[];
  monthStart: string;
  calendarEnd: string;
}) {
  const currentMonth = useMemo(
    () => startOfMonth(parseYmd(monthStart)),
    [monthStart],
  );
  const lastCalendarMonth = useMemo(
    () => startOfMonth(parseYmd(calendarEnd)),
    [calendarEnd],
  );

  // Group jobs by date once so the calendar highlights and detail panel can read
  // from the same source of truth.
  const jobsByDate = useMemo(() => {
    const groupedJobs = new Map<string, CalendarJob[]>();

    for (const job of jobs) {
      const existingJobs = groupedJobs.get(job.scheduled_completion) ?? [];
      existingJobs.push(job);
      groupedJobs.set(job.scheduled_completion, existingJobs);
    }

    for (const [dateKey, dateJobs] of groupedJobs) {
      groupedJobs.set(
        dateKey,
        [...dateJobs].sort((left, right) => left.title.localeCompare(right.title)),
      );
    }

    return groupedJobs;
  }, [jobs]);

  const scheduledDateKeys = useMemo(
    () => Array.from(jobsByDate.keys()).sort((left, right) => left.localeCompare(right)),
    [jobsByDate],
  );

  const highlightedDates = useMemo(
    () => scheduledDateKeys.map(parseYmd).filter((date) => isValid(date)),
    [scheduledDateKeys],
  );

  const firstCurrentMonthJobDate = useMemo(() => {
    for (const dateKey of scheduledDateKeys) {
      const parsedDate = parseYmd(dateKey);
      if (isSameMonth(parsedDate, currentMonth)) return parsedDate;
    }

    return null;
  }, [currentMonth, scheduledDateKeys]);

  // Selected date handling stays inside the current month now that future-month
  // navigation is intentionally disabled.
  const initialSelectedDate = useMemo(() => {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    if (jobsByDate.has(todayKey)) {
      const parsedToday = parseYmd(todayKey);
      if (isSameMonth(parsedToday, currentMonth)) return parsedToday;
    }

    if (firstCurrentMonthJobDate) return firstCurrentMonthJobDate;

    return currentMonth;
  }, [currentMonth, firstCurrentMonthJobDate, jobsByDate]);

  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);

  function handleDateSelect(nextDate: Date | undefined) {
    if (!nextDate) return;

    setSelectedDate(nextDate);
  }

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedJobs = jobsByDate.get(selectedDateKey) ?? [];
  const completedSelectedJobs = selectedJobs.filter(
    (job) => job.is_completed,
  ).length;

  return (
    <div className="grid h-full min-h-0 gap-2 lg:grid-cols-[minmax(18rem,0.92fr)_minmax(0,1.08fr)]">
      <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-xs dark:border-white/8 dark:bg-card/90">
        <div className="flex min-h-0 flex-1 items-start justify-center overflow-hidden p-2">
          {/* DayPicker shows the current month first, then lets users browse upcoming scheduled months. */}
          <Calendar
            className="w-full max-w-[18.5rem] rounded-xl bg-muted/20 p-1.5 text-card-foreground dark:bg-white/[0.03] dark:text-foreground [&_[data-day]]:text-foreground [&_[data-day]]:hover:bg-muted/55 dark:[&_[data-day]]:hover:bg-white/[0.06] [&_[data-selected-single=true]]:bg-primary/14 [&_[data-selected-single=true]]:text-foreground [&_[data-selected-single=true]]:ring-1 [&_[data-selected-single=true]]:ring-primary/30 dark:[&_[data-selected-single=true]]:bg-primary/24 dark:[&_[data-selected-single=true]]:text-primary-foreground dark:[&_[data-selected-single=true]]:ring-primary/35 [--cell-size:--spacing(6.5)] sm:max-w-80 sm:p-2 sm:[--cell-size:--spacing(7.5)]"
            buttonVariant="ghost"
            mode="single"
            required
            defaultMonth={currentMonth}
            fromMonth={currentMonth}
            toMonth={lastCalendarMonth}
            showOutsideDays={false}
            selected={selectedDate}
            onSelect={handleDateSelect}
            modifiers={{ hasJobs: highlightedDates }}
            modifiersClassNames={{
              hasJobs:
                "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary/70 dark:after:bg-primary/80",
            }}
            classNames={{
              // Keep dark mode on the same muted/card palette as the rest of the dashboard.
              root: "relative w-full max-w-full",
              months: "flex w-full justify-center",
              month: "flex w-full max-w-full flex-col gap-1.5",
              month_caption:
                "relative flex h-8 items-center justify-center px-8",
              caption_label:
                "truncate text-xs font-semibold text-foreground dark:text-foreground sm:text-sm",
              nav: "absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-between px-1",
              button_previous:
                "size-7 rounded-full bg-transparent p-0 text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground disabled:pointer-events-none disabled:opacity-30 dark:text-muted-foreground dark:hover:bg-transparent dark:hover:text-foreground [&_svg]:size-4",
              button_next:
                "size-7 rounded-full bg-transparent p-0 text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground disabled:pointer-events-none disabled:opacity-30 dark:text-muted-foreground dark:hover:bg-transparent dark:hover:text-foreground [&_svg]:size-4",
              weekdays: "mt-1.5 flex",
              weekday:
                "flex-1 select-none rounded-md text-center text-[0.68rem] font-medium text-muted-foreground dark:text-muted-foreground sm:text-[0.72rem]",
              week: "mt-0.5 flex w-full sm:mt-1",
              day: "relative aspect-square flex-1 rounded-md p-0 text-center",
              today:
                "rounded-md bg-muted/80 text-foreground ring-1 ring-border/70 dark:bg-white/[0.06] dark:text-foreground dark:ring-white/10",
            }}
          />
        </div>
      </section>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-xs dark:border-white/8 dark:bg-card/90">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/80 bg-muted/25 px-3 py-2.5 dark:border-white/8 dark:bg-white/[0.03]">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              <span className="block lg:hidden">
                {format(selectedDate, "EEE, MMM d")}
              </span>
              <span className="hidden lg:block">
                {format(selectedDate, "EEEE, MMM d, yyyy")}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {completedSelectedJobs}/{selectedJobs.length} complete
            </div>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 border-primary/25 bg-primary/10 text-primary dark:border-primary/20 dark:bg-primary/14 dark:text-primary-foreground"
          >
            {selectedJobs.length} job{selectedJobs.length === 1 ? "" : "s"}
          </Badge>
        </div>

        {selectedJobs.length === 0 ? (
          // Empty state rendering stays in the details pane so the calendar can
          // keep its place while users browse dates with no scheduled work.
          <div className="m-3 rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.03]">
            No jobs scheduled for this date.
          </div>
        ) : (
          <div className="min-h-0 flex-1 divide-y divide-border/80 overflow-y-auto dark:divide-white/8">
            {selectedJobs.map((job) => (
              <article
                key={job.id}
                className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/35 dark:hover:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">
                    {job.title}
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {job.project_address}
                  </div>
                  {job.superintendent ? (
                    <div className="truncate text-[12px] text-muted-foreground">
                      Supt / GC: {job.superintendent}
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {job.price_cents ? (
                    <div className="text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(job.price_cents)}
                    </div>
                  ) : null}

                  {job.is_completed ? (
                    <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Completed
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge
                        className="hidden border border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 sm:inline-flex"
                        variant="secondary"
                      >
                        Incomplete
                      </Badge>
                      <ToggleJobCompleteButton jobId={job.id} compact />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {selectedJobs.length > SELECTED_JOBS_VISIBLE_COUNT ? (
          <div className="shrink-0 border-t border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground dark:border-white/8 dark:bg-white/[0.03]">
            Scroll to view all {selectedJobs.length} jobs for this date.
          </div>
        ) : null}
      </section>
    </div>
  );
}
