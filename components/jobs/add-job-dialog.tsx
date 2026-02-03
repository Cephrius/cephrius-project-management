"use client";

import { createJob } from "@/app/(app)/projects/[id]/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AddJobDialog({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [scheduled, setScheduled] = useState("");

  function submit() {
    setError(null);

    const fd = new FormData();
    fd.set("title", title);
    fd.set("price", price);
    fd.set("scheduled_completion", scheduled);

    startTransition(async () => {
      const res = await createJob(projectId, fd);
      if (!res.ok) {
        setError(res.message || "Failed to add job.");
        return;
      }
      onOpenChange(false);
      setTitle("");
      setPrice("");
      setScheduled("");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Job</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Job Title</div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Steel framing"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Job Price</div>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1200.00"
            />
            <p className="text-xs text-muted-foreground">
              Tip: you can type $1,200.00 too.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Scheduled Completion</div>
            <Input
              type="date"
              value={scheduled}
              onChange={(e) => setScheduled(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={
                isPending || !title.trim() || !price.trim() || !scheduled
              }
            >
              {isPending ? "Saving..." : "Save Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
