"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProjectDialog } from "./edit-project-dialog";
import type { LookupItem, ProjectListItem } from "./types";

export function EditProjectButton({
  project,
  builders,
  subdivisions,
}: {
  project: ProjectListItem;
  builders: LookupItem[];
  subdivisions: LookupItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-4" />
        Edit
      </Button>

      <EditProjectDialog
        open={open}
        onOpenChange={setOpen}
        project={project}
        initialBuilders={builders}
        initialSubdivisions={subdivisions}
      />
    </>
  );
}
