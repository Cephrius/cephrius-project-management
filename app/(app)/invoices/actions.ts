"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveInvoiceDueDate } from "@/lib/settings/preferences";
import { redirect } from "next/navigation";

function formatInvoiceNumber() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${ymd}-${rand}`;
}

function parsePriceToCents(input: string) {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100);
}

export async function createInvoiceForBuilder(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await (await supabase).auth.getUser();

  if (userError || !user) redirect("/login");

  const contractor_name = String(formData.get("contractor_name") || "").trim();
  const contractor_address = String(
    formData.get("contractor_address") || "",
  ).trim();
  const contractor_phone = String(
    formData.get("contractor_phone") || "",
  ).trim();

  const bill_to_name = String(formData.get("bill_to_name") || "").trim();
  const bill_to_address = String(formData.get("bill_to_address") || "").trim();

  const invoice_date = String(formData.get("invoice_date") || "").trim(); // yyyy-mm-dd
  const due_date_raw = String(formData.get("due_date") || "").trim(); // optional

  const builder_id = String(formData.get("builder_id") || "").trim();
  const jobIds = formData.getAll("job_ids").map(String).filter(Boolean);

  if (!contractor_name)
    return { ok: false, message: "Contractor company name is required." };
  if (!bill_to_name)
    return { ok: false, message: "Builder name (bill to) is required." };
  if (!bill_to_address)
    return { ok: false, message: "Billing address is required." };
  if (!invoice_date) return { ok: false, message: "Invoice date is required." };
  if (!builder_id) return { ok: false, message: "Builder is required." };
  if (jobIds.length === 0)
    return { ok: false, message: "Select at least one completed job." };

  const due_date = resolveInvoiceDueDate(
    invoice_date,
    due_date_raw,
    user.user_metadata,
  );

  // Builder snapshot
  const { data: builder, error: builderErr } = await (await supabase)
    .from("builders")
    .select("id, name")
    .eq("id", builder_id)
    .single();

  if (builderErr || !builder)
    return { ok: false, message: "Builder not found." };

  // Fetch selected jobs
  const { data: jobs, error: jobsErr } = await (await supabase)
    .from("jobs")
    .select("id, title, price_cents, is_completed, project_id")
    .in("id", jobIds)
    .is("deleted_at", null);

  if (jobsErr || !jobs)
    return { ok: false, message: jobsErr?.message ?? "Failed to fetch jobs." };

  const selected = jobs.filter((j) => j.is_completed);
  if (selected.length !== jobIds.length) {
    return { ok: false, message: "Only completed jobs can be invoiced." };
  }

  // Fetch project snapshots and confirm same builder
  const projectIds = Array.from(new Set(selected.map((j) => j.project_id)));

  const { data: projects, error: projErr } = await (await supabase)
    .from("projects")
    .select("id, project_address, subdivision, builder_id")
    .in("id", projectIds);

  if (projErr || !projects)
    return {
      ok: false,
      message: projErr?.message ?? "Failed to fetch projects.",
    };

  const projectMap = new Map(projects.map((p) => [p.id, p])) as Map<
    string,
    {
      id: string;
      project_address: string;
      subdivision: string | null;
      builder_id: string;
    }
  >;

  for (const j of selected) {
    const p = projectMap.get(j.project_id);
    if (!p)
      return { ok: false, message: "One of the projects could not be found." };
    if (p.builder_id !== builder_id)
      return {
        ok: false,
        message: "Selected jobs must belong to the same builder.",
      };
  }

  const subtotal_cents = selected.reduce(
    (sum, j) => sum + (j.price_cents ?? 0),
    0,
  );

  const invoice_number = formatInvoiceNumber();

  // Insert invoice (project_id is null for multi-project)
  const { data: invoice, error: invErr } = await (
    await supabase
  )
    .from("invoices")
    .insert({
      project_id: null,
      user_id: user.id,
      invoice_number,
      invoice_date,
      due_date,
      contractor_name,
      contractor_address: contractor_address || null,
      contractor_phone: contractor_phone || null,
      bill_to_name,
      bill_to_address,
      subtotal_cents,
    })
    .select("id")
    .single();

  if (invErr || !invoice)
    return {
      ok: false,
      message: invErr?.message ?? "Failed to create invoice.",
    };

  // Insert invoice items with per-project snapshots
  const items = selected.map((j) => {
    const p = projectMap.get(j.project_id)!;
    const subdivisionNameRawSnapshot = (p.subdivision ?? "").trim() || "Unassigned";
    return {
      invoice_id: invoice.id,
      job_id: j.id,
      project_id_snapshot: p.id,
      project_address_snapshot: p.project_address,
      subdivision_name_raw_snapshot: subdivisionNameRawSnapshot,
      builder_name_snapshot: builder.name,
      job_title_snapshot: j.title,
      job_price_cents_snapshot: j.price_cents,
    };
  });

  const { error: itemsErr } = await (await supabase)
    .from("invoice_items")
    .insert(items);
  if (itemsErr) return { ok: false, message: itemsErr.message };

  return { ok: true, invoiceId: invoice.id as string };
}

export async function deleteInvoice(invoiceId: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await (await supabase).auth.getUser();

  if (userError || !user) return { ok: false, message: "Session Expired." };

  const { data: invoice, error: invoiceCheckErr } = await (await supabase)
    .from("invoices")
    .select("id")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (invoiceCheckErr) return { ok: false, message: invoiceCheckErr.message };
  if (!invoice) return { ok: false, message: "Invoice not found." };

  const { error } = await (await supabase)
    .from("invoices")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}


export async function editInvoice(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { ok: false, message: "Session expired." };

  const invoiceId = String(formData.get("invoice_id") || "").trim();
  const contractor_name = String(formData.get("contractor_name") || "").trim();
  const contractor_address = String(formData.get("contractor_address") || "").trim();
  const contractor_phone = String(formData.get("contractor_phone") || "").trim();
  const bill_to_name = String(formData.get("bill_to_name") || "").trim();
  const bill_to_address = String(formData.get("bill_to_address") || "").trim();
  const invoice_date = String(formData.get("invoice_date") || "").trim();
  const due_date = String(formData.get("due_date") || "").trim();
  const itemIds = formData.getAll("item_id").map((value) => String(value).trim());
  const itemTitles = formData
    .getAll("item_title")
    .map((value) => String(value).trim());
  const itemPrices = formData
    .getAll("item_price")
    .map((value) => String(value).trim());
  const itemProjectAddresses = formData
    .getAll("item_project_address")
    .map((value) => String(value).trim());
  const itemSubdivisions = formData
    .getAll("item_subdivision")
    .map((value) => String(value).trim());
  const itemBuilders = formData
    .getAll("item_builder_name")
    .map((value) => String(value).trim());

  if (!invoiceId) return { ok: false, message: "Invoice id is required." };
  if (!contractor_name) return { ok: false, message: "Contractor name is required." };
  if (!bill_to_name) return { ok: false, message: "Bill to name is required." };
  if (!bill_to_address) return { ok: false, message: "Bill to address is required." };
  if (!invoice_date) return { ok: false, message: "Invoice date is required." };
  if (itemIds.length === 0) {
    return { ok: false, message: "At least one invoice item is required." };
  }
  if (
    itemTitles.length !== itemIds.length ||
    itemPrices.length !== itemIds.length ||
    itemProjectAddresses.length !== itemIds.length ||
    itemSubdivisions.length !== itemIds.length ||
    itemBuilders.length !== itemIds.length
  ) {
    return { ok: false, message: "Invoice items payload is invalid." };
  }

  const { data: existing, error: existingErr } = await supabase
    .from("invoices")
    .select("id")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingErr) return { ok: false, message: existingErr.message };
  if (!existing) return { ok: false, message: "Invoice not found." };

  const normalizedItems = itemIds.map((id, index) => {
    const title = itemTitles[index] ?? "";
    const priceRaw = itemPrices[index] ?? "";
    const projectAddress = itemProjectAddresses[index] ?? "";
    const subdivisionRaw = itemSubdivisions[index] ?? "";
    const builderNameRaw = itemBuilders[index] ?? "";
    const priceCents = parsePriceToCents(priceRaw);
    return {
      id,
      title,
      priceRaw,
      priceCents,
      projectAddress,
      subdivisionRaw,
      builderNameRaw,
    };
  });

  for (const item of normalizedItems) {
    if (!item.id) return { ok: false, message: "Invoice item id is required." };
    if (!item.title) return { ok: false, message: "Invoice item title is required." };
    if (item.priceCents === null) {
      return { ok: false, message: `Enter a valid price for "${item.title}".` };
    }
  }

  const { data: existingItems, error: itemsErr } = await supabase
    .from("invoice_items")
    .select("id")
    .eq("invoice_id", invoiceId);

  if (itemsErr) return { ok: false, message: itemsErr.message };

  const existingItemIds = new Set(
    (existingItems ?? []).map((item) => String(item.id)),
  );
  const submittedItemIds = new Set(normalizedItems.map((item) => item.id));
  for (const item of normalizedItems) {
    if (!existingItemIds.has(item.id)) {
      return { ok: false, message: "One or more invoice items were not found." };
    }
  }

  const idsToDelete = Array.from(existingItemIds).filter(
    (id) => !submittedItemIds.has(id),
  );

  const subtotal_cents = normalizedItems.reduce(
    (sum, item) => sum + (item.priceCents ?? 0),
    0,
  );

  const { error: updateErr } = await supabase
    .from("invoices")
    .update({
      contractor_name,
      contractor_address: contractor_address || null,
      contractor_phone: contractor_phone || null,
      bill_to_name,
      bill_to_address,
      invoice_date,
      due_date: due_date || null,
      subtotal_cents,
    })
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (updateErr) return { ok: false, message: updateErr.message };

  if (idsToDelete.length > 0) {
    const { error: deleteItemsErr } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", invoiceId)
      .in("id", idsToDelete);

    if (deleteItemsErr) return { ok: false, message: deleteItemsErr.message };
  }

  for (const item of normalizedItems) {
    const subdivisionNameRawSnapshot =
      item.subdivisionRaw.trim() || "Unassigned";
    const builderNameSnapshot = item.builderNameRaw.trim() || "Unknown";
    const projectAddressSnapshot = item.projectAddress.trim() || "—";

    const { error: updateItemErr } = await supabase
      .from("invoice_items")
      .update({
        job_title_snapshot: item.title,
        job_price_cents_snapshot: item.priceCents,
        project_address_snapshot: projectAddressSnapshot,
        subdivision_name_raw_snapshot: subdivisionNameRawSnapshot,
        builder_name_snapshot: builderNameSnapshot,
      })
      .eq("invoice_id", invoiceId)
      .eq("id", item.id);

    if (updateItemErr) return { ok: false, message: updateItemErr.message };
  }

  return { ok: true };
}

//  invoice line-item snapshots

// // const project_address_snapshot = String(formData.get("project_address_snapshot") || "").trim();
// const builder_name_snapshot = String(formData.get("builder_name_snapshot") || "").trim();
// const subdivision_snapshot = String(formData.get("subdivision_snapshot") || "").trim();

// if (project_address_snapshot || builder_name_snapshot || subdivision_snapshot) {
//   const { error: itemsErr } = await supabase
//     .from("invoice_items")
//     .update({
//       ...(project_address_snapshot ? { project_address_snapshot } : {}),
//       ...(builder_name_snapshot ? { builder_name_snapshot } : {}),
//       // use ONE key based on your schema:
//       // subdivision_name_raw_snapshot OR subdivision_snapshot
//       ...(subdivision_snapshot ? { subdivision_name_raw_snapshot: subdivision_snapshot } : {}),
//     })
//     .eq("invoice_id", invoiceId);

//   if (itemsErr) return { ok: false, message: itemsErr.message };
// }
