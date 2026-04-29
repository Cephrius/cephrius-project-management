import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  DollarSign,
  FileText,
  FolderKanban,
  Receipt,
  UserRound,
  Users,
} from "lucide-react";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";
import { RecentSearches } from "@/components/search/recent-searches";
import { getRecentSearches, recordRecentSearch } from "./actions";

type SearchPageProps = { searchParams: Promise<{ q?: string; type?: string }> };

type ProjectRow = { id: string; project_address: string; builder_name: string | null; subdivision: string | null; created_at: string | null };
type JobRow = { id: string; title: string; project_id: string; superintendent: string | null; is_completed: boolean | null; created_at: string | null };
type InvoiceRow = { id: string; invoice_number: string; bill_to_name: string | null; contractor_name: string | null; invoice_date: string | null; subtotal_cents: number | null; created_at: string | null };
type EmployeeRow = { id: string; name: string; email: string | null; phone: string | null; role: string | null; job_title: string | null; is_active: boolean | null };
type CrewRow = { id: string; name: string; specialization: string | null; description: string | null; is_active: boolean | null };
type PaymentRow = { id: string; reference_number: string | null; payment_method: string | null; paid_to_type: string | null; paid_to_id: string | null; amount_cents: number | null; paid_at: string | null };
type ExpenseRow = { id: string; description: string | null; project_id: string; amount_cents: number | null; cost_type: string | null; expense_date: string | null };

type CategoryKey = "all" | "projects" | "jobs" | "employees" | "crews" | "invoices" | "payments" | "expenses";

