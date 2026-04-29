"use server";

// Onboarding: payroll actions record, refund, and delete payee payments. The
// main UI is `components/payroll/payroll-page.tsx`; job assignment originates
// from `components/jobs/completed-by-combobox.tsx`.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";

function parseAmountToCents(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}

function paymentMethodLabel(method: string) {
  if (method === "check") return "Check";
  if (method === "card") return "Card";
  if (method === "wire") return "Wire";
  return "E-pay";
}

async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) redirect("/login");

  return { supabase, user, companyId };
}

function isMissingColumnError(error: { message?: string } | null | undefined, column: string) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("does not exist") && message.includes(column.toLowerCase());
}

async function getPaymentContext(paymentId: string, companyId: string) {
  const supabase = await createClient();

  const paymentSelect =
    "id, company_id, job_id, paid_to_type, paid_to_id, amount_cents, payment_method, reference_number, paid_at, refunded_at, refund_reason, jobs!inner(project_id, title)";
  const fallbackPaymentSelect =
    "id, company_id, job_id, paid_to_type, paid_to_id, amount_cents, payment_method, reference_number, paid_at, jobs!inner(project_id, title)";

  let { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select(paymentSelect)
    .eq("id", paymentId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (isMissingColumnError(paymentError, "payments.refunded_at")) {
    const fallbackResult = await supabase
      .from("payments")
      .select(fallbackPaymentSelect)
      .eq("id", paymentId)
      .eq("company_id", companyId)
      .maybeSingle();

    payment = fallbackResult.data
      ? {
          ...fallbackResult.data,
          refunded_at: null,
          refund_reason: null,
        }
      : null;
    paymentError = fallbackResult.error;
  }

  if (paymentError) return { supabase, payment: null, paymentError };
  return { supabase, payment, paymentError: null };
}

function getPaymentProject(payment: {
  jobs: { project_id: string; title: string } | Array<{ project_id: string; title: string }>;
}) {
  return Array.isArray(payment.jobs) ? payment.jobs[0] : payment.jobs;
}

export async function markJobCompleteFromPayroll(jobId: string) {
  const { supabase, companyId } = await requireSession();
  if (!jobId) return { ok: false, message: "Job ID is required." };

  const { error } = await supabase
    .from("jobs")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("company_id", companyId)
    .is("deleted_at", null);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/payroll");
  revalidatePath("/projects");
  return { ok: true };
}

export async function addPayrollPayment(formData: FormData) {
  const { supabase, user, companyId } = await requireSession();

  const jobId = String(formData.get("job_id") ?? "").trim();
  const paidToType = String(formData.get("paid_to_type") ?? "").trim();
  const paidToId = String(formData.get("paid_to_id") ?? "").trim();
  const paidToName = String(formData.get("paid_to_name") ?? "").trim();
  const paymentMethod = String(formData.get("payment_method") ?? "").trim();
  const referenceNumber = String(formData.get("reference_number") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const splitMode = String(formData.get("split_mode") ?? "grouped").trim();
  const allowDuplicate = String(formData.get("allow_duplicate") ?? "false") === "true";

  if (!jobId) return { ok: false, message: "Job is required." };
  if (paidToType !== "employee" && paidToType !== "crew") {
    return { ok: false, message: "Payee type must be employee or crew." };
  }
  if (!paidToId) return { ok: false, message: "Assigned employee/crew is required." };

  if (!["check", "card", "wire", "epay"].includes(paymentMethod)) {
    return { ok: false, message: "Select a valid payment method." };
  }

  if (!referenceNumber) {
    if (paymentMethod === "check") {
      return { ok: false, message: "Check number is required." };
    }
    if (paymentMethod === "card") {
      return { ok: false, message: "Card last 4 digits are required." };
    }
    return { ok: false, message: "Transaction/confirmation number is required." };
  }

  const amountCents = parseAmountToCents(amountRaw);
  if (amountCents === null) {
    return { ok: false, message: "Enter a valid payment amount." };
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, project_id, title")
    .eq("id", jobId)
    .eq("company_id", companyId)
    .is("deleted_at", null)
    .maybeSingle();

  if (jobError) return { ok: false, message: jobError.message };
  if (!job?.project_id) return { ok: false, message: "Job not found." };

  if (!allowDuplicate) {
    let { data: existing, error: existingErr } = await supabase
      .from("payments")
      .select("id, refunded_at")
      .eq("company_id", companyId)
      .eq("job_id", jobId)
      .eq("paid_to_type", paidToType)
      .eq("paid_to_id", paidToId)
      .is("refunded_at", null)
      .limit(1);

    if (isMissingColumnError(existingErr, "payments.refunded_at")) {
      const fallbackExisting = await supabase
        .from("payments")
        .select("id")
        .eq("company_id", companyId)
        .eq("job_id", jobId)
        .eq("paid_to_type", paidToType)
        .eq("paid_to_id", paidToId)
        .limit(1);

      existing = fallbackExisting.data?.map((row) => ({ ...row, refunded_at: null })) ?? null;
      existingErr = fallbackExisting.error;
    }

    if (existingErr) return { ok: false, message: existingErr.message };
    if ((existing ?? []).length > 0) {
      return {
        ok: false,
        message:
          "A payment for this job and assignee already exists. Enable duplicate payment to continue.",
      };
    }
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
    company_id: companyId,
    created_by: user.id,
    job_id: jobId,
    paid_to_type: paidToType,
    paid_to_id: paidToId,
    amount_cents: amountCents,
    payment_method: paymentMethod,
    reference_number: referenceNumber,
    split_mode: splitMode === "split_equally" ? "split_equally" : "grouped",
    allow_duplicate: allowDuplicate,
    paid_at: new Date().toISOString(),
    })
    .select("id, paid_at")
    .single();

  if (error) return { ok: false, message: error.message };

  const expenseName = paidToName
    ? `Payroll • ${paidToName}`
    : `Payroll • ${job.title}`;
  const expenseDescription = [
    "Auto-created from payroll payment.",
    `Job: ${job.title}`,
    `Method: ${paymentMethodLabel(paymentMethod)}`,
    `Reference: ${referenceNumber}`,
  ].join(" ");
  const expenseDate = (payment?.paid_at ?? new Date().toISOString()).slice(0, 10);

  const expensePayload = {
    project_id: job.project_id,
    company_id: companyId,
    created_by: user.id,
    payment_id: payment.id,
    source_type: "payroll" as const,
    name: expenseName,
    description: expenseDescription,
    category: "Labor",
    cost_type: "direct" as const,
    value_type: "actual" as const,
    amount_cents: amountCents,
    expense_date: expenseDate,
  };

  let expenseError: { message: string } | null = null;

  const { error: linkedExpenseError } = await supabase
    .from("project_expenses")
    .insert(expensePayload);

  if (linkedExpenseError) {
    const normalized = linkedExpenseError.message.toLowerCase();
    if (
      normalized.includes("payment_id") ||
      normalized.includes("source_type") ||
      normalized.includes("schema cache") ||
      normalized.includes("column")
    ) {
      const { error: fallbackExpenseError } = await supabase
        .from("project_expenses")
        .insert({
          project_id: job.project_id,
          company_id: companyId,
          created_by: user.id,
          name: expenseName,
          description: `${expenseDescription} [Payroll Sync ${payment.id}]`,
          category: "Labor",
          cost_type: "direct",
          value_type: "actual",
          amount_cents: amountCents,
          expense_date: expenseDate,
        });

      if (fallbackExpenseError) {
        expenseError = fallbackExpenseError;
      }
    } else {
      expenseError = linkedExpenseError;
    }
  }

  if (expenseError) {
    await supabase.from("payments").delete().eq("id", payment.id).eq("company_id", companyId);
    return {
      ok: false,
      message: `Payment could not be synced into accounting: ${expenseError.message}`,
    };
  }

  revalidatePath("/payroll");
  revalidatePath("/projects");
  revalidatePath("/accounting");
  revalidatePath(`/accounting/${job.project_id}`);
  revalidatePath(`/projects/${job.project_id}/accounting`);
  return { ok: true };
}

export async function deletePayrollPayment(paymentId: string) {
  const { companyId } = await requireSession();
  if (!paymentId) return { ok: false, message: "Payment ID is required." };

  const { supabase, payment, paymentError } = await getPaymentContext(paymentId, companyId);
  if (paymentError) return { ok: false, message: paymentError.message };
  if (!payment) return { ok: false, message: "Payment not found." };

  const { error: deleteExpenseError } = await supabase
    .from("project_expenses")
    .delete()
    .eq("company_id", companyId)
    .or(`payment_id.eq.${paymentId},description.ilike.%[Payroll Sync ${paymentId}]%`);

  if (deleteExpenseError) {
    return {
      ok: false,
      message: `Could not remove linked accounting expense: ${deleteExpenseError.message}`,
    };
  }

  const { error: deletePaymentError } = await supabase
    .from("payments")
    .delete()
    .eq("id", paymentId)
    .eq("company_id", companyId);

  if (deletePaymentError) {
    return { ok: false, message: deletePaymentError.message };
  }

  const paymentJob = getPaymentProject(payment);
  const projectId = paymentJob?.project_id;
  if (!projectId) return { ok: false, message: "Linked project not found." };
  revalidatePath("/payroll");
  revalidatePath("/projects");
  revalidatePath("/accounting");
  revalidatePath(`/accounting/${projectId}`);
  revalidatePath(`/projects/${projectId}/accounting`);
  return { ok: true };
}

export async function refundPayrollPayment(paymentId: string, refundReason?: string) {
  const { companyId } = await requireSession();
  if (!paymentId) return { ok: false, message: "Payment ID is required." };

  const { supabase, payment, paymentError } = await getPaymentContext(paymentId, companyId);
  if (paymentError) return { ok: false, message: paymentError.message };
  if (!payment) return { ok: false, message: "Payment not found." };
  if (payment.refunded_at) return { ok: false, message: "Payment is already refunded." };

  const refundTimestamp = new Date().toISOString();
  const normalizedReason = refundReason?.trim() || null;

  const { error: refundExpenseError } = await supabase
    .from("project_expenses")
    .delete()
    .eq("company_id", companyId)
    .or(`payment_id.eq.${paymentId},description.ilike.%[Payroll Sync ${paymentId}]%`);

  if (refundExpenseError) {
    return {
      ok: false,
      message: `Could not reverse linked accounting expense: ${refundExpenseError.message}`,
    };
  }

  const { error: refundPaymentError } = await supabase
    .from("payments")
    .update({
      refunded_at: refundTimestamp,
      refund_reason: normalizedReason,
    })
    .eq("id", paymentId)
    .eq("company_id", companyId);

  if (isMissingColumnError(refundPaymentError, "payments.refunded_at")) {
    return {
      ok: false,
      message:
        "Refund tracking columns are not in your database yet. Run the latest payroll SQL migration, then try refunding again.",
    };
  }

  if (refundPaymentError) {
    return { ok: false, message: refundPaymentError.message };
  }

  const paymentJob = getPaymentProject(payment);
  const projectId = paymentJob?.project_id;
  if (!projectId) return { ok: false, message: "Linked project not found." };
  revalidatePath("/payroll");
  revalidatePath("/projects");
  revalidatePath("/accounting");
  revalidatePath(`/accounting/${projectId}`);
  revalidatePath(`/projects/${projectId}/accounting`);
  return { ok: true };
}
