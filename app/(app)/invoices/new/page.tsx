import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { CreateInvoiceByBuilder } from "@/components/invoices/create-invoice-by-builder";

export default async function NewInvoicePage() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await (await supabase).auth.getUser();

  if (error || !user) redirect("/login");

  const { data: builders } = await (await supabase)
    .from("builders")
    .select("id, name")
    .order("name");

  const { data: profile } = await (await supabase)
    .from("contractor_profiles")
    .select("company_name, address, phone")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <BreadcrumbSetter
        crumbs={[
          { label: "Invoices", href: "/invoices" },
          { label: "New Invoice" },
        ]}
      />

      <div>
        <h1 className="text-xl font-semibold">New Invoice</h1>
        <p className="text-sm text-muted-foreground">
          Select a builder, then pick completed jobs across multiple projects.
        </p>
      </div>

      <Card className="p-6">
        <CreateInvoiceByBuilder
          builders={builders ?? []}
          initialContractor={{
            company_name: profile?.company_name ?? "",
            address: profile?.address ?? "",
            phone: profile?.phone ?? "",
          }}
        />
      </Card>
    </div>
  );
}
