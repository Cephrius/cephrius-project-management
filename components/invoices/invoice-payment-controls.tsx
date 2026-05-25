"use client";

// Onboarding: per-invoice-line payment controls. Server updates live in
// `app/(jobsyte-app)/(app)/invoices/payment-actions.ts` and also synchronize
// job-level paid flags for project/payroll views.
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  markInvoiceItemPaid,
  markInvoicePaid,
} from "@/app/(jobsyte-app)/invoices/payment-actions";

export type InvoiceItemWithPayment = {
  id: string;
  job_id: string | null;
  job_title_snapshot: string;
  job_price_cents_snapshot: number;
  project_address_snapshot: string;
  subdivision_name_raw_snapshot: string;
  builder_name_snapshot: string;
  is_paid: boolean;
  paid_at: string | null;
};

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export function InvoicePaymentControls({
  invoiceId,
  items: initialItems,
  subtotalCents,
}: {
  invoiceId: string;
  items: InvoiceItemWithPayment[];
  invoiceIsPaid: boolean;
  subtotalCents: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  // Sync local state whenever the server delivers fresh data (via router.refresh).
  // Intentionally NOT gated on isPending — the old approach fired when isPending
  // went false, which is *before* router.refresh delivers new props, causing the
  // optimistic update to get reverted to stale server data.
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  function toggleItem(itemId: string, currentPaid: boolean) {
    const newPaid = !currentPaid;
    const updatedItems = items.map((i) =>
      i.id === itemId ? { ...i, is_paid: newPaid } : i,
    );

    // Optimistic update
    setItems(updatedItems);

    startTransition(async () => {
      const result = await markInvoiceItemPaid(itemId, invoiceId, newPaid);
      if (!result.ok) {
        toast.error(result.message ?? "Failed to update payment status.");
        // Revert
        setItems(initialItems);
      } else {
        toast.success(newPaid ? "Job marked as paid." : "Job marked as unpaid.");
        router.refresh();
      }
    });
  }

  function markAllPaid() {
    const updatedItems = items.map((i) => ({ ...i, is_paid: true }));
    // Optimistic update
    setItems(updatedItems);

    startTransition(async () => {
      const result = await markInvoicePaid(invoiceId);
      if (!result.ok) {
        toast.error(result.message ?? "Failed to mark invoice as paid.");
        setItems(initialItems);
      } else {
        toast.success("Invoice marked as paid.");
        router.refresh();
      }
    });
  }

  const paidCount = items.filter((i) => i.is_paid).length;
  const allPaid = paidCount === items.length && items.length > 0;

  return (
    <>
      {/* Payment status bar — hidden on print */}
      <div className="mt-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Payment</span>
          {allPaid ? (
            <Badge className="bg-green-600 text-white hover:bg-green-600">
              Paid in full
            </Badge>
          ) : paidCount > 0 ? (
            <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
              {paidCount} / {items.length} paid
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Unpaid
            </Badge>
          )}
        </div>

        {!allPaid && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                className="gap-1.5"
              >
                <DollarSign className="size-3.5" />
                Mark All as Paid
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mark Invoice as Paid?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark all {items.length} job
                  {items.length !== 1 ? "s" : ""} on this invoice as paid. Paid
                  jobs are locked from status changes in the Projects section.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={markAllPaid}>
                  Mark as Paid
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Items table */}
      <div className="mt-3 overflow-x-auto rounded-md border print:border-0">
        <div className="min-w-180 print:min-w-0">
          {/* Header */}
          <div className="grid grid-cols-14 gap-2 border-b p-3 text-xs font-semibold text-muted-foreground">
            <div className="col-span-5">Description</div>
            <div className="col-span-3">Project</div>
            <div className="col-span-3">Subdivision</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1 text-right print:hidden">Paid</div>
          </div>

          {/* Rows */}
          {items.map((it) => (
            <div
              key={it.id}
              className="grid grid-cols-14 gap-2 border-b p-3 last:border-b-0"
            >
              <div className="col-span-5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {it.job_title_snapshot}
                  {it.is_paid && (
                    <Badge className="bg-green-600 text-white text-xs hover:bg-green-600 shrink-0">
                      Paid
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {it.builder_name_snapshot}
                </div>
              </div>

              <div className="col-span-3 text-sm text-muted-foreground self-center">
                {it.project_address_snapshot}
              </div>

              <div className="col-span-3 text-xs text-muted-foreground self-center">
                {it.subdivision_name_raw_snapshot}
              </div>

              <div className="col-span-2 text-right text-sm font-medium self-center">
                {money(it.job_price_cents_snapshot)}
              </div>

              {/* Paid toggle — hidden on print */}
              <div className="col-span-1 flex justify-end items-center print:hidden">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => toggleItem(it.id, it.is_paid)}
                  aria-label={it.is_paid ? "Mark as unpaid" : "Mark as paid"}
                  className="size-8"
                >
                  {it.is_paid ? (
                    <CheckCircle2 className="size-4 text-green-600" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{money(subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{money(subtotalCents)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
