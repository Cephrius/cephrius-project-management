import Link from "next/link";
import { ArrowRight, Briefcase, ClipboardList } from "lucide-react";
import { requireEmployee } from "@/lib/auth/employee";
import { createServiceClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobActionButton } from "./job-action-button";
import {
  formatDate,
  formatPrice,
  type JobWithProject,
} from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const employee = await requireEmployee();
  const supabase = createServiceClient();

  const [{ count: myOpenCount }, { count: companyOpenCount }, { data: nextJobs }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("company_id", employee.company_id)
        .eq("completed_by_type", "employee")
        .eq("completed_by_id", employee.id)
        .eq("is_completed", false)
        .is("deleted_at", null),
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("company_id", employee.company_id)
        .eq("is_completed", false)
        .is("deleted_at", null),
      supabase
        .from("jobs")
        .select(
          "id, company_id, project_id, title, superintendent, price_cents, scheduled_completion, is_completed, completed_at, completed_by_type, completed_by_id, completed_by_name, created_at, project:projects(id, project_address, builder_name, subdivision)",
        )
        .eq("company_id", employee.company_id)
        .eq("completed_by_type", "employee")
        .eq("completed_by_id", employee.id)
        .eq("is_completed", false)
        .is("deleted_at", null)
        .order("scheduled_completion", { ascending: true, nullsFirst: false })
        .limit(5),
    ]);

  const upcoming = (nextJobs ?? []) as unknown as JobWithProject[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {employee.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a quick look at your work today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          icon={<Briefcase className="size-4" />}
          label="My Open Jobs"
          value={myOpenCount ?? 0}
          href="/my-jobs"
        />
        <SummaryCard
          icon={<ClipboardList className="size-4" />}
          label="Open Jobs in Company"
          value={companyOpenCount ?? 0}
          href="/all-jobs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Up next</CardTitle>
          <CardDescription>
            Your assigned open jobs, soonest first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open jobs assigned to you.
            </p>
          ) : (
            upcoming.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="block truncate font-medium hover:underline"
                  >
                    {job.title}
                  </Link>
                  <div className="truncate text-xs text-muted-foreground">
                    {job.project?.project_address ?? "Unknown address"}
                    {job.project?.builder_name
                      ? ` · ${job.project.builder_name}`
                      : ""}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline">
                      {formatDate(job.scheduled_completion)}
                    </Badge>
                    {job.price_cents != null && (
                      <Badge variant="secondary">
                        {formatPrice(job.price_cents)}
                      </Badge>
                    )}
                  </div>
                </div>
                <JobActionButton jobId={job.id} action="complete" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="transition-colors group-hover:border-primary/40">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {icon}
              {label}
            </div>
            <div className="mt-1 text-3xl font-semibold tracking-tight">
              {value}
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  );
}
