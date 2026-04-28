import Link from "next/link";
import { requireEmployee } from "@/lib/auth/employee";
import { createServiceClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobActionButton } from "../job-action-button";
import {
  formatDate,
  formatPrice,
  type JobWithProject,
} from "@/lib/jobs";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Filter = "open" | "completed" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All" },
];

export default async function MyJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const employee = await requireEmployee();
  const params = await searchParams;
  const filter: Filter =
    params.status === "completed" || params.status === "all"
      ? params.status
      : "open";

  const supabase = createServiceClient();
  let query = supabase
    .from("jobs")
    .select(
      "id, company_id, project_id, title, superintendent, price_cents, scheduled_completion, is_completed, completed_at, completed_by_type, completed_by_id, completed_by_name, created_at, project:projects(id, project_address, builder_name, subdivision)",
    )
    .eq("company_id", employee.company_id)
    .eq("completed_by_type", "employee")
    .eq("completed_by_id", employee.id)
    .is("deleted_at", null)
    .order("scheduled_completion", { ascending: true, nullsFirst: false });

  if (filter === "open") query = query.eq("is_completed", false);
  if (filter === "completed") query = query.eq("is_completed", true);

  const { data } = await query;
  const jobs = (data ?? []) as unknown as JobWithProject[];

  const grouped = new Map<string, { address: string; jobs: JobWithProject[] }>();
  for (const job of jobs) {
    const key = job.project_id;
    const address = job.project?.project_address ?? "Unknown address";
    const bucket = grouped.get(key) ?? { address, jobs: [] };
    bucket.jobs.push(job);
    grouped.set(key, bucket);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Jobs</h1>
          <p className="text-sm text-muted-foreground">
            Jobs assigned to you across the company.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/my-jobs?status=${f.value}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              filter === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No {filter === "all" ? "" : filter} jobs.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.values()).map((group) => (
            <Card key={group.address + group.jobs[0].project_id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {group.address}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.jobs.map((job) => (
                  <JobRow key={job.id} job={job} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function JobRow({ job }: { job: JobWithProject }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link
          href={`/jobs/${job.id}`}
          className="block truncate font-medium hover:underline"
        >
          {job.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          {job.is_completed ? (
            <Badge variant="success">Completed</Badge>
          ) : (
            <Badge variant="outline">Open</Badge>
          )}
          <Badge variant="outline">{formatDate(job.scheduled_completion)}</Badge>
          {job.price_cents != null && (
            <Badge variant="secondary">{formatPrice(job.price_cents)}</Badge>
          )}
          {job.superintendent && (
            <span className="text-muted-foreground">
              Super: {job.superintendent}
            </span>
          )}
        </div>
      </div>
      {job.is_completed ? (
        <JobActionButton jobId={job.id} action="reopen" variant="outline" />
      ) : (
        <JobActionButton jobId={job.id} action="complete" />
      )}
    </div>
  );
}
