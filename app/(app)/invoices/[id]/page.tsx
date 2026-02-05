import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { PrintButton } from "@/components/invoices/print-button";

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

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
    .single();

  if (invErr || !invoice)
    return (
      <div className="text-sm text-muted-foreground">Invoice not found.</div>
    );

  const { data: items } = await (await supabase)  
    .from("invoice_items")
    .select(
      "id, job_title_snapshot, job_price_cents_snapshot, project_address_snapshot, subdivision_name_raw_snapshot, builder_name_snapshot",
    )
    .eq("invoice_id", invoice.id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <BreadcrumbSetter
        crumbs={[
          { label: "Invoices", href: "/invoices" },
          { label: invoice.invoice_number },
        ]}
      />

      <Card className="p-6">
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

          <PrintButton />
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

        <div className="mt-6 rounded-md border">
          <div className="grid grid-cols-14 gap-2 border-b p-3 text-xs font-semibold text-muted-foreground">
            <div className="col-span-7">Description</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-4">Subdivision</div>
            <div className="col-span-1 text-right">Amount</div>
          </div>

          {(items ?? []).map((it) => (
            <div
              key={it.id}
              className="grid grid-cols-14 gap-2 border-b p-3 last:border-b-0"
            >
              <div className="col-span-7">
                <div className="text-sm font-medium">
                  {it.job_title_snapshot}
                </div>
                <div className="text-xs text-muted-foreground">
                  {it.builder_name_snapshot}
                </div>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {it.project_address_snapshot}
              </div>
              <div className="col-span-1 text-xs text-muted-foreground">
                {it.subdivision_name_raw_snapshot}
              </div>
              <div className="col-span-4 text-right text-sm font-medium">
                {money(it.job_price_cents_snapshot)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {money(invoice.subtotal_cents)}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{money(invoice.subtotal_cents)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
