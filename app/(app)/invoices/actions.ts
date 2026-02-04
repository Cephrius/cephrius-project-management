"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function formatInvoiceNumber() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${ymd}-${rand}`;
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
  const due_date = String(formData.get("due_date") || "").trim(); // optional

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
    .in("id", jobIds);

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
      due_date: due_date || null,
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
    return {
      invoice_id: invoice.id,
      job_id: j.id,
      project_id_snapshot: p.id,
      project_address_snapshot: p.project_address,
      subdivision_snapshot: p.subdivision ?? null,
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
