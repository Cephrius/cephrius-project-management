"use client";

import { editJob } from "@/app/(app)/projects/[id]/actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CreatableCombobox,
  type ComboboxItem,
} from "@/components/projects/createable-combobox";
import type { JobRow } from "@/components/jobs/jobs-table";
import { toast } from "sonner";

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toTitleCase(value: string) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";

  return normalized.replace(/[A-Za-z]+/g, (segment) => {
    return segment[0].toUpperCase() + segment.slice(1).toLowerCase();
  });
}

function normalizeName(value: string) {
  return toTitleCase(value);
}

function upsertOptions(
  prev: ComboboxItem[],
  nextOption: ComboboxItem,
): ComboboxItem[] {
  if (prev.some((p) => p.id === nextOption.id)) return prev;
  return [...prev, nextOption].sort((a, b) => a.name.localeCompare(b.name));
}

function toComboboxItem(value: string): ComboboxItem {
  const normalized = normalizeName(value);
  return { id: normalized.toLowerCase(), name: normalized };
}

function toOptions(values: Array<string | null>): ComboboxItem[] {
  const seen = new Set<string>();
  const options: ComboboxItem[] = [];

  for (const value of values) {
    const normalized = normalizeName(value ?? "");
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({ id: key, name: normalized });
  }

  return options.sort((a, b) => a.name.localeCompare(b.name));
}

function centsToPriceInput(cents: number) {
  return (cents / 100).toFixed(2);
}

function parsePriceToCents(input: string) {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const numberValue = Number(cleaned);
  if (!Number.isFinite(numberValue) || numberValue < 0) return null;
  return Math.round(numberValue * 100);
}

function toPriceOption(cents: number): ComboboxItem {
  return {
    id: String(cents),
    name: centsToPriceInput(cents),
  };
}

type JobSeedRow = {
  title: string | null;
  superintendent: string | null;
  price_cents: number | null;
};

export function EditJobDialog({
  job,
  projectId,
  open,
  onOpenChange,
}: {
  job: JobRow;
  projectId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [titleOptions, setTitleOptions] = useState<ComboboxItem[]>([]);
  const [priceOptions, setPriceOptions] = useState<ComboboxItem[]>([]);
  const [defaultPriceByTitleId, setDefaultPriceByTitleId] = useState<
    Record<string, ComboboxItem>
  >({});
  const [superintendentOptions, setSuperintendentOptions] = useState<
    ComboboxItem[]
  >([]);

  const [title, setTitle] = useState<ComboboxItem | null>(
    toComboboxItem(job.title),
  );
  const [selectedPrice, setSelectedPrice] = useState<ComboboxItem | null>(
    toPriceOption(job.price_cents),
  );
  const [price, setPrice] = useState(centsToPriceInput(job.price_cents));
  const [scheduled, setScheduled] = useState(job.scheduled_completion ?? "");
  const [superintendent, setSuperintendent] = useState<ComboboxItem | null>(
    job.superintendent ? toComboboxItem(job.superintendent) : null,
  );

  useEffect(() => {
    if (!open) return;

    let isActive = true;

    (async () => {
      const { data } = await supabase
        .from("jobs")
        .select("title, superintendent, price_cents")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(500);

      if (!isActive || !data) return;

      const rows = data as JobSeedRow[];
      const nextTitleOptions = toOptions(rows.map((row) => row.title));
      const nextSuperintendentOptions = toOptions(
        rows.map((row) => row.superintendent),
      );

      const priceOptionMap = new Map<string, ComboboxItem>();
      const priceDefaultsByTitle: Record<string, ComboboxItem> = {};

      for (const row of rows) {
        if (typeof row.price_cents !== "number") continue;
        const option = toPriceOption(row.price_cents);
        if (!priceOptionMap.has(option.id)) {
          priceOptionMap.set(option.id, option);
        }

        const titleOption = toComboboxItem(row.title ?? "");
        if (!titleOption.name) continue;
        if (!priceDefaultsByTitle[titleOption.id]) {
          priceDefaultsByTitle[titleOption.id] = option;
        }
      }

      const nextPriceOptions = Array.from(priceOptionMap.values()).sort(
        (a, b) => Number(a.id) - Number(b.id),
      );

      setTitleOptions(nextTitleOptions);
      setPriceOptions(nextPriceOptions);
      setDefaultPriceByTitleId(priceDefaultsByTitle);
      setSuperintendentOptions(nextSuperintendentOptions);
    })();

    return () => {
      isActive = false;
    };
  }, [open, supabase, projectId]);

  async function createTitle(name: string) {
    const option = toComboboxItem(name);
    setTitleOptions((prev) => upsertOptions(prev, option));
    return option;
  }

  async function createSuperintendent(name: string) {
    const option = toComboboxItem(name);
    setSuperintendentOptions((prev) => upsertOptions(prev, option));
    return option;
  }

  async function createPrice(value: string) {
    const cents = parsePriceToCents(value);
    if (cents === null) throw new Error("Enter a valid price.");

    const option = toPriceOption(cents);
    setPriceOptions((prev) => upsertOptions(prev, option));
    setPrice(option.name);
    setSelectedPrice(option);
    return option;
  }

  function handleTitleChange(nextTitle: ComboboxItem | null) {
    setTitle(nextTitle);
    if (!nextTitle) return;

    const defaultPrice = defaultPriceByTitleId[nextTitle.id];
    if (!defaultPrice) return;

    setSelectedPrice(defaultPrice);
    setPrice(defaultPrice.name);
  }

  function handlePriceChange(nextPrice: ComboboxItem | null) {
    setSelectedPrice(nextPrice);
    setPrice(nextPrice?.name ?? "");
  }

  function submit() {
    setError(null);

    const fd = new FormData();
    fd.set("job_id", job.id);
    fd.set("title", toTitleCase(title?.name ?? ""));
    fd.set("price", price);
    fd.set("scheduled_completion", scheduled);
    fd.set("superintendent", toTitleCase(superintendent?.name ?? ""));

    startTransition(async () => {
      const res = await editJob(fd);
      if (!res.ok) {
        const message = res.message || "Failed to edit job.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Job updated successfully.");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <CreatableCombobox
            label="Job Title"
            placeholder="Select or create job title..."
            items={titleOptions}
            value={title}
            onChange={handleTitleChange}
            onCreate={createTitle}
          />

          <div className="space-y-2">
            <CreatableCombobox
              label="Job Price"
              placeholder="Select or create project price..."
              items={priceOptions}
              value={selectedPrice}
              onChange={handlePriceChange}
              onCreate={createPrice}
            />
            <p className="text-xs text-muted-foreground">
              Prices are suggested from this project only.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Scheduled Completion (Optional)</div>
            <Input
              type="date"
              value={scheduled}
              onChange={(e) => setScheduled(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <CreatableCombobox
              label="Superintendent / General Contractor (Optional)"
              placeholder="Select or create contractor name..."
              items={superintendentOptions}
              value={superintendent}
              onChange={setSuperintendent}
              onCreate={createSuperintendent}
            />
            {superintendent && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-0 text-muted-foreground hover:text-foreground"
                onClick={() => setSuperintendent(null)}
              >
                Clear contractor
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submit}
              disabled={isPending || !title?.name.trim() || !price.trim()}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
