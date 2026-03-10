"use server";

import { createClient } from "@/lib/supabase/server";
import {
  clampDueDays,
  withUpdatedPreferenceSettings,
} from "@/lib/settings/preferences";

type ActionResult = { ok: true; message?: string } | { ok: false; message: string };

type PreferencesInput = {
  emailInvoiceReminders: boolean;
  weeklySummary: boolean;
  productUpdates: boolean;
  defaultDueDays: number;
};

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizePhone(value: string) {
  return value.trim();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, error: "Session expired. Please log in again." };
  }

  return { supabase, user, error: null };
}

export async function updateCompanyProfile(input: {
  companyId: string;
  companyName: string;
  address: string;
  phone: string;
}): Promise<ActionResult> {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error || !user) return { ok: false, message: error ?? "Unauthorized." };

  const companyName = normalizeWhitespace(input.companyName);
  const address = normalizeWhitespace(input.address);
  const phone = normalizePhone(input.phone);

  if (!companyName) {
    return { ok: false, message: "Company name is required." };
  }

  // Verify the user is a member of this company
  const { data: membership } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", input.companyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { ok: false, message: "You don't have access to this company." };
  }

  // Update the companies table (source of truth for company profile)
  const { error: companyError } = await supabase
    .from("companies")
    .update({
      name: companyName,
      address: address || null,
      phone: phone || null,
    })
    .eq("id", input.companyId);

  if (companyError) {
    return { ok: false, message: companyError.message };
  }

  // Keep contractor_profiles + user_metadata in sync for backward compatibility
  await supabase.from("contractor_profiles").upsert(
    {
      user_id: user.id,
      company_name: companyName,
      address: address || null,
      phone: phone || null,
    },
    { onConflict: "user_id" },
  );

  const currentMetadata = isObject(user.user_metadata) ? user.user_metadata : {};
  await supabase.auth.updateUser({
    data: { ...currentMetadata, company_name: companyName },
  });

  return { ok: true, message: "Profile updated." };
}

export async function updatePreferences(input: PreferencesInput): Promise<ActionResult> {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error || !user) return { ok: false, message: error ?? "Unauthorized." };

  const defaultDueDays = clampDueDays(input.defaultDueDays, 30);
  const nextMetadata = withUpdatedPreferenceSettings(user.user_metadata, {
    email_invoice_reminders: Boolean(input.emailInvoiceReminders),
    weekly_summary: Boolean(input.weeklySummary),
    product_updates: Boolean(input.productUpdates),
    default_due_days: defaultDueDays,
  });

  const { error: updateError } = await supabase.auth.updateUser({
    data: nextMetadata,
  });

  if (updateError) return { ok: false, message: updateError.message };

  return { ok: true, message: "Preferences saved." };
}

export async function updateAccountEmail(input: {
  email: string;
}): Promise<ActionResult> {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error || !user) return { ok: false, message: error ?? "Unauthorized." };

  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, message: "Email is required." };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const { error: updateError } = await supabase.auth.updateUser({ email });
  if (updateError) return { ok: false, message: updateError.message };

  return {
    ok: true,
    message: "Email update requested. Check your inbox to confirm the change.",
  };
}

export async function updateAccountPassword(input: {
  nextPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error || !user) return { ok: false, message: error ?? "Unauthorized." };

  const nextPassword = input.nextPassword.trim();
  const confirmPassword = input.confirmPassword.trim();

  if (!nextPassword) return { ok: false, message: "New password is required." };
  if (nextPassword.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }
  if (nextPassword !== confirmPassword) {
    return { ok: false, message: "Password confirmation does not match." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: nextPassword,
  });

  if (updateError) return { ok: false, message: updateError.message };

  return { ok: true, message: "Password updated." };
}
