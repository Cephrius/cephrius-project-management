import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";

// Extended: added employee, crew, payment, expense
type SuggestionType = "project" | "job" | "invoice" | "employee" | "crew" | "payment" | "expense";

type SearchSuggestion = {
  id: string;
  type: SuggestionType;
  title: string;
  subtitle: string | null;
  href: string;
};

type ProjectRow = { id: string; project_address: string; builder_name: string | null; subdivision: string | null };
type JobRow = { id: string; title: string; project_id: string; superintendent: string | null };
type InvoiceRow = { id: string; invoice_number: string; bill_to_name: string | null; contractor_name: string | null };
type EmployeeRow = { id: string; name: string; email: string | null; phone: string | null; role: string | null; job_title: string | null };
type CrewRow = { id: string; name: string; specialization: string | null; description: string | null };
type PaymentRow = { id: string; reference_number: string | null; payment_method: string | null; paid_to_type: string | null; paid_to_id: string | null; amount_cents: number | null };
type ExpenseRow = { id: string; description: string | null; project_id: string; amount_cents: number | null; cost_type: string | null };

const PER_TYPE_LIMIT = 5;
const TOTAL_LIMIT = 20; // bumped: 7 types now

function normalizePattern(value: string) {
  const normalized = value.trim().replace(/[(),]/g, " ").replace(/\s+/g, " ");
  return `%${normalized}%`;
}

function compact(parts: Array<string | null | undefined>) {
  return parts.map((p) => (p ?? "").trim()).filter((p) => p.length > 0).join(" | ");
}

