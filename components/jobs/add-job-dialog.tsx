"use client";

import { createJob } from "@/app/(app)/projects/[id]/actions";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreatableCombobox,
  type ComboboxItem,
} from "@/components/projects/createable-combobox";
import { CompletedByCombobox } from "@/components/jobs/completed-by-combobox";

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

function parsePriceToCents(input: string) {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const numberValue = Number(cleaned);
  if (!Number.isFinite(numberValue) || numberValue < 0) return null;
  return Math.round(numberValue * 100);
}

function centsToPriceInput(cents: number) {
  return (cents / 100).toFixed(2);
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

type EmployeeSeedRow = {
  id: string;
  name: string;
};

type CrewSeedRow = {
  id: string;
  name: string;
};

export function AddJobDialog({
  projectId,
  open,
  onOpenChange,
  initialTitle = "",
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialTitle?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showUnassignedConfirm, setShowUnassignedConfirm] = useState(false);

  const [titleOptions, setTitleOptions] = useState<ComboboxItem[]>([]);
  const [priceOptions, setPriceOptions] = useState<ComboboxItem[]>([]);
  const [defaultPriceByTitleId, setDefaultPriceByTitleId] = useState<
    Record<string, ComboboxItem>
  >({});
  const [superintendentOptions, setSuperintendentOptions] = useState<
    ComboboxItem[]
  >([]);

  const [title, setTitle] = useState<ComboboxItem | null>(() => {
    const normalizedInitialTitle = normalizeName(initialTitle);
    return normalizedInitialTitle
      ? toComboboxItem(normalizedInitialTitle)
      : null;
  });
  const [selectedPrice, setSelectedPrice] = useState<ComboboxItem | null>(null);
  const [price, setPrice] = useState("");
  const [scheduled, setScheduled] = useState("");
  const [superintendent, setSuperintendent] = useState<ComboboxItem | null>(
    null,
  );
  const [employees, setEmployees] = useState<EmployeeSeedRow[]>([]);
  const [crews, setCrews] = useState<CrewSeedRow[]>([]);
  const [completedByValue, setCompletedByValue] = useState("");
  const canSubmit = Boolean(title?.name.trim() && price.trim());

  useEffect(() => {
    if (!open) return;

    let isActive = true;

    (async () => {
      const [jobsRes, employeesRes, crewsRes] = await Promise.all([
        supabase
          .from("jobs")
          .select("title, superintendent, price_cents")
          .eq("project_id", projectId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("employees")
          .select("id, name")
          .is("deleted_at", null)
          .order("name", { ascending: true }),
        supabase
          .from("crews")
          .select("id, name")
          .is("deleted_at", null)
          .order("name", { ascending: true }),
      ]);

      if (!isActive) return;
      if (!jobsRes.data) return;

      const rows = jobsRes.data as JobSeedRow[];
      const nextTitleOptions = toOptions(rows.map((job) => job.title));
      const nextSuperintendentOptions = toOptions(
        rows.map((job) => job.superintendent),
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
      setEmployees((employeesRes.data ?? []) as EmployeeSeedRow[]);
      setCrews((crewsRes.data ?? []) as CrewSeedRow[]);
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

  function submit(forceUnassigned = false) {
    setError(null);

    const [completedByType, completedById] = completedByValue.split(":");
    const hasAssignee = Boolean(completedByType && completedById);

    if (!hasAssignee && !forceUnassigned) {
      setShowUnassignedConfirm(true);
      return;
    }

    const completedByName = hasAssignee
      ? completedByType === "crew"
        ? crews.find((crew) => crew.id === completedById)?.name ?? ""
        : employees.find((employee) => employee.id === completedById)?.name ?? ""
      : "";

    const fd = new FormData();
    fd.set("title", toTitleCase(title?.name ?? ""));
    fd.set("price", price);
    fd.set("scheduled_completion", scheduled);
    fd.set("superintendent", toTitleCase(superintendent?.name ?? ""));
    fd.set("completed_by_type", hasAssignee ? completedByType : "");
    fd.set("completed_by_id", hasAssignee ? completedById : "");
    fd.set("completed_by_name", hasAssignee ? completedByName : "");

    startTransition(async () => {
      const res = await createJob(projectId, fd);
      if (!res.ok) {
        setError(res.message || "Failed to add job.");
        return;
      }
      onOpenChange(false);
      setTitle(null);
      setSelectedPrice(null);
      setPrice("");
      setScheduled("");
      setSuperintendent(null);
      setCompletedByValue("");
      router.refresh();
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Job</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (isPending || !canSubmit) return;
            submit();
          }}
        >
          <CreatableCombobox
            label="Job Title"
            placeholder="Select or create job title..."
            items={titleOptions}
            value={title}
            onChange={handleTitleChange}
            onCreate={createTitle}
            onDelete={(item) => {
              setTitleOptions((prev) =>
                prev.filter((entry) => entry.id !== item.id),
              );
              setDefaultPriceByTitleId((prev) => {
                const next = { ...prev };
                delete next[item.id];
                return next;
              });
            }}
          />

          <div className="space-y-2">
            <CreatableCombobox
              label="Job Price"
              placeholder="Select or create project price..."
              items={priceOptions}
              value={selectedPrice}
              onChange={handlePriceChange}
              onCreate={createPrice}
              onDelete={(item) => {
                setPriceOptions((prev) =>
                  prev.filter((entry) => entry.id !== item.id),
                );
              }}
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
            <CompletedByCombobox
              value={completedByValue}
              onChange={setCompletedByValue}
              employees={employees}
              crews={crews}
              helperText="Assign a person or crew now to streamline payroll tracking."
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
              onDelete={(item) => {
                setSuperintendentOptions((prev) =>
                  prev.filter((entry) => entry.id !== item.id),
                );
              }}
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
              type="submit"
              disabled={isPending || !canSubmit}
            >
              {isPending ? "Saving..." : "Save Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>

      <AlertDialog
        open={showUnassignedConfirm}
        onOpenChange={setShowUnassignedConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No one is assigned to this job</AlertDialogTitle>
            <AlertDialogDescription>
              This job has no employee or crew assigned. Do you want to
              continue and save it as unassigned?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => submit(true)}
            >
              {isPending ? "Saving..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
