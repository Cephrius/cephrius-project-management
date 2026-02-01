"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createBuilder, createSubdivision, createProject } from "@/app/(app)/projects/actions";
import { CreatableCombobox, type ComboboxItem } from "@/components/projects/createable-combobox";
import { sub } from "date-fns";

type Item = { id: string; name: string };

export function NewProjectDialog({
  open,
  onOpenChange,
  initialBuilders,
  initialSubdivisions,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialBuilders: Item[];
  initialSubdivisions: Item[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [projectAddress, setProjectAddress] = useState("");

  const [builders, setBuilders] = useState<ComboboxItem[]>(initialBuilders);
  const [subdivisions, setSubdivisions] = useState<ComboboxItem[]>(initialSubdivisions);

  const [builder, setBuilder] = useState<ComboboxItem | null>(null);
  const [subdivision, setSubdivision] = useState<ComboboxItem | null>(null);

  const canSubmit = useMemo(() => {
    return projectAddress.trim().length > 0 && !!builder && !!subdivision;
  }, [projectAddress, builder, subdivision]);

  async function onCreateBuilder(name: string) {
    const res = await createBuilder(name);
    if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to create builder.");
    setBuilders((prev) => {
      if (prev.some((p) => p.id === res.data!.id)) return prev;
      return [...prev, res.data!].sort((a, b) => a.name.localeCompare(b.name));
    });
    return res.data;
  }

  async function onCreateSubdivision(name: string) {
    const res = await createSubdivision(name);
    if (!res.ok || !res.data) throw new Error(res.message ?? "Failed to create subdivision.");
    setSubdivisions((prev) => {
      if (prev.some((p) => p.id === res.data!.id)) return prev;
      return [...prev, res.data!].sort((a, b) => a.name.localeCompare(b.name));
    });
    return res.data;
  }

  function onSubmit() {
    setError(null);

    const fd = new FormData();
    fd.set("project_address", projectAddress);

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

      onOpenChange(false);
      router.push(`/projects/${res.projectId}`);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Project Address</div>
            <Input
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
              placeholder="1234 Main St, Houston TX"
            />
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
            <Button type="button" disabled={isPending || !canSubmit} onClick={onSubmit}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
