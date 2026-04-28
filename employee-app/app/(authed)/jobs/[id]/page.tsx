import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireEmployee } from "@/lib/auth/employee";
import { createServiceClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobActionButton } from "../../job-action-button";
import {
  formatDate,
  formatPrice,
  type JobWithProject,
} from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = await requireEmployee();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("jobs")
    .select(
      "id, company_id, project_id, title, superintendent, price_cents, scheduled_completion, is_completed, completed_at, completed_by_type, completed_by_id, completed_by_name, created_at, project:projects(id, project_address, builder_name, subdivision)",
    )
    .eq("id", id)
    .eq("company_id", employee.company_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) notFound();
  const job = data as unknown as JobWithProject;

  const assignedToMe =
    job.completed_by_type === "employee" && job.completed_by_id === employee.id;
  const unassigned = !job.completed_by_id;

  return (
    <div className="space-y-5">
      <Link
        href="/my-jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.project?.project_address ?? "Unknown address"}
                {job.project?.builder_name
                  ? ` · ${job.project.builder_name}`
                  : ""}
                {job.project?.subdivision
                  ? ` · ${job.project.subdivision}`
                  : ""}
              </p>
            </div>
            {job.is_completed ? (
              <Badge variant="success">Completed</Badge>
            ) : (
              <Badge variant="outline">Open</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Field label="Scheduled" value={formatDate(job.scheduled_completion)} />
            <Field label="Price" value={formatPrice(job.price_cents)} />
            <Field label="Superintendent" value={job.superintendent ?? "—"} />
            <Field
              label="Assigned to"
              value={
                assignedToMe
                  ? "You"
                  : unassigned
                    ? "Unassigned"
                    : `${job.completed_by_name ?? "—"}${job.completed_by_type ? ` (${job.completed_by_type})` : ""}`
              }
            />
            {job.is_completed && (
              <Field
                label="Completed at"
                value={
                  job.completed_at
                    ? new Date(job.completed_at).toLocaleString()
                    : "—"
                }
              />
            )}
          </dl>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            {unassigned && (
              <JobActionButton jobId={job.id} action="claim" />
            )}
            {assignedToMe && !job.is_completed && (
              <JobActionButton jobId={job.id} action="complete" />
            )}
            {assignedToMe && job.is_completed && (
              <JobActionButton
                jobId={job.id}
                action="reopen"
                variant="outline"
              />
            )}
            {!assignedToMe && !unassigned && (
              <p className="text-xs text-muted-foreground">
                Only the assigned person can complete this job.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
