import { redirect } from "next/navigation";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";
import { EmployeeRosterPageClient } from "@/components/employees/roster-page";
import type { EmployeeProfile } from "@/components/employees/employees-page";

export default async function EmployeeRosterPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) redirect("/login");

  const { data, error: fetchError } = await supabase
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
    .order("name", { ascending: true });

  if (fetchError) {
    return <p className="text-sm text-destructive">{fetchError.message}</p>;
  }

  return (
    <>
      <BreadcrumbSetter
        crumbs={[
          { label: "Employees & Crews", href: "/employees-crews" },
          { label: "Full Roster" },
        ]}
      />
      <EmployeeRosterPageClient employees={(data ?? []) as EmployeeProfile[]} />
    </>
  );
}
