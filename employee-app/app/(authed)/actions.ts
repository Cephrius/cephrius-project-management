"use server";

// Onboarding: employee-app job mutations. Unlike contractor server actions,
// these derive authorization from `requireEmployee()` and then explicitly scope
// every write to the employee's `company_id`.
import { revalidatePath } from "next/cache";
import { requireEmployee } from "@/lib/auth/employee";
import { createServiceClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; message: string };

async function ensureJobInCompany(jobId: string, companyId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, company_id, completed_by_id, completed_by_type, is_completed")
    .eq("id", jobId)
    .eq("company_id", companyId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) return null;
  return data as {
    id: string;
    company_id: string;
    completed_by_id: string | null;
    completed_by_type: "employee" | "crew" | null;
    is_completed: boolean;
  };
}

export async function claimJob(jobId: string): Promise<Result> {
  const employee = await requireEmployee();
  const job = await ensureJobInCompany(jobId, employee.company_id);
  if (!job) return { ok: false, message: "Job not found." };
  if (job.completed_by_id && job.completed_by_id !== employee.id) {
    return { ok: false, message: "This job is already assigned to someone else." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("jobs")
    .update({
      completed_by_type: "employee",
      completed_by_id: employee.id,
      completed_by_name: employee.name,
    })
    .eq("id", jobId)
    .eq("company_id", employee.company_id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  revalidatePath("/my-jobs");
  revalidatePath("/all-jobs");
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true };
}

export async function markJobComplete(jobId: string): Promise<Result> {
  const employee = await requireEmployee();
  const job = await ensureJobInCompany(jobId, employee.company_id);
  if (!job) return { ok: false, message: "Job not found." };
  if (
    job.completed_by_type !== "employee" ||
    job.completed_by_id !== employee.id
  ) {
    return {
      ok: false,
      message: "Only the assigned employee can mark this job complete.",
    };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("jobs")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("company_id", employee.company_id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  revalidatePath("/my-jobs");
  revalidatePath("/all-jobs");
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true };
}

export async function reopenJob(jobId: string): Promise<Result> {
  const employee = await requireEmployee();
  const job = await ensureJobInCompany(jobId, employee.company_id);
  if (!job) return { ok: false, message: "Job not found." };
  if (
    job.completed_by_type !== "employee" ||
    job.completed_by_id !== employee.id
  ) {
    return {
      ok: false,
      message: "Only the assigned employee can reopen this job.",
    };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("jobs")
    .update({ is_completed: false, completed_at: null })
    .eq("id", jobId)
    .eq("company_id", employee.company_id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  revalidatePath("/my-jobs");
  revalidatePath("/all-jobs");
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true };
}
