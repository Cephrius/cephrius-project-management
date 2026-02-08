
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { ProjectsPageClient } from "@/components/projects/projects-page";
import type { LookupItem, ProjectListItem } from "@/components/projects/types";

async function getProjectsPageData(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [projectsRes, buildersRes, subdivisionsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, project_address, builder_name, subdivision, created_at, jobs(count)")
      .order("created_at", { ascending: false }),
    supabase.from("builders").select("id, name").order("name"),
    supabase.from("subdivisions").select("id, name").order("name"),
  ]);

  return {
    projects: (projectsRes.data ?? []).map((p: any) => ({
      ...p,
      job_count: Array.isArray(p.jobs) ? p.jobs.length : 0,
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
