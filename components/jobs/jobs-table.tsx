"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  toggleJobComplete,
  deleteJob,
} from "@/app/(app)/projects/[id]/actions";

export type JobRow = {
  id: string;
  title: string;
  price_cents: number;
  scheduled_completion: string | null;
  is_completed: boolean;
};

function formatMoney(cents: number) {
  const dollars = cents / 100;
  return dollars.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export function JobsTable({ jobs }: { jobs: JobRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "open") return jobs.filter((j) => !j.is_completed);
    if (filter === "done") return jobs.filter((j) => j.is_completed);
    return jobs;
  }, [jobs, filter]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "open" ? "default" : "outline"}
            onClick={() => setFilter("open")}
          >
            Incomplete
          </Button>
          <Button
            variant={filter === "done" ? "default" : "outline"}
            onClick={() => setFilter("done")}
          >
            Completed
          </Button>
        </div>

        {isPending && (
          <span className="text-xs text-muted-foreground">Updating…</span>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead className="w-[140px]">Price</TableHead>
            <TableHead className="w-[180px]">Scheduled</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="w-[220px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-sm text-muted-foreground">
                No jobs match this filter.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{formatMoney(job.price_cents)}</TableCell>
                <TableCell>{job.scheduled_completion ?? "—"}</TableCell>
                <TableCell>
                  {job.is_completed ? (
                    <Badge>Completed</Badge>
                  ) : (
                    <Badge variant="secondary">In progress</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    <Button
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await toggleJobComplete(job.id, !job.is_completed);
                          router.refresh();
                        })
                      }
                    >
                      {job.is_completed ? "Unmark" : "Mark complete"}
                    </Button>

                    <Button
                      variant="outline"
                      disabled={isPending}
                      onClick={() => {
                        const ok = confirm("Delete this job?");
                        if (!ok) return;
                        startTransition(async () => {
                          await deleteJob(job.id);
                          router.refresh();
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
