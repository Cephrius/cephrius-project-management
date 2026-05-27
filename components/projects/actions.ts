"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type JobRow = {
  id: string;
  title: string;
  is_completed: boolean;
  scheduled_completion: string | null;
  price_cents: number | null;
  is_invoiced: boolean;
  is_paid: boolean;
};

async function syncInvoicePaidStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoiceId: string,
  paidAt: string,
) {
  const { data: invoiceItems, error: invoiceItemsError } = await supabase
    .from("invoice_items")
    .select("is_paid")
    .eq("invoice_id", invoiceId);

  if (invoiceItemsError) {
    return { ok: false, message: invoiceItemsError.message };
  }

  const allPaid =
    (invoiceItems ?? []).length > 0 &&
    (invoiceItems ?? []).every((item) => item.is_paid);

  const { data: updatedInvoice, error: invoiceUpdateError } = await supabase
    .from("invoices")
    .update({
      is_paid: allPaid,
      paid_at: allPaid ? paidAt : null,
    })
    .eq("id", invoiceId)
    .select("id")
    .maybeSingle();

  if (invoiceUpdateError) {
    return { ok: false, message: invoiceUpdateError.message };
  }

  if (!updatedInvoice) {
    return {
      ok: false,
      message: "Could not update the invoice payment status.",
    };
  }

  return { ok: true };
}

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
    .select("id, title, is_completed, scheduled_completion, price_cents, is_invoiced, is_paid")
    .eq("project_id", projectId)
    .eq("company_id", companyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) return { ok: false, jobs: [], message: error.message };

  const jobs = (data ?? []) as JobRow[];
  return { ok: true, jobs, message: null };
}

export async function markProjectJobPaid(jobId: string, isPaid = true) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) return { ok: false, message: "No active company found." };

  const { data: job, error: jobFetchError } = await supabase
    .from("jobs")
    .select("id, project_id, is_completed")
    .eq("id", jobId)
    .eq("company_id", companyId)
    .is("deleted_at", null)
    .maybeSingle();

  if (jobFetchError) return { ok: false, message: jobFetchError.message };
  if (!job) return { ok: false, message: "Job not found." };

  // Project-side payment collection is completion-gated, but unmarking paid is
  // always allowed so an accidental payment can be corrected even after edits.
  if (isPaid && !job.is_completed) {
    return { ok: false, message: "Only completed jobs can be marked as paid." };
  }

  const paidAt = new Date().toISOString();

  const { data: updatedJob, error: jobUpdateError } = await supabase
    .from("jobs")
    .update({ is_paid: isPaid, paid_at: isPaid ? paidAt : null })
    .eq("id", jobId)
    .eq("company_id", companyId)
    .select("id")
    .maybeSingle();

  if (jobUpdateError) return { ok: false, message: jobUpdateError.message };
  if (!updatedJob) {
    return { ok: false, message: "Could not update the job payment status." };
  }

  const { data: invoiceItems, error: invoiceItemsFetchError } = await supabase
    .from("invoice_items")
    .select("id, invoice_id")
    .eq("job_id", jobId);

  if (invoiceItemsFetchError) {
    return { ok: false, message: invoiceItemsFetchError.message };
  }

  const invoiceIds = Array.from(
    new Set(
      (invoiceItems ?? [])
        .map((item) => item.invoice_id)
        .filter((invoiceId): invoiceId is string => Boolean(invoiceId)),
    ),
  );

  if ((invoiceItems ?? []).length > 0) {
    const { data: updatedItems, error: invoiceItemsUpdateError } =
      await supabase
        .from("invoice_items")
        .update({ is_paid: isPaid, paid_at: isPaid ? paidAt : null })
        .eq("job_id", jobId)
        .select("id");

    if (invoiceItemsUpdateError) {
      return { ok: false, message: invoiceItemsUpdateError.message };
    }

    if (!updatedItems || updatedItems.length === 0) {
      return {
        ok: false,
        message: "Could not update the linked invoice item payment status.",
      };
    }
  }

  // If this completed job is on an invoice, keep the invoice list/detail pages
  // honest by recalculating each affected invoice after the line item flips paid.
  for (const invoiceId of invoiceIds) {
    const result = await syncInvoicePaidStatus(supabase, invoiceId, paidAt);
    if (!result.ok) return result;
  }

  revalidatePath("/projects", "layout");
  revalidatePath(`/projects/${job.project_id}`);
  revalidatePath("/invoices", "layout");
  for (const invoiceId of invoiceIds) {
    revalidatePath(`/invoices/${invoiceId}`);
  }

  return { ok: true };
}
