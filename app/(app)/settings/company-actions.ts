"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult =
  | { ok: true; companyId: string; message?: string }
  | { ok: false; message: string };

export async function createCompany(
  name: string,
  address?: string,
  phone?: string
): Promise<ActionResult> {
  // Verify the caller is authenticated (uses session cookies)
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Session expired. Please log in again." };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, message: "Company name is required." };
  }

  // Use the admin client to bypass RLS for the insert.
  // This is safe because we've already verified the user above.
  const admin = createAdminClient();

  // 1. Create the company
  const row: Record<string, string> = { name: trimmed };
  if (address?.trim()) row.address = address.trim();
  if (phone?.trim()) row.phone = phone.trim();

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert(row)
    .select("id")
    .single();

  if (companyError || !company) {
    return {
      ok: false,
      message: companyError?.message ?? "Failed to create company.",
    };
  }

  // 2. Add the current user as owner
  const { error: memberError } = await admin
    .from("company_members")
    .insert({
      company_id: company.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    return { ok: false, message: memberError.message };
  }

  return { ok: true, companyId: company.id };
}
