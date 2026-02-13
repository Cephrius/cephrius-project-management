import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SuggestionType = "project" | "job" | "invoice";

type SearchSuggestion = {
  id: string;
  type: SuggestionType;
  title: string;
  subtitle: string | null;
  href: string;
};

type ProjectRow = {
  id: string;
  project_address: string;
  builder_name: string | null;
  subdivision: string | null;
};

type JobRow = {
  id: string;
  title: string;
  project_id: string;
  superintendent: string | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  bill_to_name: string | null;
  contractor_name: string | null;
};

const PER_TYPE_LIMIT = 5;
const TOTAL_LIMIT = 12;

function normalizePattern(value: string) {
  const normalized = value
    .trim()
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ");
  return `%${normalized}%`;
}

function compact(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => (part ?? "").trim())
    .filter((part) => part.length > 0)
    .join(" | ");
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] as SearchSuggestion[] });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ suggestions: [] as SearchSuggestion[] }, { status: 401 });
  }

  const pattern = normalizePattern(q);

  const [projectsRes, jobsRes, invoicesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, project_address, builder_name, subdivision")
      .is("deleted_at", null)
      .or(
        `project_address.ilike.${pattern},builder_name.ilike.${pattern},subdivision.ilike.${pattern}`,
      )
      .order("created_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
    supabase
      .from("jobs")
      .select("id, title, project_id, superintendent")
      .is("deleted_at", null)
      .or(`title.ilike.${pattern},superintendent.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
    supabase
      .from("invoices")
      .select("id, invoice_number, bill_to_name, contractor_name")
      .is("deleted_at", null)
      .or(
        `invoice_number.ilike.${pattern},bill_to_name.ilike.${pattern},contractor_name.ilike.${pattern}`,
      )
      .order("created_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
  ]);

  const projects = (projectsRes.data ?? []) as ProjectRow[];
  const jobs = (jobsRes.data ?? []) as JobRow[];
  const invoices = (invoicesRes.data ?? []) as InvoiceRow[];

  const jobProjectIds = Array.from(
    new Set(jobs.map((job) => job.project_id).filter((projectId) => Boolean(projectId))),
  );

  let jobProjectAddressMap = new Map<string, string>();
  if (jobProjectIds.length > 0) {
    const { data: projectRows } = await supabase
      .from("projects")
      .select("id, project_address")
      .in("id", jobProjectIds);

    jobProjectAddressMap = new Map(
      (projectRows ?? []).map((project) => [
        String(project.id),
        String(project.project_address ?? ""),
      ]),
    );
  }

  const projectSuggestions: SearchSuggestion[] = projects.map((project) => ({
    id: `project:${project.id}`,
    type: "project",
    title: project.project_address,
    subtitle: compact([project.builder_name, project.subdivision]) || null,
    href: `/projects/${project.id}`,
  }));

  const jobSuggestions: SearchSuggestion[] = jobs.map((job) => ({
    id: `job:${job.id}`,
    type: "job",
    title: job.title,
    subtitle:
      compact([jobProjectAddressMap.get(job.project_id), job.superintendent]) || null,
    href: `/projects/${job.project_id}`,
  }));

  const invoiceSuggestions: SearchSuggestion[] = invoices.map((invoice) => ({
    id: `invoice:${invoice.id}`,
    type: "invoice",
    title: invoice.invoice_number,
    subtitle: compact([invoice.bill_to_name, invoice.contractor_name]) || null,
    href: `/invoices/${invoice.id}`,
  }));

  const suggestions = [
    ...projectSuggestions,
    ...jobSuggestions,
    ...invoiceSuggestions,
  ].slice(0, TOTAL_LIMIT);

  return NextResponse.json({ suggestions });
}
