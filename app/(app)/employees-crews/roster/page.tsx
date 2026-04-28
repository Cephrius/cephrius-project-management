import { redirect } from "next/navigation";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";
import {
  EmployeeRosterPageClient,
  type EmployeePaymentRecord,
} from "@/components/employees/roster-page";
import type { EmployeeProfile } from "@/components/employees/employees-page";

function isMissingColumnError(message: string | undefined) {
  const normalized = (message ?? "").toLowerCase();
  return normalized.includes("column") && normalized.includes("does not exist");
}

export default async function EmployeeRosterPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) redirect("/login");

  const [employeesRes, jobsRes, projectsRes, paymentsRes] = await Promise.all([
    supabase
      .from("employees")
      .select(
        `id, name, contact_info, role, job_title, employment_type,
         is_active, email, phone, address,
         hourly_rate, pay_type, hire_date,
         payment_method, payment_details,
         login_handle,
         notes, created_at`,
      )
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("jobs")
      .select("id, project_id, title")
      .eq("company_id", companyId)
      .is("deleted_at", null),
    supabase
      .from("projects")
      .select("id, project_address")
      .eq("company_id", companyId)
      .is("deleted_at", null),
    supabase
      .from("payments")
      .select(
        "id, job_id, paid_to_type, paid_to_id, amount_cents, payment_method, reference_number, paid_at, refunded_at, refund_reason",
      )
      .eq("company_id", companyId)
      .eq("paid_to_type", "employee")
      .order("paid_at", { ascending: false })
      .limit(500),
  ]);

  const resolvedPaymentsRes =
    paymentsRes.error && isMissingColumnError(paymentsRes.error.message)
      ? await supabase
          .from("payments")
          .select(
            "id, job_id, paid_to_type, paid_to_id, amount_cents, payment_method, reference_number, paid_at",
          )
          .eq("company_id", companyId)
          .eq("paid_to_type", "employee")
          .order("paid_at", { ascending: false })
          .limit(500)
      : paymentsRes;

  if (employeesRes.error) {
    return <p className="text-sm text-destructive">{employeesRes.error.message}</p>;
  }
  if (jobsRes.error) {
    return <p className="text-sm text-destructive">{jobsRes.error.message}</p>;
  }
  if (projectsRes.error) {
    return <p className="text-sm text-destructive">{projectsRes.error.message}</p>;
  }
  if (resolvedPaymentsRes.error) {
    return (
      <p className="text-sm text-destructive">
        {resolvedPaymentsRes.error.message}
      </p>
    );
  }

  const projectAddressById = new Map(
    (projectsRes.data ?? []).map((project) => [project.id, project.project_address]),
  );
  const jobById = new Map((jobsRes.data ?? []).map((job) => [job.id, job]));

  const payments: EmployeePaymentRecord[] = (resolvedPaymentsRes.data ?? []).map(
    (payment) => {
      const optional = payment as {
        refunded_at?: string | null;
        refund_reason?: string | null;
      };
      const job = jobById.get(payment.job_id);
      const projectAddress = job?.project_id
        ? projectAddressById.get(job.project_id) ?? "Unknown project"
        : "Unknown project";

      return {
        id: payment.id,
        employee_id: payment.paid_to_id ?? "",
        job_id: payment.job_id,
        job_title: job?.title ?? "Unknown job",
        project_address: projectAddress,
        amount_cents: payment.amount_cents,
        payment_method: payment.payment_method,
        reference_number: payment.reference_number,
        paid_at: payment.paid_at,
        refunded_at: optional.refunded_at ?? null,
        refund_reason: optional.refund_reason ?? null,
      };
    },
  );

  return (
    <>
      <BreadcrumbSetter
        crumbs={[
          { label: "Employees & Crews", href: "/employees-crews" },
          { label: "Full Roster" },
        ]}
      />
      <EmployeeRosterPageClient
        employees={(employeesRes.data ?? []) as EmployeeProfile[]}
        payments={payments}
      />
    </>
  );
}
