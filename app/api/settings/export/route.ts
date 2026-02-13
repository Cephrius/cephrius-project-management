import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [profileRes, projectsRes, jobsRes, invoicesRes, invoiceItemsRes] =
    await Promise.all([
      supabase
        .from("contractor_profiles")
        .select("company_name, address, phone")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("invoice_items")
        .select("*"),
    ]);

  if (
    profileRes.error ||
    projectsRes.error ||
    jobsRes.error ||
    invoicesRes.error ||
    invoiceItemsRes.error
  ) {
    const message =
      profileRes.error?.message ??
      projectsRes.error?.message ??
      jobsRes.error?.message ??
      invoicesRes.error?.message ??
      invoiceItemsRes.error?.message ??
      "Failed to export data.";

    return NextResponse.json({ message }, { status: 500 });
  }

  const payload = {
    exported_at: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at ?? null,
      last_sign_in_at: user.last_sign_in_at ?? null,
      user_metadata: user.user_metadata ?? {},
    },
    contractor_profile: profileRes.data ?? null,
    projects: projectsRes.data ?? [],
    jobs: jobsRes.data ?? [],
    invoices: invoicesRes.data ?? [],
    invoice_items: invoiceItemsRes.data ?? [],
  };

  const filename = `jobsyte-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Cache-Control": "no-store",
    },
  });
}
