"use client";

import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";

type ButtonProps = ComponentProps<typeof Button>;

export function CreateInvoiceButton({
  projectId,
  disabled,
  label = "Create Invoice",
  variant = "outline",
  size,
  className,
}: {
  projectId: string;
  disabled?: boolean;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <CreateInvoiceDialog
        projectId={projectId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
