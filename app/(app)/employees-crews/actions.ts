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

// ── Employee Actions ──────────────────────────────────────────────────────────

export async function createEmployee(formData: FormData) {
  const { supabase, user, companyId } = await requireAuthAndCompany();

  const name = normalize(String(formData.get("name") ?? ""));
  if (!name) return { ok: false, message: "Employee name is required." };

  const role = normalize(String(formData.get("role") ?? ""));
  const jobTitle = normalize(String(formData.get("job_title") ?? ""));
  const employmentType = normalize(String(formData.get("employment_type") ?? ""));
  const notes = normalize(String(formData.get("notes") ?? ""));

  const email = normalize(String(formData.get("email") ?? ""));
  const phone = normalize(String(formData.get("phone") ?? ""));
  const address = normalize(String(formData.get("address") ?? ""));

  const payType = normalize(String(formData.get("pay_type") ?? ""));
  const hourlyRateRaw = normalize(String(formData.get("hourly_rate") ?? ""));
  const hourlyRate = hourlyRateRaw ? parseFloat(hourlyRateRaw) : null;
  const hireDate = normalize(String(formData.get("hire_date") ?? ""));

  const paymentMethod = normalize(String(formData.get("payment_method") ?? ""));
  const paymentDetails = buildPaymentDetails(paymentMethod, formData);

  const { error } = await supabase.from("employees").insert({
    company_id: companyId,
    created_by: user.id,
    name,
    role: role || null,
    job_title: jobTitle || null,
    employment_type: employmentType || null,
    notes: notes || null,
    email: email || null,
    phone: phone || null,
    address: address || null,
    pay_type: payType || null,
    hourly_rate: hourlyRate,
    hire_date: hireDate || null,
    payment_method: paymentMethod || null,
    payment_details: paymentDetails,
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
  if (!id) return { ok: false, message: "Employee ID is required." };

  const name = normalize(String(formData.get("name") ?? ""));
  if (!name) return { ok: false, message: "Employee name is required." };

  const role = normalize(String(formData.get("role") ?? ""));
  const jobTitle = normalize(String(formData.get("job_title") ?? ""));
  const employmentType = normalize(String(formData.get("employment_type") ?? ""));
  const isActive = String(formData.get("is_active") ?? "true") === "true";
  const notes = normalize(String(formData.get("notes") ?? ""));

  const email = normalize(String(formData.get("email") ?? ""));
  const phone = normalize(String(formData.get("phone") ?? ""));
  const address = normalize(String(formData.get("address") ?? ""));

  const payType = normalize(String(formData.get("pay_type") ?? ""));
  const hourlyRateRaw = normalize(String(formData.get("hourly_rate") ?? ""));
  const hourlyRate = hourlyRateRaw ? parseFloat(hourlyRateRaw) : null;
  const hireDate = normalize(String(formData.get("hire_date") ?? ""));

  const paymentMethod = normalize(String(formData.get("payment_method") ?? ""));
  const paymentDetails = buildPaymentDetails(paymentMethod, formData);

  const { error } = await supabase
    .from("employees")
    .update({
      name,
      role: role || null,
      job_title: jobTitle || null,
      employment_type: employmentType || null,
      is_active: isActive,
      notes: notes || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      pay_type: payType || null,
      hourly_rate: hourlyRate,
      hire_date: hireDate || null,
      payment_method: paymentMethod || null,
      payment_details: paymentDetails,
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

// ── Crew Actions ──────────────────────────────────────────────────────────────

export async function createCrew(formData: FormData) {
  const { supabase, user, companyId } = await requireAuthAndCompany();

  const name = normalize(String(formData.get("name") ?? ""));
  if (!name) return { ok: false, message: "Crew name is required." };

  const description = normalize(String(formData.get("description") ?? ""));
  const crewLeadId = normalize(String(formData.get("crew_lead_id") ?? ""));
  const specialization = normalize(String(formData.get("specialization") ?? ""));
  const memberIds = formData
    .getAll("member_ids")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const { data: crew, error: crewErr } = await supabase
    .from("crews")
    .insert({
      company_id: companyId,
      created_by: user.id,
      name,
      notes: description || null,
      description: description || null,
      crew_lead_id: crewLeadId || null,
      specialization: specialization || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (crewErr || !crew)
    return { ok: false, message: crewErr?.message ?? "Failed to create crew." };

  if (memberIds.length > 0) {
    const rows = memberIds.map((employeeId) => ({
      crew_id: crew.id,
      employee_id: employeeId,
      company_id: companyId,
      created_by: user.id,
    }));

    const { error: memberErr } = await supabase
      .from("crew_members")
      .insert(rows);
    if (memberErr) return { ok: false, message: memberErr.message };
  }

  revalidatePath("/employees");
  revalidatePath("/payroll");
  return { ok: true };
}

export async function updateCrew(formData: FormData) {
  const { supabase, user, companyId } = await requireAuthAndCompany();

  const crewId = String(formData.get("crew_id") ?? "").trim();
  if (!crewId) return { ok: false, message: "Crew ID is required." };

  const name = normalize(String(formData.get("name") ?? ""));
  if (!name) return { ok: false, message: "Crew name is required." };

  const description = normalize(String(formData.get("description") ?? ""));
  const crewLeadId = normalize(String(formData.get("crew_lead_id") ?? ""));
  const specialization = normalize(String(formData.get("specialization") ?? ""));
  const isActive = String(formData.get("is_active") ?? "true") === "true";
  const memberIds = formData
    .getAll("member_ids")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const { error: crewErr } = await supabase
    .from("crews")
    .update({
      name,
      notes: description || null,
      description: description || null,
      crew_lead_id: crewLeadId || null,
      specialization: specialization || null,
      is_active: isActive,
    })
    .eq("id", crewId)
    .eq("company_id", companyId)
    .is("deleted_at", null);

  if (crewErr) return { ok: false, message: crewErr.message };

  // Replace member list
  const { error: deleteMembersErr } = await supabase
    .from("crew_members")
    .delete()
    .eq("crew_id", crewId)
    .eq("company_id", companyId);

  if (deleteMembersErr)
    return { ok: false, message: deleteMembersErr.message };

  if (memberIds.length > 0) {
    const rows = memberIds.map((employeeId) => ({
      crew_id: crewId,
      employee_id: employeeId,
      company_id: companyId,
      created_by: user.id,
    }));

    const { error: memberErr } = await supabase
      .from("crew_members")
      .insert(rows);
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPaymentDetails(
  method: string,
  formData: FormData,
): Record<string, string> | null {
  if (method === "card") {
    const lastFour = normalize(String(formData.get("pd_last_four") ?? ""));
    return lastFour ? { last_four: lastFour } : null;
  }
  if (method === "epay") {
    const platform = normalize(String(formData.get("pd_platform") ?? ""));
    const reference = normalize(String(formData.get("pd_reference") ?? ""));
    if (!platform && !reference) return null;
    return { platform, reference };
  }
  if (method === "wire") {
    const routing = normalize(String(formData.get("pd_routing") ?? ""));
    const account = normalize(String(formData.get("pd_account") ?? ""));
    if (!routing && !account) return null;
    return { routing, account };
  }
  return null;
}
