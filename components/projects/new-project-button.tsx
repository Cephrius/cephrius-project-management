"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "./new-project-dialog";

type Item = { id: string; name: string };

export function NewProjectButton({
  initialBuilders,
  initialSubdivisions,
  initialSubdivisionId,
  initialHouseNumber,
  initialStreetAddress,
  buttonLabel = "New Project",
}: {
  initialBuilders: Item[];
  initialSubdivisions: Item[];
  initialSubdivisionId?: string;
  initialHouseNumber?: string;
  initialStreetAddress?: string;
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dialogSeed, setDialogSeed] = useState(0);

  return (
    <>
      <Button
        onClick={() => {
          setDialogSeed((current) => current + 1);
          setOpen(true);
        }}
      >
        {buttonLabel}
      </Button>
      <NewProjectDialog
        key={`new-project-dialog-${dialogSeed}`}
        open={open}
        onOpenChange={setOpen}
        initialBuilders={initialBuilders}
        initialSubdivisions={initialSubdivisions}
        initialSubdivisionId={initialSubdivisionId}
        initialHouseNumber={initialHouseNumber}
        initialStreetAddress={initialStreetAddress}
      />
    </>
  );
}