function money(cents: number | null | undefined) {
  const v = (cents ?? 0) / 100;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] as SearchSuggestion[] });
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ suggestions: [] as SearchSuggestion[] }, { status: 401 });
  }

  const companyId = await getActiveCompanyId();
  if (!companyId) {
    return NextResponse.json({ suggestions: [] as SearchSuggestion[] });
  }

  const pattern = normalizePattern(q);

  // Fire all 7 lookups in parallel
  const [projectsRes, jobsRes, invoicesRes, employeesRes, crewsRes, paymentsRes, expensesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, project_address, builder_name, subdivision")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`project_address.ilike.${pattern},builder_name.ilike.${pattern},subdivision.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
    supabase
      .from("jobs")
      .select("id, title, project_id, superintendent")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`title.ilike.${pattern},superintendent.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
    supabase
      .from("invoices")
      .select("id, invoice_number, bill_to_name, contractor_name")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`invoice_number.ilike.${pattern},bill_to_name.ilike.${pattern},contractor_name.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
    // NEW: employees — match on identifying fields users recognize
    supabase
      .from("employees")
      .select("id, name, email, phone, role, job_title")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},role.ilike.${pattern},job_title.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
    // NEW: crews
    supabase
      .from("crews")
      .select("id, name, specialization, description")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`name.ilike.${pattern},specialization.ilike.${pattern},description.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
    // NEW: payroll payments — searchable by reference # / method
    supabase
      .from("payments")
      .select("id, reference_number, payment_method, paid_to_type, paid_to_id, amount_cents")
      .eq("company_id", companyId)
      .or(`reference_number.ilike.${pattern},payment_method.ilike.${pattern}`)
      .order("paid_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
    // NEW: accounting expenses — searchable by description
    supabase
      .from("project_expenses")
      .select("id, description, project_id, amount_cents, cost_type")
      .eq("company_id", companyId)
      .ilike("description", pattern)
      .order("created_at", { ascending: false })
      .limit(PER_TYPE_LIMIT),
  ]);

  const projects = (projectsRes.data ?? []) as ProjectRow[];
  const jobs = (jobsRes.data ?? []) as JobRow[];
  const invoices = (invoicesRes.data ?? []) as InvoiceRow[];
  const employees = (employeesRes.data ?? []) as EmployeeRow[];
  const crews = (crewsRes.data ?? []) as CrewRow[];
  const payments = (paymentsRes.data ?? []) as PaymentRow[];
  const expenses = (expensesRes.data ?? []) as ExpenseRow[];

  // Resolve joined names (project addresses for jobs/expenses, employee/crew names for payments)
  const jobProjectIds = Array.from(new Set(jobs.map((j) => j.project_id).filter(Boolean)));
  const expenseProjectIds = Array.from(new Set(expenses.map((e) => e.project_id).filter(Boolean)));
  const allProjectIds = Array.from(new Set([...jobProjectIds, ...expenseProjectIds]));

  const paymentEmployeeIds = payments.filter((p) => p.paid_to_type === "employee").map((p) => p.paid_to_id).filter(Boolean) as string[];
  const paymentCrewIds = payments.filter((p) => p.paid_to_type === "crew").map((p) => p.paid_to_id).filter(Boolean) as string[];

  let projectAddressMap = new Map<string, string>();
  let empNameMap = new Map<string, string>();
  let crewNameMap = new Map<string, string>();

  const joinPromises: PromiseLike<unknown>[] = [];
  if (allProjectIds.length > 0) {
    joinPromises.push(
      supabase.from("projects").select("id, project_address").in("id", allProjectIds).then((r) => {
        projectAddressMap = new Map((r.data ?? []).map((p) => [String(p.id), String(p.project_address ?? "")]));
      }),
    );
  }
  if (paymentEmployeeIds.length > 0) {
    joinPromises.push(
      supabase.from("employees").select("id, name").in("id", paymentEmployeeIds).then((r) => {
        empNameMap = new Map((r.data ?? []).map((e) => [String(e.id), String(e.name ?? "")]));
      }),
    );
  }
  if (paymentCrewIds.length > 0) {
    joinPromises.push(
      supabase.from("crews").select("id, name").in("id", paymentCrewIds).then((r) => {
        crewNameMap = new Map((r.data ?? []).map((c) => [String(c.id), String(c.name ?? "")]));
      }),
    );
  }
  await Promise.all(joinPromises);

  const projectSuggestions: SearchSuggestion[] = projects.map((p) => ({
    id: `project:${p.id}`,
    type: "project",
    title: p.project_address,
    subtitle: compact([p.builder_name, p.subdivision]) || null,
    href: `/projects/${p.id}`,
  }));

  const jobSuggestions: SearchSuggestion[] = jobs.map((j) => ({
    id: `job:${j.id}`,
    type: "job",
    title: j.title,
    subtitle: compact([projectAddressMap.get(j.project_id), j.superintendent]) || null,
    href: `/projects/${j.project_id}?highlight=${j.id}`,
  }));

  const invoiceSuggestions: SearchSuggestion[] = invoices.map((i) => ({
    id: `invoice:${i.id}`,
    type: "invoice",
    title: i.invoice_number,
    subtitle: compact([i.bill_to_name, i.contractor_name]) || null,
    href: `/invoices/${i.id}`,
  }));

  // NEW: employee suggestions → roster (no per-employee detail page exists)
  const employeeSuggestions: SearchSuggestion[] = employees.map((e) => ({
    id: `employee:${e.id}`,
    type: "employee",
    title: e.name,
    subtitle: compact([e.job_title ?? e.role, e.email, e.phone]) || null,
    href: `/employees-crews/roster?highlight=${e.id}`,
  }));

  // NEW: crew suggestions
  const crewSuggestions: SearchSuggestion[] = crews.map((c) => ({
    id: `crew:${c.id}`,
    type: "crew",
    title: c.name,
    subtitle: compact([c.specialization, c.description]) || null,
    href: `/employees-crews/crews?highlight=${c.id}`,
  }));

  // NEW: payment suggestions — title is ref#, subtitle shows payee + amount
  const paymentSuggestions: SearchSuggestion[] = payments.map((p) => {
    const payee =
      p.paid_to_type === "crew"
        ? crewNameMap.get(p.paid_to_id ?? "")
        : empNameMap.get(p.paid_to_id ?? "");
    return {
      id: `payment:${p.id}`,
      type: "payment",
      title: p.reference_number ?? `${p.payment_method ?? "Payment"}`,
      subtitle: compact([payee, p.payment_method, money(p.amount_cents)]) || null,
      href: `/payroll?highlight=${p.id}`,
    };
  });

  // NEW: expense suggestions — title is description, subtitle shows project + amount
  const expenseSuggestions: SearchSuggestion[] = expenses.map((e) => ({
    id: `expense:${e.id}`,
    type: "expense",
    title: e.description ?? "Expense",
    subtitle: compact([projectAddressMap.get(e.project_id), e.cost_type, money(e.amount_cents)]) || null,
    href: `/accounting?highlight=${e.project_id}`,
  }));

  // Merge in a user-meaningful order: core entities first, then people, then financial
  const suggestions = [
    ...projectSuggestions,
    ...jobSuggestions,
    ...employeeSuggestions,
    ...crewSuggestions,
    ...invoiceSuggestions,
    ...paymentSuggestions,
    ...expenseSuggestions,
  ].slice(0, TOTAL_LIMIT);

  return NextResponse.json({ suggestions });
}
