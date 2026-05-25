"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  createBuilder,
  createSubdivision,
  createProject,
} from "@/app/(jobsyte-app)/projects/actions";
import {
  CreatableCombobox,
  type ComboboxItem,
} from "@/components/projects/createable-combobox";

function toTitleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[A-Za-z]+/g, (segment) => {
      return segment[0].toUpperCase() + segment.slice(1).toLowerCase();
    });
}

function normalizeStreetNumber(value: string) {
  return value.replace(/\D+/g, "");
}

type Item = { id: string; name: string };

function findItemById(items: ComboboxItem[], id: string | null) {
  if (!id) return null;
  return items.find((item) => item.id === id) ?? null;
}

export function NewProjectDialog({
  open,
  onOpenChange,
  initialBuilders = [],
  initialSubdivisions = [],
  initialSubdivisionId = "",
  initialHouseNumber = "",
  initialStreetAddress = "",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialBuilders?: Item[];
  initialSubdivisions?: Item[];
  initialSubdivisionId?: string;
  initialHouseNumber?: string;
  initialStreetAddress?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [houseNumber, setHouseNumber] = useState(
    normalizeStreetNumber(initialHouseNumber),
  );
  const [streetAddress, setStreetAddress] = useState(
    toTitleCase(initialStreetAddress),
  );

  const [builders, setBuilders] = useState<ComboboxItem[]>(initialBuilders);
  const [subdivisions, setSubdivisions] =
    useState<ComboboxItem[]>(initialSubdivisions);

  const [builder, setBuilder] = useState<ComboboxItem | null>(null);
  const [subdivision, setSubdivision] = useState<ComboboxItem | null>(
    findItemById(initialSubdivisions, initialSubdivisionId),
  );

  useEffect(() => {
    if (!open) return;
    let isActive = true;

    const needsBuilders = initialBuilders.length === 0;
    const needsSubdivisions = initialSubdivisions.length === 0;
    if (!needsBuilders && !needsSubdivisions) {
      return () => {
        isActive = false;
      };
    }

    (async () => {
      const [buildersRes, subdivisionsRes] = await Promise.all([
        supabase.from("builders").select("id, name").order("name"),
        supabase.from("subdivisions").select("id, name").order("name"),
      ]);

      if (!isActive) return;
      if (needsBuilders && buildersRes.data) {
        setBuilders(buildersRes.data as ComboboxItem[]);
      }
      if (needsSubdivisions && subdivisionsRes.data) {
        const loadedSubdivisions = subdivisionsRes.data as ComboboxItem[];
        setSubdivisions(loadedSubdivisions);
        if (initialSubdivisionId) {
          const initialSubdivision = findItemById(
            loadedSubdivisions,
            initialSubdivisionId,
          );
          if (initialSubdivision) {
            setSubdivision((current) => current ?? initialSubdivision);
          }
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [
    open,
    initialBuilders,
    initialSubdivisions,
    initialSubdivisionId,
    supabase,
  ]);

  const canSubmit = useMemo(() => {
    return (
      houseNumber.trim().length > 0 &&
      streetAddress.trim().length > 0 &&
      !!builder &&
      !!subdivision
    );
  }, [houseNumber, streetAddress, builder, subdivision]);

  async function onCreateBuilder(name: string) {
    const res = await createBuilder(name);
    if (!res.ok || !res.data)
      throw new Error(res.message ?? "Failed to create builder.");
    setBuilders((prev) => {
      if (prev.some((p) => p.id === res.data!.id)) return prev;
      return [...prev, res.data!].sort((a, b) => a.name.localeCompare(b.name));
    });
    return res.data;
  }

  async function onCreateSubdivision(name: string) {
    const res = await createSubdivision(name);
    if (!res.ok || !res.data)
      throw new Error(res.message ?? "Failed to create subdivision.");
    setSubdivisions((prev) => {
      if (prev.some((p) => p.id === res.data!.id)) return prev;
      return [...prev, res.data!].sort((a, b) => a.name.localeCompare(b.name));
    });
    return res.data;
  }

  function onSubmit() {
    setError(null);

    const fd = new FormData();
    fd.set("house_number", normalizeStreetNumber(houseNumber));
    fd.set("street_address", toTitleCase(streetAddress));

    // We submit IDs when selected.
    if (builder?.id) fd.set("builder_id", builder.id);
    // (Fallback if you ever want: fd.set("builder_name", builder?.name ?? ""))

    if (subdivision?.id) fd.set("subdivision_id", subdivision.id);

    startTransition(async () => {
      const res = await createProject(fd);
      if (!res.ok) {
        setError(res.message ?? "Failed to create project.");
        return;
      }

      router.refresh();
      onOpenChange(false);
      router.push(`/projects/${res.projectId}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (isPending || !canSubmit) return;
            onSubmit();
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Street Number</div>
              <Input
                value={houseNumber}
                onChange={(e) => setHouseNumber(normalizeStreetNumber(e.target.value))}
                onBlur={() =>
                  setHouseNumber((current) => normalizeStreetNumber(current))
                }
                placeholder="1234"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="text-sm font-medium">Street Address</div>
              <Input
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                onBlur={() =>
                  setStreetAddress((current) => toTitleCase(current))
                }
                placeholder="Main St"
              />
            </div>
          </div>

          <CreatableCombobox
            label="Builder"
            placeholder="Select or create builder..."
            items={builders}
            value={builder}
            onChange={setBuilder}
            onCreate={onCreateBuilder}
            onDelete={(item) => {
              setBuilders((prev) => prev.filter((entry) => entry.id !== item.id));
            }}
          />

          <CreatableCombobox
            label="Subdivision"
            placeholder="Select or create subdivision..."
            items={subdivisions}
            value={subdivision}
            onChange={setSubdivision}
            onCreate={onCreateSubdivision}
            onDelete={(item) => {
              setSubdivisions((prev) =>
                prev.filter((entry) => entry.id !== item.id),
              );
            }}
          />

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
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
