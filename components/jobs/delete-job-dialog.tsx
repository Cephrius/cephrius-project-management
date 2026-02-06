import { deleteJob } from "@/app/(app)/projects/[id]/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ReactNode } from "react";

export function DeleteJobDialog({
  open,
  onOpenChange,
  jobId,
  trigger,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  jobId: string;
  trigger?: ReactNode;
}) {
  const router = useRouter();

  async function onDelete() {
    // TODO: Implement delete job action
    const res = await deleteJob(jobId);
    if (!res.ok) {
      // Handle error (e.g. show toast)
      toast.error("Failed to delete job");
      console.error("Failed to delete job:", res.message);
    } else {
      toast.success("Job deleted");
      router.refresh();
    }
    // Success - close dialog and refresh page
    onOpenChange(false);
  }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this job?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will remove the job from your
            project list and invoices will keep their history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDelete}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
