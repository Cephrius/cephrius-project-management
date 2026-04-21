"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";
import { revalidatePath } from "next/cache";

function parsePriceToCents(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100);
}

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, message: "Session expired. Please log in again." };

  const companyId = await getActiveCompanyId();
  if (!companyId) return { ok: false, message: "No active company found." };

  const project_id  = String(formData.get("project_id")  || "").trim();
  const name        = String(formData.get("name")        || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const category    = String(formData.get("category")    || "").trim() || null;
  const cost_type   = String(formData.get("cost_type")   || "").trim();
  const value_type  = String(formData.get("value_type")  || "").trim();
  const amountRaw   = String(formData.get("amount")      || "").trim();
  const expense_date = String(formData.get("expense_date") || "").trim() || null;

  if (!project_id) return { ok: false, message: "Project is required." };
  if (!name)       return { ok: false, message: "Expense name is required." };

  if (cost_type !== "direct" && cost_type !== "indirect") {
    return { ok: false, message: "Cost type must be 'direct' or 'indirect'." };
  }
  if (value_type !== "actual" && value_type !== "estimated") {
    return { ok: false, message: "Value type must be 'actual' or 'estimated'." };
  }

  const amount_cents = parsePriceToCents(amountRaw);
  if (amount_cents === null) return { ok: false, message: "Enter a valid amount." };

  // Verify project belongs to this company (prevents cross-company writes)
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", project_id)
    .eq("company_id", companyId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!project) return { ok: false, message: "Project not found." };

  const { error } = await supabase.from("project_expenses").insert({
    project_id,
    company_id: companyId,
    created_by: user.id,
    name,
    description,
    category,
    cost_type,
    value_type,
    amount_cents,
    expense_date: expense_date || null,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/accounting/${project_id}`);
  revalidatePath(`/projects/${project_id}/accounting`);
  revalidatePath("/accounting");
  return { ok: true };
}

export async function updateExpense(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, message: "Session expired. Please log in again." };

  const companyId = await getActiveCompanyId();
  if (!companyId) return { ok: false, message: "No active company found." };

  const expense_id  = String(formData.get("expense_id")  || "").trim();
  const project_id  = String(formData.get("project_id")  || "").trim();
  const name        = String(formData.get("name")        || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const category    = String(formData.get("category")    || "").trim() || null;
  const cost_type   = String(formData.get("cost_type")   || "").trim();
  const value_type  = String(formData.get("value_type")  || "").trim();
  const amountRaw   = String(formData.get("amount")      || "").trim();
  const expense_date = String(formData.get("expense_date") || "").trim() || null;

  if (!expense_id) return { ok: false, message: "Expense ID is required." };
  if (!name)       return { ok: false, message: "Expense name is required." };

  if (cost_type !== "direct" && cost_type !== "indirect") {
    return { ok: false, message: "Cost type must be 'direct' or 'indirect'." };
  }
  if (value_type !== "actual" && value_type !== "estimated") {
    return { ok: false, message: "Value type must be 'actual' or 'estimated'." };
  }

  const amount_cents = parsePriceToCents(amountRaw);
  if (amount_cents === null) return { ok: false, message: "Enter a valid amount." };

  const { data: existingExpense, error: existingExpenseError } = await supabase
    .from("project_expenses")
    .select("id, source_type, payment_id")
    .eq("id", expense_id)
    .eq("company_id", companyId)
    .maybeSingle();

  if (existingExpenseError) return { ok: false, message: existingExpenseError.message };
  if (!existingExpense) return { ok: false, message: "Expense not found." };
  if (existingExpense.source_type === "payroll" || existingExpense.payment_id) {
    return {
      ok: false,
      message: "Payroll-synced expenses must be changed from Payroll, not Accounting.",
    };
  }

  const { error } = await supabase
    .from("project_expenses")
    .update({ name, description, category, cost_type, value_type, amount_cents, expense_date })
    .eq("id", expense_id)
    .eq("company_id", companyId);   // RLS + explicit company_id guard

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/accounting/${project_id}`);
  revalidatePath(`/projects/${project_id}/accounting`);
  revalidatePath("/accounting");
  return { ok: true };
}

export async function deleteExpense(expenseId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, message: "Session expired. Please log in again." };

  const companyId = await getActiveCompanyId();
  if (!companyId) return { ok: false, message: "No active company found." };

  const { data: existingExpense, error: existingExpenseError } = await supabase
    .from("project_expenses")
    .select("id, source_type, payment_id")
    .eq("id", expenseId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (existingExpenseError) return { ok: false, message: existingExpenseError.message };
  if (!existingExpense) return { ok: false, message: "Expense not found." };
  if (existingExpense.source_type === "payroll" || existingExpense.payment_id) {
    return {
      ok: false,
      message: "Payroll-synced expenses must be removed from Payroll, not Accounting.",
    };
  }

  const { error } = await supabase
    .from("project_expenses")
    .delete()
    .eq("id", expenseId)
    .eq("company_id", companyId);   // RLS + explicit company_id guard

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/accounting/${projectId}`);
  revalidatePath(`/projects/${projectId}/accounting`);
  revalidatePath("/accounting");
  return { ok: true };
}
