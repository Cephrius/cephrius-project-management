import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Briefcase, FileText, FolderKanban } from "lucide-react";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

type ProjectRow = {
  id: string;
  project_address: string;
  builder_name: string | null;
  subdivision: string | null;
  created_at: string | null;
};

type JobRow = {
  id: string;
  title: string;
  project_id: string;
  superintendent: string | null;
  is_completed: boolean | null;
  created_at: string | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  bill_to_name: string | null;
  contractor_name: string | null;
  invoice_date: string | null;
  subtotal_cents: number | null;
  created_at: string | null;
};

function money(cents: number | null) {
  const value = cents ?? 0;
  return (value / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function toIlikePattern(value: string) {
  const normalized = value
    .trim()
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ");
  return `%${normalized}%`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) redirect("/login");

  if (!q) {
    return (
      <div className="space-y-6">
        <BreadcrumbSetter crumbs={[{ label: "Search", href: "/search" }]} />
        <Card className="border-primary/20 p-8">
          <div className="text-lg font-semibold text-primary">
            Global Search
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Use the search bar in the header to find projects, jobs, and
            invoices.
          </div>
        </Card>
      </div>
    );
  }

  const pattern = toIlikePattern(q);

  const [projectsRes, jobsRes, invoicesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, project_address, builder_name, subdivision, created_at")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(
        `project_address.ilike.${pattern},builder_name.ilike.${pattern},subdivision.ilike.${pattern}`,
      )
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("jobs")
      .select("id, title, project_id, superintendent, is_completed, created_at")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`title.ilike.${pattern},superintendent.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("invoices")
      .select(
        "id, invoice_number, bill_to_name, contractor_name, invoice_date, subtotal_cents, created_at",
      )
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(
        `invoice_number.ilike.${pattern},bill_to_name.ilike.${pattern},contractor_name.ilike.${pattern}`,
      )
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const projects = (projectsRes.data ?? []) as ProjectRow[];
  const jobs = (jobsRes.data ?? []) as JobRow[];
  const invoices = (invoicesRes.data ?? []) as InvoiceRow[];

  const projectIds = Array.from(
    new Set(jobs.map((job) => job.project_id).filter(Boolean)),
  );

  let projectAddressMap = new Map<string, string>();
  if (projectIds.length > 0) {
    const { data: jobProjects, error: jobProjectsErr } = await supabase
      .from("projects")
      .select("id, project_address")
      .in("id", projectIds);

    if (jobProjectsErr) {
      return (
        <div className="space-y-6">
          <BreadcrumbSetter crumbs={[{ label: "Search", href: "/search" }]} />
          <Card className="p-8">
            <div className="text-sm text-muted-foreground">
              Failed to load search results: {jobProjectsErr.message}
            </div>
          </Card>
        </div>
      );
    }

    projectAddressMap = new Map(
      (jobProjects ?? []).map((project) => [
        project.id as string,
        project.project_address as string,
      ]),
    );
  }

  const firstError = projectsRes.error ?? jobsRes.error ?? invoicesRes.error;
  if (firstError) {
    return (
      <div className="space-y-6">
        <BreadcrumbSetter crumbs={[{ label: "Search", href: "/search" }]} />
        <Card className="p-8">
          <div className="text-sm text-muted-foreground">
            Failed to load search results: {firstError.message}
          </div>
        </Card>
      </div>
    );
  }

  const totalResults = projects.length + jobs.length + invoices.length;

  return (
    <div className="space-y-6">
      <BreadcrumbSetter crumbs={[{ label: "Search", href: "/search" }]} />

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primary">Search Results</h1>
        <p className="text-sm text-muted-foreground">
          {totalResults} result{totalResults === 1 ? "" : "s"} for{" "}
          <span className="font-medium text-foreground">{q}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-primary/20 bg-primary/[0.03] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <FolderKanban className="size-4" />
            Projects
          </div>
          <div className="mt-2 text-3xl font-semibold">{projects.length}</div>
        </Card>
        <Card className="border-primary/20 bg-primary/[0.03] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Briefcase className="size-4" />
            Jobs
          </div>
          <div className="mt-2 text-3xl font-semibold">{jobs.length}</div>
        </Card>
        <Card className="border-primary/20 bg-primary/[0.03] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <FileText className="size-4" />
            Invoices
          </div>
          <div className="mt-2 text-3xl font-semibold">{invoices.length}</div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-primary/20 p-4">
          <div className="mb-3 text-sm font-semibold text-primary">Projects</div>
          <div className="space-y-2">
            {projects.length === 0 ? (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                No project matches found.
              </div>
            ) : (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-md border border-primary/10 p-3 transition hover:bg-primary/5"
                >
                  <div className="font-medium">{project.project_address}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Builder: {project.builder_name ?? "Unassigned"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Subdivision: {project.subdivision ?? "Unassigned"}
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="border-primary/20 p-4">
          <div className="mb-3 text-sm font-semibold text-primary">Jobs</div>
          <div className="space-y-2">
            {jobs.length === 0 ? (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                No job matches found.
              </div>
            ) : (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/projects/${job.project_id}`}
                  className="block rounded-md border border-primary/10 p-3 transition hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{job.title}</div>
                    <Badge
                      variant="outline"
                      className={
                        job.is_completed
                          ? "border-green-300 bg-green-100 text-green-800"
                          : "border-primary/30 bg-primary/10 text-primary"
                      }
                    >
                      {job.is_completed ? "Completed" : "Open"}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Project:{" "}
                    {projectAddressMap.get(job.project_id) ?? "Unknown project"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Superintendent / GC: {job.superintendent ?? "Unassigned"}
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="border-primary/20 p-4">
          <div className="mb-3 text-sm font-semibold text-primary">Invoices</div>
          <div className="space-y-2">
            {invoices.length === 0 ? (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                No invoice matches found.
              </div>
            ) : (
              invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="block rounded-md border border-primary/10 p-3 transition hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{invoice.invoice_number}</div>
                    <div className="text-sm font-semibold">
                      {money(invoice.subtotal_cents)}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Bill To: {invoice.bill_to_name ?? "Unassigned"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    From: {invoice.contractor_name ?? "Unknown"}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                    Open Invoice <ArrowRight className="size-3" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
