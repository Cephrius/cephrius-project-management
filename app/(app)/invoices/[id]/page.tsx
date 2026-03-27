import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { PrintButton } from "@/components/invoices/print-button";
import { EditInvoiceDialog } from "@/components/invoices/edit-invoice-dialog";
import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button";
import {
  InvoicePaymentControls,
  type InvoiceItemWithPayment,
} from "@/components/invoices/invoice-payment-controls";

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await (await supabase).auth.getUser();

  if (error || !user) redirect("/login");

  const { data: invoice, error: invErr } = await (await supabase)
    .from("invoices")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (invErr || !invoice)
    return (
      <div className="text-sm text-muted-foreground">Invoice not found.</div>
    );

  const { data: items, error: itemsError } = await (await supabase)
    .from("invoice_items")
    .select(
      "id, job_id, job_title_snapshot, job_price_cents_snapshot, project_address_snapshot, subdivision_name_raw_snapshot, builder_name_snapshot, is_paid, paid_at",
    )
    .eq("invoice_id", invoice.id)
    .order("created_at", { ascending: true });

  // If the payment columns don't exist yet (migration not applied), fall back to
  // a query without them so items still render instead of disappearing.
  let resolvedItems: InvoiceItemWithPayment[];
  if (itemsError) {
    const { data: basicItems } = await (await supabase)
      .from("invoice_items")
      .select(
        "id, job_id, job_title_snapshot, job_price_cents_snapshot, project_address_snapshot, subdivision_name_raw_snapshot, builder_name_snapshot",
      )
      .eq("invoice_id", invoice.id)
      .order("created_at", { ascending: true });
    resolvedItems = (basicItems ?? []).map((item) => ({
      ...item,
      is_paid: false,
      paid_at: null,
    })) as InvoiceItemWithPayment[];
  } else {
    resolvedItems = (items ?? []).map((item) => ({
      ...item,
      is_paid: item.is_paid ?? false,
    })) as InvoiceItemWithPayment[];
  }

  return (
    <div id="invoice-print-root" className="space-y-6 print:space-y-0">
      <div className="print:hidden">
        <BreadcrumbSetter
          crumbs={[
            { label: "Invoices", href: "/invoices" },
            { label: invoice.invoice_number },
          ]}
        />
      </div>

      <Card className="p-6 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xl font-semibold">
              {invoice.invoice_number}
            </div>
            <div className="text-sm text-muted-foreground">
              Invoice Date: {invoice.invoice_date}
            </div>
            {invoice.due_date && (
              <div className="text-sm text-muted-foreground">
                Due Date: {invoice.due_date}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <EditInvoiceDialog invoice={invoice} items={items ?? []} />
            <DeleteInvoiceButton invoiceId={invoice.id} redirectTo="/invoices" />
            <PrintButton />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-sm font-semibold">From</div>
            <div className="mt-2 text-sm">{invoice.contractor_name}</div>
            {invoice.contractor_address && (
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {invoice.contractor_address}
              </div>
            )}
            {invoice.contractor_phone && (
              <div className="text-sm text-muted-foreground">
                {invoice.contractor_phone}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold">Bill To</div>
            <div className="mt-2 text-sm">{invoice.bill_to_name}</div>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {invoice.bill_to_address}
            </div>
          </div>
        </div>

        <InvoicePaymentControls
          invoiceId={invoice.id}
          items={resolvedItems}
          invoiceIsPaid={invoice.is_paid ?? false}
          subtotalCents={invoice.subtotal_cents}
        />
      </Card>
    </div>
  );
}
