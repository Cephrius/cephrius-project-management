// Onboarding: company-wide open jobs view for employees. Employees can claim or
// complete jobs through `employee-app/app/(authed)/actions.ts`, which verifies
// the job belongs to the employee's company.
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

export const dynamic = "force-dynamic";

export default async function AllOpenJobsPage() {
  const employee = await requireEmployee();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("jobs")
    .select(
      "id, company_id, project_id, title, superintendent, price_cents, scheduled_completion, is_completed, completed_at, completed_by_type, completed_by_id, completed_by_name, created_at, project:projects(id, project_address, builder_name, subdivision)",
    )
    .eq("company_id", employee.company_id)
    .eq("is_completed", false)
    .is("deleted_at", null)
    .order("scheduled_completion", { ascending: true, nullsFirst: false });

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Open Jobs</h1>
        <p className="text-sm text-muted-foreground">
          All unfinished jobs in your company. Claim one if it&apos;s
          unassigned.
        </p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No open jobs in your company. 🎉
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
                  <Row key={job.id} job={job} myEmployeeId={employee.id} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({
  job,
  myEmployeeId,
}: {
  job: JobWithProject;
  myEmployeeId: string;
}) {
  const assignedToMe =
    job.completed_by_type === "employee" && job.completed_by_id === myEmployeeId;
  const unassigned = !job.completed_by_id;

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
          <Badge variant="outline">{formatDate(job.scheduled_completion)}</Badge>
          {job.price_cents != null && (
            <Badge variant="secondary">{formatPrice(job.price_cents)}</Badge>
          )}
          {assignedToMe ? (
            <Badge variant="success">Assigned to you</Badge>
          ) : unassigned ? (
            <Badge variant="warning">Unassigned</Badge>
          ) : (
            <span className="text-muted-foreground">
              {job.completed_by_name ?? "Assigned"}
              {job.completed_by_type ? ` (${job.completed_by_type})` : ""}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {assignedToMe && (
          <JobActionButton jobId={job.id} action="complete" />
        )}
        {unassigned && (
          <JobActionButton jobId={job.id} action="claim" variant="outline" />
        )}
      </div>
    </div>
  );
}
