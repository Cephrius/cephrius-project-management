import { redirect } from "next/navigation";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";
import {
  EmployeesPageClient,
  type CrewProfile,
  type EmployeeProfile,
} from "@/components/employees/employees-page";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) redirect("/login");

  const [employeesRes, crewsRes, crewMembersRes] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name, contact_info, role, notes, is_active, created_at")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("crews")
      .select("id, name, notes, is_active, created_at")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("crew_members")
      .select("crew_id, employee_id")
      .eq("company_id", companyId),
  ]);

  if (employeesRes.error) {
    return <p className="text-sm text-destructive">{employeesRes.error.message}</p>;
  }

  if (crewsRes.error) {
    return <p className="text-sm text-destructive">{crewsRes.error.message}</p>;
  }

  if (crewMembersRes.error) {
    return <p className="text-sm text-destructive">{crewMembersRes.error.message}</p>;
  }

  const employees = (employeesRes.data ?? []) as EmployeeProfile[];
  const crewsRaw = crewsRes.data ?? [];
  const crewMembers = crewMembersRes.data ?? [];

  const employeeNameById = new Map(employees.map((employee) => [employee.id, employee.name]));
  const memberIdsByCrew = new Map<string, string[]>();

  for (const member of crewMembers) {
    const list = memberIdsByCrew.get(member.crew_id) ?? [];
    list.push(member.employee_id);
    memberIdsByCrew.set(member.crew_id, list);
  }

  const crews: CrewProfile[] = crewsRaw.map((crew) => {
    const memberIds = memberIdsByCrew.get(crew.id) ?? [];
    const memberNames = memberIds
      .map((memberId) => employeeNameById.get(memberId))
      .filter((name): name is string => Boolean(name));

    return {
      ...crew,
      member_ids: memberIds,
      member_names: memberNames,
    };
  });

  return (
    <div className="space-y-6">
      <BreadcrumbSetter crumbs={[{ label: "Employees", href: "/employees" }]} />
      <EmployeesPageClient employees={employees} crews={crews} />
    </div>
  );
}
