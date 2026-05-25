"use client";

// Onboarding: project detail job table. Row-level edits are delegated to
// `edit-job-dialog.tsx`, deletion to `delete-job-dialog.tsx`, and payment /
// invoice badges are driven by columns loaded in the project detail route.
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toggleJobComplete } from "@/app/(jobsyte-app)/projects/[id]/actions";
import { AddJobDialog } from "@/components/jobs/add-job-dialog";
import { HighlightScroller } from "@/components/ui/highlight-scroller";
import { DeleteJobDialog } from "@/components/jobs/delete-job-dialog";
import { EditJobDialog } from "@/components/jobs/edit-job-dialog";

export type JobRow = {
  id: string;
  title: string;
  price_cents: number;
  scheduled_completion: string | null;
  is_completed: boolean;
  superintendent: string | null;
  completed_by_type: "employee" | "crew" | null;
  completed_by_id: string | null;
  completed_by_name: string | null;
  is_invoiced: boolean;
  is_paid: boolean;
};

function formatMoney(cents: number) {
  const dollars = cents / 100;
  return dollars.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function JobsTable({
  jobs,
  projectId,
}: {
  jobs: JobRow[];
  projectId: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [isPending, startTransition] = useTransition();
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<JobRow | null>(null);
  const [query, setQuery] = useState("");
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [addJobInitialTitle, setAddJobInitialTitle] = useState("");
  const [addJobSeed, setAddJobSeed] = useState(0);

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
        (j.completed_by_name ?? "").toLowerCase().includes(q) ||
        (j.scheduled_completion ?? "").toLowerCase().includes(q)
      );
    });
  }, [jobs, filter, query]);

  const allCount = jobs.length;
  const openCount = jobs.filter((j) => !j.is_completed).length;
  const doneCount = jobs.filter((j) => j.is_completed).length;

  const showSuperintendent = useMemo(
    () => jobs.some((j) => (j.superintendent ?? "").trim().length > 0),
    [jobs],
  );
  const showCompletedBy = useMemo(
    () => jobs.some((j) => (j.completed_by_name ?? "").trim().length > 0),
    [jobs],
  );
  const showScheduled = useMemo(
    () => jobs.some((j) => (j.scheduled_completion ?? "").trim().length > 0),
    [jobs],
  );
  const normalizedQuery = useMemo(
    () => query.trim().replace(/\s+/g, " "),
    [query],
  );

  function openCreateJobFromSearch() {
    if (!normalizedQuery) return;
    setAddJobInitialTitle(normalizedQuery);
    setAddJobSeed((current) => current + 1);
    setAddJobOpen(true);
  }

  const filterTabs = [
    { key: "all", label: "Jobs", count: allCount },
    { key: "open", label: "Incomplete", count: openCount },
    { key: "done", label: "Completed", count: doneCount },
  ] as const;

  return (
    <div className="space-y-3">
      <HighlightScroller />
      <div className="flex flex-col gap-3 border-b pb-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          {filterTabs.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 border-b-2 px-2 py-1 text-sm transition-colors",
                  active
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{tab.label}</span>
                <span className={cn("text-xs", active ? "text-primary" : "text-muted-foreground")}>{tab.count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <InputGroup className="w-full sm:w-72">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jobs..."
            />
          </InputGroup>

          <Button
            type="button"
            size="sm"
            className="gap-2 sm:whitespace-nowrap"
            disabled={!normalizedQuery}
            onClick={openCreateJobFromSearch}
          >
            <Plus className="size-4" />
            {normalizedQuery ? "Create Job" : "Create Job"}
          </Button>
        </div>
      </div>

      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            No jobs match this filter.
          </div>
        ) : (
          filtered.map((job) => (
            <div
              key={job.id}
              className="rounded-md border p-3 space-y-2 cursor-pointer active:bg-muted/30"
              onClick={() => setEditingJob(job)}
            >
              <div
                className="flex items-start justify-between gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="font-medium leading-tight">{job.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatMoney(job.price_cents)}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="cursor-pointer h-8 w-8"
                      disabled={isPending}
                      aria-label={`Actions for ${job.title}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={(event) => {
                        event.preventDefault();
                        setEditingJob(job);
                      }}
                      disabled={isPending}
                    >
                      <Pencil className="size-4" />
                      Edit Job
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={(event) => {
                        event.preventDefault();
                        startTransition(async () => {
                          await toggleJobComplete(job.id, !job.is_completed);
                          router.refresh();
                        });
                      }}
                      disabled={isPending || job.is_paid || job.is_invoiced}
                    >
                      <CheckCircle2 className="size-4" />
                      {job.is_completed ? "Unmark Completed" : "Mark Completed"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onSelect={(event) => {
                        event.preventDefault();
                        setDeleteJobId(job.id);
                      }}
                      disabled={isPending}
                    >
                      <Trash2 className="size-4" />
                      Delete Job
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {job.is_paid ? (
                  <Badge className="bg-green-600 text-white hover:bg-green-600">Paid</Badge>
                ) : job.is_invoiced ? (
                  <Badge
                    variant="outline"
                    className="border-violet-300 bg-violet-50 text-violet-700"
                  >
                    Invoiced
                  </Badge>
                ) : job.is_completed ? (
                  <Badge>Completed</Badge>
                ) : (
                  <Badge variant="secondary">In progress</Badge>
                )}
                {showScheduled && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(job.scheduled_completion)}
                  </span>
                )}
              </div>

              {showSuperintendent && job.superintendent && (
                <div className="text-xs text-muted-foreground">
                  Superintendent / GC: {job.superintendent}
                </div>
              )}
              {showCompletedBy && (
                <div className="text-xs text-muted-foreground">
                  Completed By: {job.completed_by_name ?? "Unassigned"}
                </div>
              )}

              <DeleteJobDialog
                jobId={job.id}
                open={deleteJobId === job.id}
                onOpenChange={(open) => setDeleteJobId(open ? job.id : null)}
              />
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/20 hover:bg-muted/20">
              <TableHead className="h-11">Job Title</TableHead>
              <TableHead className="h-11">Price</TableHead>
              {showScheduled && <TableHead className="h-11">Scheduled For</TableHead>}
              {showSuperintendent && <TableHead className="h-11">Superintendent / GC</TableHead>}
              {showCompletedBy && <TableHead className="h-11">Completed By</TableHead>}
              <TableHead className="h-11">Status</TableHead>
              <TableHead className="h-11 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    4 + (showScheduled ? 1 : 0) + (showSuperintendent ? 1 : 0)
                    + (showCompletedBy ? 1 : 0)
                  }
                  className="text-sm text-muted-foreground"
                >
                  No jobs match this filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((job) => (
                <TableRow key={job.id} data-highlight-id={job.id} className="h-14">
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="tabular-nums">{formatMoney(job.price_cents)}</TableCell>
                  {showScheduled && (
                    <TableCell className="text-muted-foreground">{formatDate(job.scheduled_completion)}</TableCell>
                  )}
                  {showSuperintendent && <TableCell className="text-muted-foreground">{job.superintendent ?? "—"}</TableCell>}
                  {showCompletedBy && (
                    <TableCell className="text-muted-foreground">
                      {job.completed_by_name ?? "Unassigned"}
                    </TableCell>
                  )}
                  <TableCell>
                    {job.is_paid ? (
                      <Badge className="bg-green-600 text-white hover:bg-green-600">
                        Paid
                      </Badge>
                    ) : job.is_invoiced ? (
                      <Badge
                        variant="outline"
                        className="border-violet-300 bg-violet-50 text-violet-700"
                      >
                        Invoiced
                      </Badge>
                    ) : job.is_completed ? (
                      <Badge>Completed</Badge>
                    ) : (
                      <Badge variant="secondary">In progress</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="cursor-pointer"
                          disabled={isPending}
                          aria-label={`Actions for ${job.title}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={(event) => {
                            event.preventDefault();
                            setEditingJob(job);
                          }}
                          disabled={isPending}
                        >
                          <Pencil className="size-4" />
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={(event) => {
                            event.preventDefault();
                            startTransition(async () => {
                              await toggleJobComplete(job.id, !job.is_completed);
                              router.refresh();
                            });
                          }}
                          disabled={isPending || job.is_paid || job.is_invoiced}
                        >
                          <CheckCircle2 className="size-4" />
                          {job.is_completed
                            ? "Unmark Completed"
                            : "Mark Completed"}
                          {(job.is_paid || job.is_invoiced) && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {job.is_paid ? "Paid" : "Invoiced"}
                            </span>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onSelect={(event) => {
                            event.preventDefault();
                            setDeleteJobId(job.id);
                          }}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" />
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DeleteJobDialog
                      jobId={job.id}
                      open={deleteJobId === job.id}
                      onOpenChange={(open) =>
                        setDeleteJobId(open ? job.id : null)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingJob && (
        <EditJobDialog
          job={editingJob}
          projectId={projectId}
          open
          onOpenChange={(open) => {
            if (!open) setEditingJob(null);
          }}
        />
      )}
      <AddJobDialog
        key={`jobs-table-add-job-${addJobSeed}`}
        projectId={projectId}
        open={addJobOpen}
        onOpenChange={setAddJobOpen}
        initialTitle={addJobInitialTitle}
      />
    </div>
  );
}
