import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import {
  InvoicesPageClient,
  type InvoiceListItem,
} from "@/components/invoices/invoices-page";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const { data: invoices, error: invErr } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, invoice_date, due_date, subtotal_cents, bill_to_name, contractor_name, created_at",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (invErr) {
    return (
      <div className="space-y-6">
        <BreadcrumbSetter crumbs={[{ label: "Invoices", href: "/invoices" }]} />
        <Card className="p-8">
          <div className="text-sm text-muted-foreground">
            Failed to load invoices: {invErr.message}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbSetter crumbs={[{ label: "Invoices", href: "/invoices" }]} />
      <InvoicesPageClient invoices={(invoices ?? []) as InvoiceListItem[]} />
    </div>
  );
}
