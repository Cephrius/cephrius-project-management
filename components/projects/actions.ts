"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";
import { redirect } from "next/navigation";

type JobRow = {
  id: string;
  title: string;
  is_completed: boolean;
  scheduled_completion: string | null;
  price_cents: number | null;
};

export async function getProjectJobs(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) return { ok: false, jobs: [], message: "No active company found." };

  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, is_completed, scheduled_completion, price_cents")
    .eq("project_id", projectId)
    .eq("company_id", companyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) return { ok: false, jobs: [], message: error.message };

  const jobs = (data ?? []) as JobRow[];
  return { ok: true, jobs, message: null };
}
