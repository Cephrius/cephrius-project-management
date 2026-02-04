"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";

export function CreateInvoiceButton({
  projectId,
  disabled,
}: {
  projectId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Create Invoice
      </Button>
      <CreateInvoiceDialog
        projectId={projectId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
