"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleJobComplete } from "@/app/(app)/projects/[id]/actions";

export function ToggleJobCompleteButton({
  jobId,
}: {
  jobId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="mt-2 border-primary/30 hover:bg-primary/10"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleJobComplete(jobId, true);
          if (!result?.ok) {
            toast.error(result?.message ?? "Failed to update job.");
            return;
          }
          toast.success("Job marked as complete.");
          router.refresh();
        });
      }}
    >
      <CheckCircle2 className="size-4" />
      {isPending ? "Saving..." : "Mark Complete"}
    </Button>
  );
}
