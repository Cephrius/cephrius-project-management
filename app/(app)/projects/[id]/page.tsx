import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { AddJobButton } from "@/components/jobs/add-job-button";
import { JobsTable } from "@/components/jobs/jobs-table";
import { createClient } from "@/lib/supbase/server

function formatMoney(cents: number) {
  const dollars = cents / 100;
  return dollars.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export default async function ProjectDashboardPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, project_address, builder_name, subdivision")
    .eq("id", params.id)
    .single();

  if (!project) {
    return (
      <div className="text-sm text-muted-foreground">Project not found.</div>
    );
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, price_cents, scheduled_completion, is_completed")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  const allJobs = jobs ?? [];
  const totalJobs = allJobs.length;
  const completedJobs = allJobs.filter((j) => j.is_completed).length;

  const totalValue = allJobs.reduce((sum, j) => sum + (j.price_cents ?? 0), 0);
  const completedValue = allJobs
    .filter((j) => j.is_completed)
    .reduce((sum, j) => sum + (j.price_cents ?? 0), 0);

  return (
    <div className="space-y-6">
      <BreadcrumbSetter
        crumbs={[
          { label: "Projects", href: "/projects" },
          { label: project.project_address },
        ]}
        rightSlot={<AddJobButton projectId={project.id} />}
      />

      <div>
        <h1 className="text-xl font-semibold">{project.project_address}</h1>
        <p className="text-sm text-muted-foreground">
          Builder: {project.builder_name} • Subdivision: {project.subdivision}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Jobs</div>
          <div className="text-2xl font-semibold">{totalJobs}</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Completed</div>
          <div className="text-2xl font-semibold">
            {completedJobs} / {totalJobs}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Completed Value</div>
          <div className="text-2xl font-semibold">
            {formatMoney(completedValue)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total: {formatMoney(totalValue)}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Jobs</div>
            <div className="text-xs text-muted-foreground">
              Add jobs, then mark them complete for invoicing.
            </div>
          </div>
        </div>

        <JobsTable jobs={allJobs} />
      </Card>
    </div>
  );
}
