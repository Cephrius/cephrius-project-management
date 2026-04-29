import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { createServiceClient } from "@/lib/supabase/server";

// Onboarding: this is the employee-app equivalent of an auth guard. It turns the
// signed cookie from `session.ts` into the employee row used by pages/actions.
export type CurrentEmployee = {
  id: string;
  name: string;
  login_handle: string | null;
  company_id: string;
  password_must_change: boolean;
};

export const getCurrentEmployee = cache(
  async (): Promise<CurrentEmployee | null> => {
    const session = await getSession();
    if (!session) return null;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("employees")
      .select("id, name, login_handle, company_id, password_must_change")
      .eq("id", session.employeeId)
      .eq("company_id", session.companyId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error || !data) return null;
    return data as CurrentEmployee;
  },
);

export async function requireEmployee(): Promise<CurrentEmployee> {
  const employee = await getCurrentEmployee();
  if (!employee) redirect("/login");
  return employee;
}
