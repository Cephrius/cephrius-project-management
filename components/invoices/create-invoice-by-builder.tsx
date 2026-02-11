"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createInvoiceForBuilder } from "@/app/(app)/invoices/actions";
import {
  CreatableCombobox,
  type ComboboxItem,
} from "../projects/createable-combobox";

type Contractor = { company_name: string; address: string; phone: string };

type Builder = { id: string; name: string };

type EligibleJob = {
  id: string;
  title: string;
  price_cents: number;
  project_id: string;
  project_address: string;
  subdivision: string | null;
};

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export function CreateInvoiceByBuilder({
  builders,
  initialContractor,
}: {
  builders: Builder[];
  initialContractor: Contractor;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [builder, setBuilder] = useState<ComboboxItem | null>(null);

  const [contractorName, setContractorName] = useState(
    initialContractor.company_name,
  );
  const [contractorAddress, setContractorAddress] = useState(
    initialContractor.address,
  );
  const [contractorPhone, setContractorPhone] = useState(
    initialContractor.phone,
  );

  const [billToName, setBillToName] = useState("");
  const [billToAddress, setBillToAddress] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState("");

  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobs, setJobs] = useState<EligibleJob[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const builderItems: ComboboxItem[] = useMemo(
    () => builders.map((b) => ({ id: b.id, name: b.name })),
    [builders],
  );

  async function loadEligibleJobs(builderId: string) {
    setLoadingJobs(true);
    setError(null);

    try {
      // 1) Projects for builder
      const { data: projects, error: projErr } = await supabase
        .from("projects")
        .select("id, project_address, subdivision")
        .eq("builder_id", builderId)
        .is("deleted_at", null);

      if (projErr) throw new Error(projErr.message);

      const projectList = projects ?? [];
      if (projectList.length === 0) {
        setJobs([]);
        setSelected({});
        return;
      }

      const projectIds = projectList.map((p) => p.id);
      const projectMap = new Map(projectList.map((p) => [p.id, p]));

      // 2) Completed jobs in those projects
      const { data: completedJobs, error: jobsErr } = await supabase
        .from("jobs")
        .select("id, title, price_cents, project_id")
        .in("project_id", projectIds)
        .eq("is_completed", true)
        .is("deleted_at", null);

      if (jobsErr) throw new Error(jobsErr.message);

      const completed = completedJobs ?? [];
      if (completed.length === 0) {
        setJobs([]);
        setSelected({});
        return;
      }

      // 3) Exclude already invoiced jobs
      const { data: invoicedItems, error: invItemsErr } = await supabase
        .from("invoice_items")
        .select("job_id")
        .in(
          "job_id",
          completed.map((j) => j.id),
        );

      if (invItemsErr) throw new Error(invItemsErr.message);

      const invoicedSet = new Set(
        (invoicedItems ?? []).map((x: any) => x.job_id as string),
      );

      const eligible: EligibleJob[] = completed
        .filter((j) => !invoicedSet.has(j.id))
        .map((j) => {
          const p = projectMap.get(j.project_id);
          return {
            id: j.id,
            title: j.title,
            price_cents: j.price_cents,
            project_id: j.project_id,
            project_address: p?.project_address ?? "—",
            subdivision: p?.subdivision ?? null,
          };
        })
        .sort((a, b) => a.project_address.localeCompare(b.project_address));

      setJobs(eligible);

      // Default select all
      const initialSel: Record<string, boolean> = {};
      eligible.forEach((j) => (initialSel[j.id] = true));
      setSelected(initialSel);
    } finally {
      setLoadingJobs(false);
    }
  }

  const selectedJobs = useMemo(
    () => jobs.filter((j) => selected[j.id]),
    [jobs, selected],
  );
  const subtotal = useMemo(
    () => selectedJobs.reduce((sum, j) => sum + (j.price_cents ?? 0), 0),
    [selectedJobs],
  );

  const canSubmit =
    !!builder &&
    contractorName.trim() &&
    billToName.trim() &&
    billToAddress.trim() &&
    invoiceDate.trim() &&
    selectedJobs.length > 0;

  function submit() {
    setError(null);

    startTransition(async () => {
      const fd = new FormData();

      fd.set("builder_id", builder!.id);

      fd.set("contractor_name", contractorName);
      fd.set("contractor_address", contractorAddress);
      fd.set("contractor_phone", contractorPhone);

      fd.set("bill_to_name", billToName);
      fd.set("bill_to_address", billToAddress);

      fd.set("invoice_date", invoiceDate);
      fd.set("due_date", dueDate);

      selectedJobs.forEach((j) => fd.append("job_ids", j.id));

      const res = await createInvoiceForBuilder(fd);
      if (!res.ok) {
        setError(res.message ?? "Failed to create invoice.");
        return;
      }

      router.push(`/invoices/${res.invoiceId}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Builder */}
      <div className="space-y-2">
        <CreatableCombobox
          label="Builder"
          placeholder="Select builder..."
          items={builderItems}
          value={builder}
          onChange={(b) => {
            setBuilder(b);
            setJobs([]);
            setSelected({});
            if (b?.id) {
              // Optional convenience: default bill-to name to builder name
              setBillToName(b.name);
              loadEligibleJobs(b.id);
            }
          }}
          // No creation here (builders are created via your Projects flow)
          // We keep it selectable-only by not showing create UI:
          onCreate={async () => {
            throw new Error("Create builders from Projects for now.");
          }}
        />
        <p className="text-xs text-muted-foreground">
          This invoice will include completed jobs from multiple projects under
          the selected builder.
        </p>
      </div>

      {/* Contractor */}
      <div className="space-y-3">
        <div className="text-sm font-semibold">Contractor Info</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Company Name</div>
            <Input
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Address</div>
            <Textarea
              value={contractorAddress}
              onChange={(e) => setContractorAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Phone</div>
            <Input
              value={contractorPhone}
              onChange={(e) => setContractorPhone(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="space-y-3">
        <div className="text-sm font-semibold">Bill To</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Builder Name</div>
            <Input
              value={billToName}
              onChange={(e) => setBillToName(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Billing Address</div>
            <Textarea
              value={billToAddress}
              onChange={(e) => setBillToAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium">Invoice Date</div>
          <Input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Due Date (optional)</div>
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
            <div className="text-sm font-semibold">Eligible Completed Jobs</div>
            <div className="text-xs text-muted-foreground">
              Completed jobs not already invoiced.
            </div>
          </div>
          <div className="text-sm font-semibold">
            Subtotal: {money(subtotal)}
          </div>
        </div>

        {!builder ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            Select a builder to load eligible jobs.
          </div>
        ) : loadingJobs ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            Loading jobs…
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            No completed jobs available to invoice for this builder.
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="max-h-80 overflow-auto">
              {jobs.map((j) => (
                <label
                  key={j.id}
                  className="flex items-start justify-between gap-3 border-b p-3 last:border-b-0"
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
                        {j.project_address} • {j.subdivision ?? "—"}
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
          onClick={() => router.push("/invoices")}
        >
          Cancel
        </Button>
        <Button disabled={isPending || !canSubmit} onClick={submit}>
          {isPending ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </div>
  );
}
