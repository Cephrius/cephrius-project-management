"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { createInvoice } from "@/app/(app)/projects/[id]/invoice-actions";

type Job = {
  id: string;
  title: string;
  price_cents: number;
  scheduled_completion: string | null;
  is_completed: boolean;
};

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export function CreateInvoiceDialog({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Form fields
  const [contractorName, setContractorName] = useState("");
  const [contractorAddress, setContractorAddress] = useState("");
  const [contractorPhone, setContractorPhone] = useState("");

  const [billToName, setBillToName] = useState("");
  const [billToAddress, setBillToAddress] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState("");

  // query useState
  const [query, setQuery] = useState("");

  // Load contractor profile + eligible jobs when opened
  useEffect(() => {
    if (!open) return;

    setError(null);

    (async () => {
      // Profile
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("contractor_profiles")
          .select("company_name, address, phone")
          .eq("user_id", userId)
          .maybeSingle();

        setContractorName(profile?.company_name ?? "");
        setContractorAddress(profile?.address ?? "");
        setContractorPhone(profile?.phone ?? "");
      }

      // Jobs: completed AND not already invoiced
      // We can’t do a join easily client-side with RLS, so we do a simple approach:
      // 1) Fetch completed jobs for project
      const { data: completed } = await supabase
        .from("jobs")
        .select("id, title, price_cents, scheduled_completion, is_completed")
        .eq("project_id", projectId)
        .eq("is_completed", true)
        .order("created_at", { ascending: false });

      const comp = (completed ?? []) as Job[];

      // 2) Fetch invoice_items for those job IDs to exclude them
      const ids = comp.map((j) => j.id);
      if (ids.length === 0) {
        setJobs([]);
        setSelected({});
        return;
      }

      const { data: invoicedItems } = await supabase
        .from("invoice_items")
        .select("job_id")
        .in("job_id", ids);

      const invoicedSet = new Set(
        (invoicedItems ?? []).map((x: any) => x.job_id as string),
      );
      const eligible = comp.filter((j) => !invoicedSet.has(j.id));

      setJobs(eligible);

      // Default: select all eligible jobs
      const initial: Record<string, boolean> = {};
      eligible.forEach((j) => (initial[j.id] = true));
      setSelected(initial);
    })();
  }, [open, projectId, supabase]);

  // searching
  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;

    return jobs.filter((j) => {
      // For single-project dialog you likely only have title + scheduled + price
      // If you later add address/subdivision in this dialog, include them too
      return (
        j.title.toLowerCase().includes(q) ||
        (j.scheduled_completion ?? "").toLowerCase().includes(q)
      );
    });
  }, [jobs, query]);

  const selectedJobs = useMemo(
    () => filteredJobs.filter((j) => selected[j.id]),
    [filteredJobs, selected],
  );
  // const selectedJobs = useMemo(
  //   () => filteredJobs.filter((j) => selected[j.id]),
  //   [filteredJobs, selected],
  // );

  const subtotal = useMemo(
    () => selectedJobs.reduce((sum, j) => sum + (j.price_cents ?? 0), 0),
    [selectedJobs],
  );

  const canSubmit =
    contractorName.trim() &&
    billToName.trim() &&
    billToAddress.trim() &&
    invoiceDate.trim() &&
    selectedJobs.length > 0;

  function submit() {
    setError(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("contractor_name", contractorName);
      fd.set("contractor_address", contractorAddress);
      fd.set("contractor_phone", contractorPhone);
      fd.set("bill_to_name", billToName);
      fd.set("bill_to_address", billToAddress);
      fd.set("invoice_date", invoiceDate);
      fd.set("due_date", dueDate);

      selectedJobs.forEach((j) => fd.append("job_ids", j.id));

      const res = await createInvoice(projectId, fd);
      if (!res.ok) {
        setError(res.message ?? "Failed to create invoice.");
        return;
      }

      onOpenChange(false);
      router.push(`/invoices/${res.invoiceId}`);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contractor */}
          <div className="space-y-3">
            <div className="text-sm font-semibold">Contractor Info</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <div className="text-sm font-light">Company Name</div>
                <Input
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="text-sm font-light">Address</div>
                <Textarea
                  value={contractorAddress}
                  onChange={(e) => setContractorAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-light">Phone</div>
                <Input
                  value={contractorPhone}
                  onChange={(e) => setContractorPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bill to */}
          <div className="space-y-3">
            <div className="text-sm font-semibold">Bill To</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <div className="text-sm font-light">Builder Name</div>
                <Input
                  value={billToName}
                  onChange={(e) => setBillToName(e.target.value)}
                  placeholder="Builder name"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="text-sm font-light">Billing Address</div>
                <Textarea
                  value={billToAddress}
                  onChange={(e) => setBillToAddress(e.target.value)}
                  placeholder="Bill to address"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-light">Invoice Date</div>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-light">Due Date (optional)</div>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Jobs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Completed Jobs</div>
                <div className="text-xs text-muted-foreground">
                  Only jobs not previously invoiced appear here.
                </div>
              </div>
              <div className="text-sm font-semibold">
                Subtotal: {money(subtotal)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Search jobs</div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by job title..."
              />
            </div>

            {filteredJobs.length === 0 ? (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                No completed jobs available to invoice.
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="max-h-64 overflow-auto">
                  {filteredJobs.map((j) => (
                    <label
                      key={j.id}
                      className="flex items-center justify-between gap-3 border-b p-3 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={!!selected[j.id]}
                          onCheckedChange={(v) =>
                            setSelected((prev) => ({ ...prev, [j.id]: !!v }))
                          }
                        />
                        <div>
                          <div className="text-sm font-medium">{j.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Scheduled: {j.scheduled_completion ?? "—"}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {money(j.price_cents)}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={isPending || !canSubmit} onClick={submit}>
              {isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
