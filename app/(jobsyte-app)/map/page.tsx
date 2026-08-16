import { redirect } from "next/navigation";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { JobsMapPageClient, type JobsMapProject } from "@/components/map/jobs-map-page";
import { getActiveCompanyId } from "@/lib/active-company";
import { getPublicMapboxAccessToken } from "@/lib/maps/mapbox";
import { createClient } from "@/lib/supabase/server";

type ProjectRow = {
  id: string;
  project_address: string;
  project_city?: string | null;
  project_state?: string | null;
  builder_name: string | null;
  subdivision: string | null;
};

type JobRow = {
  id: string;
  title: string;
  project_id: string;
  scheduled_completion: string | null;
  is_completed: boolean | null;
  superintendent: string | null;
  price_cents: number | null;
};

function isMissingProjectLocationColumnError(message: string | undefined) {
  const normalized = (message ?? "").toLowerCase();
  return (
    normalized.includes("project_city") ||
    normalized.includes("project_state") ||
    (normalized.includes("schema cache") && normalized.includes("projects"))
  );
}

async function fetchProjects(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
) {
  const projectsRes = await supabase
    .from("projects")
    .select("id, project_address, project_city, project_state, builder_name, subdivision")
    .eq("company_id", companyId)
    .is("deleted_at", null);

  if (
    projectsRes.error &&
    isMissingProjectLocationColumnError(projectsRes.error.message)
  ) {
    const legacyProjectsRes = await supabase
      .from("projects")
      .select("id, project_address, builder_name, subdivision")
      .eq("company_id", companyId)
      .is("deleted_at", null);

    return {
      data: ((legacyProjectsRes.data ?? []) as Omit<
        ProjectRow,
        "project_city" | "project_state"
      >[]).map((project) => ({
        ...project,
        project_city: null,
        project_state: null,
      })),
      error: legacyProjectsRes.error,
    };
  }

  return {
    data: (projectsRes.data ?? []) as ProjectRow[],
    error: projectsRes.error,
  };
}

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MapPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) redirect("/login");
  const mapboxToken = getPublicMapboxAccessToken();

  const [projectsRes, jobsRes] = await Promise.all([
    fetchProjects(supabase, companyId),
    supabase
      .from("jobs")
      .select("id, title, project_id, scheduled_completion, is_completed, superintendent, price_cents")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const firstError = projectsRes.error ?? jobsRes.error;
  if (firstError) {
    return (
      <div className="space-y-6">
        <BreadcrumbSetter crumbs={[{ label: "Map", href: "/map" }]} />
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Failed to load map data: {firstError.message}
        </div>
      </div>
    );
  }

  const projectMap = new Map(
    ((projectsRes.data ?? []) as ProjectRow[]).map((project) => [
      project.id,
      {
        ...project,
        project_city: project.project_city ?? null,
        project_state: project.project_state ?? null,
      },
    ]),
  );

  const jobsByProject = new Map<string, JobRow[]>();
  for (const job of (jobsRes.data ?? []) as JobRow[]) {
    const list = jobsByProject.get(job.project_id) ?? [];
    list.push(job);
    jobsByProject.set(job.project_id, list);
  }

  const projects: JobsMapProject[] = Array.from(jobsByProject.entries())
    .map(([projectId, jobs]) => {
      const project = projectMap.get(projectId);
      if (!project) return null;

      return {
        id: project.id,
        project_address: project.project_address,
        project_city: project.project_city,
        project_state: project.project_state,
        builder_name: project.builder_name,
        subdivision: project.subdivision,
        jobs: jobs.map((job) => ({
          id: job.id,
          title: job.title,
          scheduled_completion: job.scheduled_completion,
          is_completed: job.is_completed === true,
          superintendent: job.superintendent,
          price_cents: job.price_cents,
        })),
      };
    })
    .filter((project): project is JobsMapProject => project !== null)
    .sort((a, b) => a.project_address.localeCompare(b.project_address));

  return (
    <div className="space-y-6">
      <BreadcrumbSetter crumbs={[{ label: "Map", href: "/map" }]} />
      <JobsMapPageClient projects={projects} mapboxToken={mapboxToken} />
    </div>
  );
}
