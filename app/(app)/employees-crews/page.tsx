import { redirect } from "next/navigation";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";
import {
  EmployeesPageClient,
  type CrewProfile,
  type EmployeeProfile,
} from "@/components/employees/employees-page";
import type { WorkforceJob, WorkforcePayment } from "@/components/employees/types";

function isMissingColumnError(message: string | undefined) {
  const normalized = (message ?? "").toLowerCase();
  return normalized.includes("column") && normalized.includes("does not exist");
}

export default async function EmployeesPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) redirect("/login");

  const [employeesRes, crewsRes, crewMembersRes, jobsRes, projectsRes, paymentsRes] =
    await Promise.all([
    supabase
      .from("employees")
      .select(
        `id, name, contact_info, role, job_title, employment_type,
         is_active, email, phone, address,
         hourly_rate, pay_type, hire_date,
         payment_method, payment_details,
         notes, created_at`,
      )
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("crews")
      .select(
        `id, name, notes, description, crew_lead_id, specialization,
         is_active, created_at`,
      )
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("crew_members")
      .select("crew_id, employee_id")
      .eq("company_id", companyId),
    supabase
      .from("jobs")
      .select(
        `id, project_id, title, created_at, is_completed, completed_at,
         completed_by_type, completed_by_id, completed_by_name`,
      )
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .not("completed_by_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("projects")
      .select("id, project_address")
      .eq("company_id", companyId)
      .is("deleted_at", null),
    supabase
      .from("payments")
      .select("id, job_id, paid_to_type, paid_to_id, amount_cents, paid_at, refunded_at")
      .eq("company_id", companyId)
      .order("paid_at", { ascending: false })
      .limit(250),
  ]);

  const resolvedPaymentsRes =
    paymentsRes.error && isMissingColumnError(paymentsRes.error.message)
      ? await supabase
          .from("payments")
          .select("id, job_id, paid_to_type, paid_to_id, amount_cents, paid_at")
          .eq("company_id", companyId)
          .order("paid_at", { ascending: false })
          .limit(250)
      : paymentsRes;

  if (employeesRes.error) {
    return (
      <p className="text-sm text-destructive">{employeesRes.error.message}</p>
    );
  }

  if (crewsRes.error) {
    return (
      <p className="text-sm text-destructive">{crewsRes.error.message}</p>
    );
  }

  if (crewMembersRes.error) {
    return (
      <p className="text-sm text-destructive">
        {crewMembersRes.error.message}
      </p>
    );
  }

  if (jobsRes.error) {
    return <p className="text-sm text-destructive">{jobsRes.error.message}</p>;
  }

  if (projectsRes.error) {
    return (
      <p className="text-sm text-destructive">{projectsRes.error.message}</p>
    );
  }

  if (resolvedPaymentsRes.error) {
    return (
      <p className="text-sm text-destructive">
        {resolvedPaymentsRes.error.message}
      </p>
    );
  }

  const employees = (employeesRes.data ?? []) as EmployeeProfile[];
  const crewsRaw = crewsRes.data ?? [];
  const crewMembers = crewMembersRes.data ?? [];
  const projectAddressById = new Map(
    (projectsRes.data ?? []).map((project) => [project.id, project.project_address]),
  );

  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const memberIdsByCrew = new Map<string, string[]>();

  for (const member of crewMembers) {
    const list = memberIdsByCrew.get(member.crew_id) ?? [];
    list.push(member.employee_id);
    memberIdsByCrew.set(member.crew_id, list);
  }

  const crews: CrewProfile[] = crewsRaw.map((crew) => {
    const memberIds = memberIdsByCrew.get(crew.id) ?? [];
    const memberNames = memberIds
      .map((id) => employeeById.get(id)?.name)
      .filter((name): name is string => Boolean(name));

    const crewLead = crew.crew_lead_id
      ? employeeById.get(crew.crew_lead_id)
      : null;

    return {
      ...crew,
      crew_lead_name: crewLead?.name ?? null,
      member_ids: memberIds,
      member_names: memberNames,
    };
  });

  const jobs: WorkforceJob[] = (jobsRes.data ?? []).map((job) => ({
    id: job.id,
    title: job.title,
    project_id: job.project_id,
    project_address: projectAddressById.get(job.project_id) ?? "Unknown project",
    created_at: job.created_at,
    is_completed: Boolean(job.is_completed),
    completed_at: job.completed_at,
    completed_by_type:
      job.completed_by_type === "crew" || job.completed_by_type === "employee"
        ? job.completed_by_type
        : null,
    completed_by_id: job.completed_by_id ?? null,
    completed_by_name: job.completed_by_name ?? null,
  }));

  const payments: WorkforcePayment[] = (resolvedPaymentsRes.data ?? []).map(
    (payment) => {
      const paymentWithOptionalRefund = payment as { refunded_at?: string | null };
      return {
        id: payment.id,
        job_id: payment.job_id,
        paid_to_type: payment.paid_to_type === "crew" ? "crew" : "employee",
        paid_to_id: payment.paid_to_id ?? "",
        amount_cents: payment.amount_cents,
        paid_at: payment.paid_at,
        refunded_at: paymentWithOptionalRefund.refunded_at ?? null,
      };
    },
  );

  return (
    <div className="space-y-6">
      <BreadcrumbSetter crumbs={[{ label: "Employees & Crews", href: "/employees-crews" }]} />
      <EmployeesPageClient
        employees={employees}
        crews={crews}
        jobs={jobs}
        payments={payments}
      />
    </div>
  );
}
