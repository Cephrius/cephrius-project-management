import { AppShell } from "@/components/app-shell/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CompanyProvider } from "@/lib/company-context";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  // Fetch all companies the user belongs to
  const { data: memberships } = await supabase
    .from("company_members")
    .select("role, company:companies(id, name, address, phone, logo_url)")
    .eq("user_id", data.user.id);

  const companies = (memberships ?? []).map((m: any) => ({
    ...m.company,
    role: m.role,
  }));

  return (
    <CompanyProvider companies={companies}>
      <AppShell>{children}</AppShell>
    </CompanyProvider>
  );
}


