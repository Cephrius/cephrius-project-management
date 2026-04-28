"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, RotateCcw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { claimJob, markJobComplete, reopenJob } from "./actions";

type Action = "claim" | "complete" | "reopen";

const ICONS: Record<Action, React.ReactNode> = {
  claim: <UserPlus className="size-3.5" />,
  complete: <CheckCircle2 className="size-3.5" />,
  reopen: <RotateCcw className="size-3.5" />,
};

const LABELS: Record<Action, string> = {
  claim: "Claim",
  complete: "Mark complete",
  reopen: "Reopen",
};

export function JobActionButton({
  jobId,
  action,
  variant = "default",
  size = "sm",
  className,
}: {
  jobId: string;
  action: Action;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isPending}
      className={className}
      onClick={() => {
        startTransition(async () => {
          const fn =
            action === "claim"
              ? claimJob
              : action === "complete"
                ? markJobComplete
                : reopenJob;
          const result = await fn(jobId);
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          toast.success(
            action === "claim"
              ? "Job claimed."
              : action === "complete"
                ? "Marked complete."
                : "Reopened.",
          );
          router.refresh();
        });
      }}
    >
      {ICONS[action]}
      {LABELS[action]}
    </Button>
  );
}