function money(cents: number | null) {
  const value = cents ?? 0;
  return (value / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function toIlikePattern(value: string) {
  const normalized = value.trim().replace(/[(),]/g, " ").replace(/\s+/g, " ");
  return `%${normalized}%`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const typeParam = (params.type ?? "all") as CategoryKey;

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) redirect("/login");

  if (!q) {
    const recents = await getRecentSearches();
    return (
      <div className="space-y-6">
        <BreadcrumbSetter crumbs={[{ label: "Search", href: "/search" }]} />
        <Card className="p-8 shadow-none">
          <div className="text-lg font-semibold text-primary">Global Search</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Use the search bar in the header to find projects, jobs, invoices, employees, crews, payments, and expenses.
          </div>
        </Card>
        <RecentSearches recents={recents} />
      </div>
    );
  }

  await recordRecentSearch(q);

  const pattern = toIlikePattern(q);
  const PAGE_LIMIT = 15;

  const [projectsRes, jobsRes, invoicesRes, employeesRes, crewsRes, paymentsRes, expensesRes] = await Promise.all([
    supabase.from("projects").select("id, project_address, builder_name, subdivision, created_at").eq("company_id", companyId).is("deleted_at", null)
      .or(`project_address.ilike.${pattern},builder_name.ilike.${pattern},subdivision.ilike.${pattern}`)
      .order("created_at", { ascending: false }).limit(PAGE_LIMIT),
    supabase.from("jobs").select("id, title, project_id, superintendent, is_completed, created_at").eq("company_id", companyId).is("deleted_at", null)
      .or(`title.ilike.${pattern},superintendent.ilike.${pattern}`)
      .order("created_at", { ascending: false }).limit(PAGE_LIMIT),
    supabase.from("invoices").select("id, invoice_number, bill_to_name, contractor_name, invoice_date, subtotal_cents, created_at").eq("company_id", companyId).is("deleted_at", null)
      .or(`invoice_number.ilike.${pattern},bill_to_name.ilike.${pattern},contractor_name.ilike.${pattern}`)
      .order("created_at", { ascending: false }).limit(PAGE_LIMIT),
    supabase.from("employees").select("id, name, email, phone, role, job_title, is_active").eq("company_id", companyId).is("deleted_at", null)
      .or(`name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},role.ilike.${pattern},job_title.ilike.${pattern}`)
      .order("created_at", { ascending: false }).limit(PAGE_LIMIT),
    supabase.from("crews").select("id, name, specialization, description, is_active").eq("company_id", companyId).is("deleted_at", null)
      .or(`name.ilike.${pattern},specialization.ilike.${pattern},description.ilike.${pattern}`)
      .order("created_at", { ascending: false }).limit(PAGE_LIMIT),
    supabase.from("payments").select("id, reference_number, payment_method, paid_to_type, paid_to_id, amount_cents, paid_at").eq("company_id", companyId)
      .or(`reference_number.ilike.${pattern},payment_method.ilike.${pattern}`)
      .order("paid_at", { ascending: false }).limit(PAGE_LIMIT),
    supabase.from("project_expenses").select("id, description, project_id, amount_cents, cost_type, expense_date").eq("company_id", companyId)
      .ilike("description", pattern)
      .order("created_at", { ascending: false }).limit(PAGE_LIMIT),
  ]);

  const firstError =
    projectsRes.error ?? jobsRes.error ?? invoicesRes.error ??
    employeesRes.error ?? crewsRes.error ?? paymentsRes.error ?? expensesRes.error;
  if (firstError) {
    return (
      <div className="space-y-6">
        <BreadcrumbSetter crumbs={[{ label: "Search", href: "/search" }]} />
        <Card className="p-8 shadow-none">
          <div className="text-sm text-muted-foreground">
            Failed to load search results: {firstError.message}
          </div>
        </Card>
      </div>
    );
  }

  const projects = (projectsRes.data ?? []) as ProjectRow[];
  const jobs = (jobsRes.data ?? []) as JobRow[];
  const invoices = (invoicesRes.data ?? []) as InvoiceRow[];
  const employees = (employeesRes.data ?? []) as EmployeeRow[];
  const crews = (crewsRes.data ?? []) as CrewRow[];
  const payments = (paymentsRes.data ?? []) as PaymentRow[];
  const expenses = (expensesRes.data ?? []) as ExpenseRow[];

  const jobProjectIds = jobs.map((j) => j.project_id).filter(Boolean);
  const expenseProjectIds = expenses.map((e) => e.project_id).filter(Boolean);
  const allProjectIds = Array.from(new Set([...jobProjectIds, ...expenseProjectIds]));
  const paymentEmployeeIds = payments.filter((p) => p.paid_to_type === "employee").map((p) => p.paid_to_id).filter(Boolean) as string[];
  const paymentCrewIds = payments.filter((p) => p.paid_to_type === "crew").map((p) => p.paid_to_id).filter(Boolean) as string[];

  let projectAddressMap = new Map<string, string>();
  let empNameMap = new Map<string, string>();
  let crewNameMap = new Map<string, string>();

  const joins: PromiseLike<unknown>[] = [];
  if (allProjectIds.length > 0) {
    joins.push(
      supabase.from("projects").select("id, project_address").in("id", allProjectIds).then((r) => {
        projectAddressMap = new Map((r.data ?? []).map((p) => [p.id as string, p.project_address as string]));
      }),
    );
  }
  if (paymentEmployeeIds.length > 0) {
    joins.push(
      supabase.from("employees").select("id, name").in("id", paymentEmployeeIds).then((r) => {
        empNameMap = new Map((r.data ?? []).map((e) => [e.id as string, e.name as string]));
      }),
    );
  }
  if (paymentCrewIds.length > 0) {
    joins.push(
      supabase.from("crews").select("id, name").in("id", paymentCrewIds).then((r) => {
        crewNameMap = new Map((r.data ?? []).map((c) => [c.id as string, c.name as string]));
      }),
    );
  }
  await Promise.all(joins);

  const counts: Record<Exclude<CategoryKey, "all">, number> = {
    projects: projects.length,
    jobs: jobs.length,
    employees: employees.length,
    crews: crews.length,
    invoices: invoices.length,
    payments: payments.length,
    expenses: expenses.length,
  };
  const totalResults = Object.values(counts).reduce((a, b) => a + b, 0);

  const filterHref = (key: CategoryKey) =>
    `/search?q=${encodeURIComponent(q)}${key === "all" ? "" : `&type=${key}`}`;

  const activeType: CategoryKey =
    typeParam === "all" || counts[typeParam as Exclude<CategoryKey, "all">] !== undefined
      ? typeParam
      : "all";

  const show = (key: Exclude<CategoryKey, "all">) =>
    (activeType === "all" || activeType === key) && counts[key] > 0;

  const filterTabs: { key: CategoryKey; label: string; count: number; icon: React.ReactNode }[] = [
    { key: "all", label: "All", count: totalResults, icon: null },
    { key: "projects", label: "Projects", count: counts.projects, icon: <FolderKanban className="size-3.5" /> },
    { key: "jobs", label: "Jobs", count: counts.jobs, icon: <Briefcase className="size-3.5" /> },
    { key: "employees", label: "Employees", count: counts.employees, icon: <UserRound className="size-3.5" /> },
    { key: "crews", label: "Crews", count: counts.crews, icon: <Users className="size-3.5" /> },
    { key: "invoices", label: "Invoices", count: counts.invoices, icon: <FileText className="size-3.5" /> },
    { key: "payments", label: "Payments", count: counts.payments, icon: <DollarSign className="size-3.5" /> },
    { key: "expenses", label: "Expenses", count: counts.expenses, icon: <Receipt className="size-3.5" /> },
  ];

  return (
    <div className="space-y-6 pb-6">
      <BreadcrumbSetter crumbs={[{ label: "Search", href: "/search" }]} />

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primary">Search Results</h1>
        <p className="text-sm text-muted-foreground">
          {totalResults} result{totalResults === 1 ? "" : "s"} for{" "}
          <span className="font-medium text-foreground">&ldquo;{q}&rdquo;</span>
        </p>
      </div>

      {totalResults > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filterTabs
            .filter((tab) => tab.key === "all" || tab.count > 0)
            .map((tab) => {
              const active = activeType === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={filterHref(tab.key)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition " +
                    (active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary")
                  }
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    className={
                      "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums " +
                      (active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")
                    }
                  >
                    {tab.count}
                  </span>
                </Link>
              );
            })}
        </div>
      )}

      {totalResults === 0 ? (
        <Card className="p-10 text-center shadow-none">
          <div className="text-sm font-medium text-foreground">No results found</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Nothing matched &ldquo;{q}&rdquo;. Try a different term or check your spelling.
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {show("projects") && (
            <Section title="Projects" count={counts.projects} icon={<FolderKanban className="size-4" />}>
              {projects.map((p) => (
                <ResultRow
                  key={p.id}
                  href={`/projects/${p.id}`}
                  leading={<IconBadge><FolderKanban className="size-4" /></IconBadge>}
                  title={p.project_address}
                  subtitle={[p.builder_name ?? "Unassigned builder", p.subdivision ?? "No subdivision"].join(" · ")}
                />
              ))}
            </Section>
          )}

          {show("jobs") && (
            <Section title="Jobs" count={counts.jobs} icon={<Briefcase className="size-4" />}>
              {jobs.map((job) => (
                <ResultRow
                  key={job.id}
                  href={`/projects/${job.project_id}?highlight=${job.id}`}
                  leading={<IconBadge><Briefcase className="size-4" /></IconBadge>}
                  title={job.title}
                  subtitle={`${projectAddressMap.get(job.project_id) ?? "Unknown project"} · ${job.superintendent ?? "No superintendent"}`}
                  trailing={
                    <Badge variant="outline" className={job.is_completed ? "border-green-200 bg-green-50 text-green-700" : "border-primary/30 bg-primary/10 text-primary"}>
                      {job.is_completed ? "Completed" : "Open"}
                    </Badge>
                  }
                />
              ))}
            </Section>
          )}

          {show("employees") && (
            <Section title="Employees" count={counts.employees} icon={<UserRound className="size-4" />}>
              {employees.map((e) => (
                <ResultRow
                  key={e.id}
                  href={`/employees-crews/roster?highlight=${e.id}`}
                  leading={
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials(e.name)}
                    </div>
                  }
                  title={e.name}
                  subtitle={[
                    e.job_title ?? e.role ?? "Role unset",
                    e.email ?? e.phone ?? null,
                  ].filter(Boolean).join(" · ")}
                  trailing={
                    e.is_active === false ? (
                      <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                    ) : (
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Active</Badge>
                    )
                  }
                />
              ))}
            </Section>
          )}

          {show("crews") && (
            <Section title="Crews" count={counts.crews} icon={<Users className="size-4" />}>
              {crews.map((c) => (
                <ResultRow
                  key={c.id}
                  href={`/employees-crews/crews?highlight=${c.id}`}
                  leading={<IconBadge><Users className="size-4" /></IconBadge>}
                  title={c.name}
                  subtitle={c.specialization ?? c.description ?? "No specialization"}
                  trailing={
                    c.is_active === false ? (
                      <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                    ) : (
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Active</Badge>
                    )
                  }
                />
              ))}
            </Section>
          )}

          {show("invoices") && (
            <Section title="Invoices" count={counts.invoices} icon={<FileText className="size-4" />}>
              {invoices.map((invoice) => (
                <ResultRow
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  leading={<IconBadge><FileText className="size-4" /></IconBadge>}
                  title={invoice.invoice_number}
                  subtitle={`${invoice.bill_to_name ?? "Unassigned"} · from ${invoice.contractor_name ?? "Unknown"}`}
                  trailing={<span className="text-sm font-semibold tabular-nums">{money(invoice.subtotal_cents)}</span>}
                />
              ))}
            </Section>
          )}

          {show("payments") && (
            <Section title="Payments" count={counts.payments} icon={<DollarSign className="size-4" />}>
              {payments.map((p) => {
                const payee = p.paid_to_type === "crew"
                  ? crewNameMap.get(p.paid_to_id ?? "")
                  : empNameMap.get(p.paid_to_id ?? "");
                return (
                  <ResultRow
                    key={p.id}
                    href={`/payroll?highlight=${p.id}`}
                    leading={<IconBadge><DollarSign className="size-4" /></IconBadge>}
                    title={p.reference_number ?? "(no reference)"}
                    subtitle={`${payee ?? "—"}${p.paid_to_type ? ` (${p.paid_to_type})` : ""} · ${p.payment_method ?? "—"}`}
                    trailing={<span className="text-sm font-semibold tabular-nums">{money(p.amount_cents)}</span>}
                  />
                );
              })}
            </Section>
          )}

          {show("expenses") && (
            <Section title="Expenses" count={counts.expenses} icon={<Receipt className="size-4" />}>
              {expenses.map((e) => (
                <ResultRow
                  key={e.id}
                  href={`/accounting?highlight=${e.project_id}`}
                  leading={<IconBadge><Receipt className="size-4" /></IconBadge>}
                  title={e.description ?? "Expense"}
                  subtitle={`${projectAddressMap.get(e.project_id) ?? "Unknown project"} · ${e.cost_type ?? "—"}`}
                  trailing={<span className="text-sm font-semibold tabular-nums">{money(e.amount_cents)}</span>}
                />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  icon,
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden shadow-none">
      <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          {icon}
          {title}
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {count} {count === 1 ? "result" : "results"}
        </span>
      </div>
      <div className="divide-y">{children}</div>
    </Card>
  );
}

function ResultRow({
  href,
  leading,
  title,
  subtitle,
  trailing,
}: {
  href: string;
  leading: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted/30"
    >
      {leading}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{title}</div>
        {subtitle && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</div>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
      <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
      {children}
    </div>
  );
}
