import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { SettingsPageClient } from "@/components/settings/settings-page";
import { readPreferenceSettings } from "@/lib/settings/preferences";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("contractor_profiles")
    .select("company_name, address, phone")
    .eq("user_id", user.id)
    .maybeSingle();

  const metadata = isObject(user.user_metadata) ? user.user_metadata : {};
  const settings = readPreferenceSettings(user.user_metadata);

  const companyNameFromMetadata =
    typeof metadata.company_name === "string" ? metadata.company_name : "";

  return (
    <div className="space-y-6">
      <BreadcrumbSetter crumbs={[{ label: "Settings", href: "/settings" }]} />
      <SettingsPageClient
        initialProfile={{
          companyName: profile?.company_name ?? companyNameFromMetadata,
          address: profile?.address ?? "",
          phone: profile?.phone ?? "",
        }}
        account={{
          email: user.email ?? "",
          createdAt: user.created_at ?? null,
          lastSignInAt: user.last_sign_in_at ?? null,
        }}
        initialPreferences={{
          emailInvoiceReminders: settings.email_invoice_reminders,
          weeklySummary: settings.weekly_summary,
          productUpdates: settings.product_updates,
          defaultDueDays: settings.default_due_days,
        }}
      />
    </div>
  );
}
