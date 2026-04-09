"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

async function requireAuthAndCompany() {
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

export async function createEmployee(formData: FormData) {
  const { supabase, user, companyId } = await requireAuthAndCompany();

  const name = normalize(String(formData.get("name") ?? ""));
  const contactInfo = normalize(String(formData.get("contact_info") ?? ""));
  const role = normalize(String(formData.get("role") ?? ""));
  const notes = normalize(String(formData.get("notes") ?? ""));

  if (!name) return { ok: false, message: "Employee name is required." };

  const { error } = await supabase.from("employees").insert({
    company_id: companyId,
    created_by: user.id,
    name,
    contact_info: contactInfo || null,
    role: role || null,
    notes: notes || null,
    is_active: true,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/employees");
  revalidatePath("/payroll");
  return { ok: true };
}

export async function updateEmployee(formData: FormData) {
  const { supabase, companyId } = await requireAuthAndCompany();

  const id = String(formData.get("employee_id") ?? "").trim();
  const name = normalize(String(formData.get("name") ?? ""));
  const contactInfo = normalize(String(formData.get("contact_info") ?? ""));
  const role = normalize(String(formData.get("role") ?? ""));
  const notes = normalize(String(formData.get("notes") ?? ""));
  const isActive = String(formData.get("is_active") ?? "true") === "true";

  if (!id) return { ok: false, message: "Employee ID is required." };
  if (!name) return { ok: false, message: "Employee name is required." };

  const { error } = await supabase
    .from("employees")
    .update({
      name,
      contact_info: contactInfo || null,
      role: role || null,
      notes: notes || null,
      is_active: isActive,
    })
    .eq("id", id)
    .eq("company_id", companyId)
    .is("deleted_at", null);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/employees");
  revalidatePath("/payroll");
  return { ok: true };
}

export async function deleteEmployee(employeeId: string) {
  const { supabase, companyId } = await requireAuthAndCompany();
  if (!employeeId) return { ok: false, message: "Employee ID is required." };

  const { error } = await supabase
    .from("employees")
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
    })
    .eq("id", employeeId)
    .eq("company_id", companyId)
    .is("deleted_at", null);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/employees");
  revalidatePath("/payroll");
  return { ok: true };
}

export async function createCrew(formData: FormData) {
  const { supabase, user, companyId } = await requireAuthAndCompany();

  const name = normalize(String(formData.get("name") ?? ""));
  const notes = normalize(String(formData.get("notes") ?? ""));
  const memberIds = formData
    .getAll("member_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!name) return { ok: false, message: "Crew name is required." };

  const { data: crew, error: crewErr } = await supabase
    .from("crews")
    .insert({
      company_id: companyId,
      created_by: user.id,
      name,
      notes: notes || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (crewErr || !crew) return { ok: false, message: crewErr?.message ?? "Failed to create crew." };

  if (memberIds.length > 0) {
    const rows = memberIds.map((employeeId) => ({
      crew_id: crew.id,
      employee_id: employeeId,
      company_id: companyId,
      created_by: user.id,
    }));

    const { error: memberErr } = await supabase.from("crew_members").insert(rows);
    if (memberErr) return { ok: false, message: memberErr.message };
  }

  revalidatePath("/employees");
  revalidatePath("/payroll");
  return { ok: true };
}

export async function updateCrew(formData: FormData) {
  const { supabase, user, companyId } = await requireAuthAndCompany();

  const crewId = String(formData.get("crew_id") ?? "").trim();
  const name = normalize(String(formData.get("name") ?? ""));
  const notes = normalize(String(formData.get("notes") ?? ""));
  const isActive = String(formData.get("is_active") ?? "true") === "true";
  const memberIds = formData
    .getAll("member_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!crewId) return { ok: false, message: "Crew ID is required." };
  if (!name) return { ok: false, message: "Crew name is required." };

  const { error: crewErr } = await supabase
    .from("crews")
    .update({
      name,
      notes: notes || null,
      is_active: isActive,
    })
    .eq("id", crewId)
    .eq("company_id", companyId)
    .is("deleted_at", null);

  if (crewErr) return { ok: false, message: crewErr.message };

  const { error: deleteMembersErr } = await supabase
    .from("crew_members")
    .delete()
    .eq("crew_id", crewId)
    .eq("company_id", companyId);

  if (deleteMembersErr) return { ok: false, message: deleteMembersErr.message };

  if (memberIds.length > 0) {
    const rows = memberIds.map((employeeId) => ({
      crew_id: crewId,
      employee_id: employeeId,
      company_id: companyId,
      created_by: user.id,
    }));

    const { error: memberErr } = await supabase.from("crew_members").insert(rows);
    if (memberErr) return { ok: false, message: memberErr.message };
  }

  revalidatePath("/employees");
  revalidatePath("/payroll");
  return { ok: true };
}

export async function deleteCrew(crewId: string) {
  const { supabase, companyId } = await requireAuthAndCompany();
  if (!crewId) return { ok: false, message: "Crew ID is required." };

  const { error } = await supabase
    .from("crews")
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
    })
    .eq("id", crewId)
    .eq("company_id", companyId)
    .is("deleted_at", null);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/employees");
  revalidatePath("/payroll");
  return { ok: true };
}
