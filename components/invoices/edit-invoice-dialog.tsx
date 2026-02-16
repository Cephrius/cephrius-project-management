"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { editInvoice } from "@/app/(app)/invoices/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type EditableInvoice = {
  id: string;
  invoice_number: string;
  contractor_name: string | null;
  contractor_address: string | null;
  contractor_phone: string | null;
  bill_to_name: string | null;
  bill_to_address: string | null;
  invoice_date: string | null;
  due_date: string | null;
};

type EditableInvoiceItem = {
  id: string;
  job_title_snapshot: string | null;
  job_price_cents_snapshot: number | null;
  project_address_snapshot: string | null;
  subdivision_name_raw_snapshot: string | null;
  builder_name_snapshot: string | null;
};

type EditableItemState = {
  id: string;
  title: string;
  price: string;
  projectAddress: string;
  subdivision: string;
  builderName: string;
};

function centsToPriceInput(cents: number | null) {
  return ((cents ?? 0) / 100).toFixed(2);
}

function toEditableItemState(item: EditableInvoiceItem): EditableItemState {
  return {
    id: item.id,
    title: item.job_title_snapshot ?? "",
    price: centsToPriceInput(item.job_price_cents_snapshot),
    projectAddress: item.project_address_snapshot ?? "",
    subdivision: item.subdivision_name_raw_snapshot ?? "",
    builderName: item.builder_name_snapshot ?? "",
  };
}

export function EditInvoiceDialog({
  invoice,
  items,
}: {
  invoice: EditableInvoice;
  items: EditableInvoiceItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [contractorName, setContractorName] = useState(invoice.contractor_name ?? "");
  const [contractorAddress, setContractorAddress] = useState(
    invoice.contractor_address ?? "",
  );
  const [contractorPhone, setContractorPhone] = useState(
    invoice.contractor_phone ?? "",
  );
  const [billToName, setBillToName] = useState(invoice.bill_to_name ?? "");
  const [billToAddress, setBillToAddress] = useState(invoice.bill_to_address ?? "");
  const [invoiceDate, setInvoiceDate] = useState(invoice.invoice_date ?? "");
  const [dueDate, setDueDate] = useState(invoice.due_date ?? "");
  const [itemRows, setItemRows] = useState<EditableItemState[]>(
    items.map(toEditableItemState),
  );

  function resetFormFromInvoice() {
    setError(null);
    setContractorName(invoice.contractor_name ?? "");
    setContractorAddress(invoice.contractor_address ?? "");
    setContractorPhone(invoice.contractor_phone ?? "");
    setBillToName(invoice.bill_to_name ?? "");
    setBillToAddress(invoice.bill_to_address ?? "");
    setInvoiceDate(invoice.invoice_date ?? "");
    setDueDate(invoice.due_date ?? "");
    setItemRows(items.map(toEditableItemState));
  }

  const canSubmit =
    contractorName.trim().length > 0 &&
    billToName.trim().length > 0 &&
    billToAddress.trim().length > 0 &&
    invoiceDate.trim().length > 0 &&
    itemRows.length > 0 &&
    itemRows.every(
      (item) => item.title.trim().length > 0 && item.price.trim().length > 0,
    );

  function updateItemRow(
    id: string,
    key: keyof Omit<EditableItemState, "id">,
    nextValue: string,
  ) {
    setItemRows((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: nextValue } : item)),
    );
  }

  function onSubmit() {
    if (!canSubmit || isPending) return;
    setError(null);

    const fd = new FormData();
    fd.set("invoice_id", invoice.id);
    fd.set("contractor_name", contractorName);
    fd.set("contractor_address", contractorAddress);
    fd.set("contractor_phone", contractorPhone);
    fd.set("bill_to_name", billToName);
    fd.set("bill_to_address", billToAddress);
    fd.set("invoice_date", invoiceDate);
    fd.set("due_date", dueDate);
    itemRows.forEach((item) => {
      fd.append("item_id", item.id);
      fd.append("item_title", item.title);
      fd.append("item_price", item.price);
      fd.append("item_project_address", item.projectAddress);
      fd.append("item_subdivision", item.subdivision);
      fd.append("item_builder_name", item.builderName);
    });

    startTransition(async () => {
      const res = await editInvoice(fd);
      if (!res.ok) {
        setError(res.message ?? "Failed to update invoice.");
        return;
      }
      toast.success("Invoice updated.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) resetFormFromInvoice();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2 print:hidden">
          <Pencil className="size-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {invoice.invoice_number}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="space-y-2">
            <div className="text-sm font-medium">From</div>
            <Input
              value={contractorName}
              onChange={(event) => setContractorName(event.target.value)}
              placeholder="Contractor name"
            />
            <Input
              value={contractorAddress}
              onChange={(event) => setContractorAddress(event.target.value)}
              placeholder="Contractor address"
            />
            <Input
              value={contractorPhone}
              onChange={(event) => setContractorPhone(event.target.value)}
              placeholder="Contractor phone"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Bill To</div>
            <Input
              value={billToName}
              onChange={(event) => setBillToName(event.target.value)}
              placeholder="Bill-to name"
            />
            <Input
              value={billToAddress}
              onChange={(event) => setBillToAddress(event.target.value)}
              placeholder="Bill-to address"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Invoice Date</div>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(event) => setInvoiceDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Due Date (Optional)</div>
              <Input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Invoice Items</div>
            {itemRows.map((item, index) => (
              <div key={item.id} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-muted-foreground">
                    Line Item {index + 1}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={itemRows.length <= 1}
                    onClick={() => {
                      setItemRows((prev) =>
                        prev.filter((entry) => entry.id !== item.id),
                      );
                    }}
                    aria-label={`Remove line item ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <Input
                  value={item.title}
                  onChange={(event) =>
                    updateItemRow(item.id, "title", event.target.value)
                  }
                  placeholder="Description"
                />
                <Input
                  value={item.price}
                  onChange={(event) =>
                    updateItemRow(item.id, "price", event.target.value)
                  }
                  placeholder="Amount"
                />
                <Input
                  value={item.projectAddress}
                  onChange={(event) =>
                    updateItemRow(item.id, "projectAddress", event.target.value)
                  }
                  placeholder="Project address"
                />
                <Input
                  value={item.subdivision}
                  onChange={(event) =>
                    updateItemRow(item.id, "subdivision", event.target.value)
                  }
                  placeholder="Subdivision"
                />
                <Input
                  value={item.builderName}
                  onChange={(event) =>
                    updateItemRow(item.id, "builderName", event.target.value)
                  }
                  placeholder="Builder"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !canSubmit}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
