import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { Button } from "@/components/ui/button";

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export default async function InvoicesPage() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await (await supabase).auth.getUser();

  if (error || !user) redirect("/login");

  const { data: invoices, error: invErr } = await (await supabase)
    .from("invoices")
    .select("id, invoice_number, invoice_date, subtotal_cents")
    .order("created_at", { ascending: false });

  if (invErr) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to load invoices: {invErr.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbSetter
        crumbs={[{ label: "Invoices", href: "/invoices" }]}
        rightSlot={
          <Link href="/invoices/new">
            <Button>New Invoice</Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            View and print invoices.
          </p>
        </div>
      </div>

      {!invoices || invoices.length === 0 ? (
        <Card className="p-8">
          <div className="text-sm text-muted-foreground">No invoices yet.</div>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(14rem,20rem))]">
          {invoices.map((inv) => (
            <Link key={inv.id} href={`/invoices/${inv.id}`}>
              <Card className="p-4 hover:bg-muted/40 transition">
                <div className="font-medium">{inv.invoice_number}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Date: {inv.invoice_date}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: {money(inv.subtotal_cents)}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
