
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { ProjectsPageClient } from "@/components/projects/projects-page";
import type { LookupItem, ProjectListItem } from "@/components/projects/types";

function getRelatedJobsCount(jobs: unknown): number {
  if (!Array.isArray(jobs) || jobs.length === 0) return 0;
  const first = jobs[0] as { count?: number | string | null };
  const rawCount = first?.count;
  const parsed = typeof rawCount === "number" ? rawCount : Number(rawCount);
  return Number.isFinite(parsed) ? parsed : 0;
}

type ProjectRow = Omit<ProjectListItem, "job_count"> & { jobs?: unknown };

async function getProjectsPageData(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [projectsRes, buildersRes, subdivisionsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, project_address, builder_name, subdivision, created_at, jobs(count)")
      .is("jobs.deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("builders").select("id, name").order("name"),
    supabase.from("subdivisions").select("id, name").order("name"),
  ]);

  return {
    projects: ((projectsRes.data ?? []) as ProjectRow[]).map((p) => ({
      ...p,
      job_count: getRelatedJobsCount(p.jobs),
    })) as ProjectListItem[],
    builders: (buildersRes.data ?? []) as LookupItem[],
    subdivisions: (subdivisionsRes.data ?? []) as LookupItem[],
  };
}

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const { projects, builders, subdivisions } = await getProjectsPageData(supabase);

  return (
    <div className="space-y-6">
      <BreadcrumbSetter crumbs={[{ label: "Projects", href: "/projects" }]} />
      <ProjectsPageClient
        projects={projects}
        builders={builders}
        subdivisions={subdivisions}
      />
    </div>
  );
}
