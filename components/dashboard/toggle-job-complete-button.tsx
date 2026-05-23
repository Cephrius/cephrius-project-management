"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleJobComplete } from "@/app/(jobsyte-app)/(app)/projects/[id]/actions";
import { cn } from "@/lib/utils";

export function ToggleJobCompleteButton({
  jobId,
  compact = false,
}: {
  jobId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={cn(
        "border-primary/30 hover:bg-primary/10",
        // Compact mode keeps calendar list rows short enough for the bounded dashboard card.
        compact ? "h-7 shrink-0 gap-1 px-2 text-[11px]" : "mt-2",
      )}
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
      {isPending ? "Saving..." : compact ? "Done" : "Mark Complete"}
    </Button>
  );
}
