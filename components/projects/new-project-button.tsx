"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "./new-project-dialog";

type Item = { id: string; name: string };

export function NewProjectButton({
  initialBuilders,
  initialSubdivisions,
}: {
  initialBuilders: Item[];
  initialSubdivisions: Item[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>New Project</Button>
      <NewProjectDialog
        open={open}
        onOpenChange={setOpen}
        initialBuilders={initialBuilders}
        initialSubdivisions={initialSubdivisions}
      />
    </>
  );
}
