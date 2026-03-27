"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Mark a single invoice item (and its associated job) as paid or unpaid.
 * After toggling, recalculate whether the whole invoice should be marked paid.
 *
 * Every .update() now appends .select() so PostgREST uses RETURNING *.
 * If RLS silently blocks the write, 0 rows come back and we fail loudly
 * instead of returning { ok: true } with nothing persisted.
 */
export async function markInvoiceItemPaid(
  itemId: string,
  invoiceId: string,
  isPaid: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  // Fetch the item to get the job_id
  const { data: item, error: itemFetchErr } = await supabase
    .from("invoice_items")
    .select("id, job_id")
    .eq("id", itemId)
    .eq("invoice_id", invoiceId)
    .maybeSingle();

  if (itemFetchErr) return { ok: false, message: itemFetchErr.message };
  if (!item) return { ok: false, message: "Invoice item not found." };

  const now = new Date().toISOString();

  // ── Update the invoice item ──────────────────────────────────────────
  const { data: updatedItem, error: itemUpdateErr } = await supabase
    .from("invoice_items")
    .update({
      is_paid: isPaid,
      paid_at: isPaid ? now : null,
    })
    .eq("id", itemId)
    .select("id")
    .maybeSingle();

  if (itemUpdateErr) {
    console.error("[markInvoiceItemPaid] invoice_items update error:", itemUpdateErr.message);
    return { ok: false, message: itemUpdateErr.message };
  }
  if (!updatedItem) {
    console.error("[markInvoiceItemPaid] invoice_items update returned 0 rows — likely blocked by RLS");
    return {
      ok: false,
      message:
        "Could not update payment status. Please add an UPDATE policy for invoice_items in your Supabase RLS settings.",
    };
  }

  // ── Update the associated job ────────────────────────────────────────
  if (item.job_id) {
    const { data: updatedJob, error: jobUpdateErr } = await supabase
      .from("jobs")
      .update({
        is_paid: isPaid,
        paid_at: isPaid ? now : null,
      })
      .eq("id", item.job_id)
      .select("id")
      .maybeSingle();

    if (jobUpdateErr) {
      console.error("[markInvoiceItemPaid] jobs update error:", jobUpdateErr.message);
      return { ok: false, message: jobUpdateErr.message };
    }
    if (!updatedJob) {
      console.error("[markInvoiceItemPaid] jobs update returned 0 rows — likely blocked by RLS");
      return {
        ok: false,
        message:
          "Could not update job payment status. Please add an UPDATE policy for jobs in your Supabase RLS settings.",
      };
    }
  }

  // ── Recalculate invoice-level paid status ────────────────────────────
  const { data: allItems, error: allItemsErr } = await supabase
    .from("invoice_items")
    .select("is_paid")
    .eq("invoice_id", invoiceId);

  if (allItemsErr) return { ok: false, message: allItemsErr.message };

  const allPaid =
    (allItems ?? []).length > 0 && (allItems ?? []).every((i) => i.is_paid);

  const { data: updatedInvoice, error: invoiceUpdateErr } = await supabase
    .from("invoices")
    .update({
      is_paid: allPaid,
      paid_at: allPaid ? now : null,
    })
    .eq("id", invoiceId)
    .select("id")
    .maybeSingle();

  if (invoiceUpdateErr) {
    console.error("[markInvoiceItemPaid] invoices update error:", invoiceUpdateErr.message);
    return { ok: false, message: invoiceUpdateErr.message };
  }
  if (!updatedInvoice) {
    console.error("[markInvoiceItemPaid] invoices update returned 0 rows — likely blocked by RLS");
    return {
      ok: false,
      message:
        "Could not update invoice paid status. Please add an UPDATE policy for invoices in your Supabase RLS settings.",
    };
  }

  revalidatePath("/invoices", "layout");
  revalidatePath("/projects", "layout");

  return { ok: true };
}

/**
 * Mark an entire invoice (and all its items + associated jobs) as paid.
 * Called after user confirms the bulk-pay confirmation dialog.
 */
export async function markInvoicePaid(invoiceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  // Verify the invoice belongs to this user
  const { data: invoice, error: invoiceFetchErr } = await supabase
    .from("invoices")
    .select("id")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (invoiceFetchErr) return { ok: false, message: invoiceFetchErr.message };
  if (!invoice) return { ok: false, message: "Invoice not found." };

  const now = new Date().toISOString();

  // Fetch all items + their job_ids
  const { data: items, error: itemsFetchErr } = await supabase
    .from("invoice_items")
    .select("id, job_id")
    .eq("invoice_id", invoiceId);

  if (itemsFetchErr) return { ok: false, message: itemsFetchErr.message };

  const jobIds = (items ?? [])
    .map((i) => i.job_id)
    .filter((id): id is string => Boolean(id));

  // ── Mark all invoice items as paid ───────────────────────────────────
  const { data: updatedItems, error: itemsUpdateErr } = await supabase
    .from("invoice_items")
    .update({ is_paid: true, paid_at: now })
    .eq("invoice_id", invoiceId)
    .select("id");

  if (itemsUpdateErr) {
    console.error("[markInvoicePaid] invoice_items update error:", itemsUpdateErr.message);
    return { ok: false, message: itemsUpdateErr.message };
  }
  if (!updatedItems || updatedItems.length === 0) {
    console.error("[markInvoicePaid] invoice_items update returned 0 rows — likely blocked by RLS");
    return {
      ok: false,
      message:
        "Could not mark items as paid. Please add an UPDATE policy for invoice_items in your Supabase RLS settings.",
    };
  }

  // ── Mark all associated jobs as paid ─────────────────────────────────
  if (jobIds.length > 0) {
    const { data: updatedJobs, error: jobsUpdateErr } = await supabase
      .from("jobs")
      .update({ is_paid: true, paid_at: now })
      .in("id", jobIds)
      .select("id");

    if (jobsUpdateErr) {
      console.error("[markInvoicePaid] jobs update error:", jobsUpdateErr.message);
      return { ok: false, message: jobsUpdateErr.message };
    }
    if (!updatedJobs || updatedJobs.length === 0) {
      console.error("[markInvoicePaid] jobs update returned 0 rows — likely blocked by RLS");
      return {
        ok: false,
        message:
          "Could not mark jobs as paid. Please add an UPDATE policy for jobs in your Supabase RLS settings.",
      };
    }
  }

  // ── Mark the invoice itself as paid ──────────────────────────────────
  const { data: updatedInvoice, error: invoiceUpdateErr } = await supabase
    .from("invoices")
    .update({ is_paid: true, paid_at: now })
    .eq("id", invoiceId)
    .select("id")
    .maybeSingle();

  if (invoiceUpdateErr) {
    console.error("[markInvoicePaid] invoices update error:", invoiceUpdateErr.message);
    return { ok: false, message: invoiceUpdateErr.message };
  }
  if (!updatedInvoice) {
    console.error("[markInvoicePaid] invoices update returned 0 rows — likely blocked by RLS");
    return {
      ok: false,
      message:
        "Could not mark invoice as paid. Please add an UPDATE policy for invoices in your Supabase RLS settings.",
    };
  }

  revalidatePath("/invoices", "layout");
  revalidatePath("/projects", "layout");

  return { ok: true };
}
