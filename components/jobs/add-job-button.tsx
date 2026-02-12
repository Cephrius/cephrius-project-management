"use client";

import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { AddJobDialog } from "@/components/jobs/add-job-dialog";

type ButtonProps = ComponentProps<typeof Button>;

export function AddJobButton({
  projectId,
  label = "Add Job",
  variant,
  size,
  className,
}: {
  projectId: string;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        {label}
      </Button>
      <AddJobDialog projectId={projectId} open={open} onOpenChange={setOpen} />
    </>
  );
}
