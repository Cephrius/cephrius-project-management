import { redirect } from "next/navigation";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";
import { CrewsPageClient } from "@/components/employees/crews-page";
import type { CrewProfile, EmployeeProfile } from "@/components/employees/types";

export default async function CrewsPage() {
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
      .select("id, name, is_active")
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
  ]);

  if (employeesRes.error) return <p className="text-sm text-destructive">{employeesRes.error.message}</p>;
  if (crewsRes.error) return <p className="text-sm text-destructive">{crewsRes.error.message}</p>;
  if (crewMembersRes.error) return <p className="text-sm text-destructive">{crewMembersRes.error.message}</p>;

  const employeeById = new Map((employeesRes.data ?? []).map((e) => [e.id, e.name]));
  const memberIdsByCrew = new Map<string, string[]>();

  for (const member of crewMembersRes.data ?? []) {
    const list = memberIdsByCrew.get(member.crew_id) ?? [];
    list.push(member.employee_id);
    memberIdsByCrew.set(member.crew_id, list);
  }

  const crews: CrewProfile[] = (crewsRes.data ?? []).map((crew) => {
    const memberIds = memberIdsByCrew.get(crew.id) ?? [];
    const memberNames = memberIds
      .map((id) => employeeById.get(id))
      .filter((name): name is string => Boolean(name));
    const leadName = crew.crew_lead_id ? (employeeById.get(crew.crew_lead_id) ?? null) : null;

    return {
      ...crew,
      crew_lead_name: leadName,
      member_ids: memberIds,
      member_names: memberNames,
    };
  });

  const employees = (employeesRes.data ?? []).map((e) => ({ id: e.id, name: e.name, is_active: e.is_active ?? true })) as Pick<EmployeeProfile, "id" | "name" | "is_active">[];

  return (
    <>
      <BreadcrumbSetter
        crumbs={[
          { label: "Employees & Crews", href: "/employees-crews" },
          { label: "All Crews" },
        ]}
      />
      <CrewsPageClient crews={crews} employees={employees} />
    </>
  );
}
