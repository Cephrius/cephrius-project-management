"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleJobComplete } from "@/app/(app)/projects/[id]/actions";
import { DeleteJobDialog } from "@/components/jobs/delete-job-dialog";

export type JobRow = {
  id: string;
  title: string;
  price_cents: number;
  scheduled_completion: string | null;
  is_completed: boolean;
  superintendent: string | null;
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
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = jobs;
    if (filter === "open") list = list.filter((j) => !j.is_completed);
    if (filter === "done") list = list.filter((j) => j.is_completed);

    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter((j) => {
      return (
        j.title.toLowerCase().includes(q) ||
        (j.superintendent ?? "").toLowerCase().includes(q) ||
        (j.scheduled_completion ?? "").toLowerCase().includes(q)
      );
    });
  }, [jobs, filter, query]);

  const showSuperintendent = useMemo(
    () => jobs.some((j) => (j.superintendent ?? "").trim().length > 0),
    [jobs],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
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

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs..."
            className="w-full sm:w-64"
          />

        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead className="w-35">Price</TableHead>
              <TableHead className="w-45">Scheduled For</TableHead>
              {showSuperintendent && (
                <TableHead className="w-56">Superintendent / GC</TableHead>
              )}
              <TableHead className="w-35">Status</TableHead>
              <TableHead className="w-55 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showSuperintendent ? 6 : 5}
                  className="text-sm text-muted-foreground"
                >
                  No jobs match this filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{formatMoney(job.price_cents)}</TableCell>
                  <TableCell>{job.scheduled_completion ?? "”"}</TableCell>
                  {showSuperintendent && (
                    <TableCell>{job.superintendent ?? ""}</TableCell>
                  )}
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
                        className="cursor-pointer"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await toggleJobComplete(job.id, !job.is_completed);
                            router.refresh();
                          })
                        }
                      >
                        {job.is_completed ? "Unmark Completed" : "Mark Completed"}
                      </Button>

                      <DeleteJobDialog
                        jobId={job.id}
                        open={deleteJobId === job.id}
                        onOpenChange={(open) =>
                          setDeleteJobId(open ? job.id : null)
                        }
                        trigger={
                          <Button
                            className="cursor-pointer hover:bg-destructive hover:text-white"
                            variant="outline"
                            disabled={isPending}
                          >
                            Delete
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
