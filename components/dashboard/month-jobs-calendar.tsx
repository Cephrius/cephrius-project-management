"use client";

import { useMemo, useState } from "react";
import { format, isValid, parse } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

export type CalendarJob = {
  id: string;
  title: string;
  scheduled_completion: string;
  is_completed: boolean;
  project_address: string;
  superintendent: string | null;
};

function parseYmd(value: string): Date {
  return parse(value, "yyyy-MM-dd", new Date());
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
  const monthDate = useMemo(() => parseYmd(monthStart), [monthStart]);
  const monthEndDate = useMemo(() => parseYmd(calendarEnd), [calendarEnd]);

  const jobsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarJob[]>();
    for (const job of jobs) {
      const existing = grouped.get(job.scheduled_completion) ?? [];
      existing.push(job);
      grouped.set(job.scheduled_completion, existing);
    }

    for (const [key, value] of grouped) {
      grouped.set(
        key,
        [...value].sort((a, b) => a.title.localeCompare(b.title)),
      );
    }

    return grouped;
  }, [jobs]);

  const highlightedDates = useMemo(() => {
    return Array.from(jobsByDate.keys())
      .map((d) => parseYmd(d))
      .filter((d) => isValid(d));
  }, [jobsByDate]);

  const initialSelected = useMemo(() => {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    if (jobsByDate.has(todayKey)) return parseYmd(todayKey);

    const firstKey = Array.from(jobsByDate.keys()).sort((a, b) =>
      a.localeCompare(b),
    )[0];
    if (firstKey) {
      const parsed = parseYmd(firstKey);
      if (isValid(parsed)) return parsed;
    }

    return monthDate;
  }, [jobsByDate, monthDate]);

  const [selectedDate, setSelectedDate] = useState<Date>(initialSelected);

  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const selectedJobs = jobsByDate.get(selectedKey) ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex justify-center lg:justify-start">
        <Calendar
          mode="single"
          required
          defaultMonth={monthDate}
          fromMonth={monthDate}
          toMonth={monthEndDate}
          showOutsideDays={false}
          selected={selectedDate}
          onSelect={(date) => {
            if (date) setSelectedDate(date);
          }}
          modifiers={{ hasJobs: highlightedDates }}
          modifiersClassNames={{
            hasJobs:
              "bg-primary/10 text-primary font-semibold ring-1 ring-primary/30",
          }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">
            {format(selectedDate, "EEE, MMM d")}
          </div>
          <Badge variant="secondary">
            {selectedJobs.length} job{selectedJobs.length === 1 ? "" : "s"}
          </Badge>
        </div>

        {selectedJobs.length === 0 ? (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            No jobs scheduled for this day.
          </div>
        ) : (
          <div className="max-h-[20rem] space-y-2 overflow-y-auto pr-1">
            {selectedJobs.map((job) => (
              <div key={job.id} className="rounded-md border p-3">
                <div className="text-sm font-medium">{job.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Project: {job.project_address}
                </div>
                {job.superintendent && (
                  <div className="text-xs text-muted-foreground">
                    Superintendent / GC: {job.superintendent}
                  </div>
                )}
                <div className="mt-2">
                  {job.is_completed ? (
                    <Badge>Completed</Badge>
                  ) : (
                    <Badge variant="secondary">Open</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
