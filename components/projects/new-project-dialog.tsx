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
} from "@/app/(app)/projects/actions";
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

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

type Item = { id: string; name: string };

export function NewProjectDialog({
  open,
  onOpenChange,
  initialBuilders = [],
  initialSubdivisions = [],
  initialHouseNumber = "",
  initialStreetAddress = "",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialBuilders?: Item[];
  initialSubdivisions?: Item[];
  initialHouseNumber?: string;
  initialStreetAddress?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [houseNumber, setHouseNumber] = useState(
    normalizeWhitespace(initialHouseNumber),
  );
  const [streetAddress, setStreetAddress] = useState(
    toTitleCase(initialStreetAddress),
  );

  const [builders, setBuilders] = useState<ComboboxItem[]>(initialBuilders);
  const [subdivisions, setSubdivisions] =
    useState<ComboboxItem[]>(initialSubdivisions);

  const [builder, setBuilder] = useState<ComboboxItem | null>(null);
  const [subdivision, setSubdivision] = useState<ComboboxItem | null>(null);

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
        setSubdivisions(subdivisionsRes.data as ComboboxItem[]);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [open, initialBuilders, initialSubdivisions, supabase]);

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
    fd.set("house_number", normalizeWhitespace(houseNumber));
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

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Street Number</div>
              <Input
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                onBlur={() =>
                  setHouseNumber((current) => normalizeWhitespace(current))
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
          />

          <CreatableCombobox
            label="Subdivision"
            placeholder="Select or create subdivision..."
            items={subdivisions}
            value={subdivision}
            onChange={setSubdivision}
            onCreate={onCreateSubdivision}
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
              type="button"
              disabled={isPending || !canSubmit}
              onClick={onSubmit}
            >
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
