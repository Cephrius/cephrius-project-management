"use client";

import { deleteProjects } from "@/app/(app)/projects/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type DeleteProjectsButtonProps = {
  projectIds: string[];
  groupLabel: string;
  /** "subdivision" | "street" — used in the confirmation copy. */
  groupKind: "subdivision" | "street";
  buttonLabel?: string;
  className?: string;
};

export function DeleteProjectsButton({
  projectIds,
  groupLabel,
  groupKind,
  buttonLabel,
  className,
}: DeleteProjectsButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const count = projectIds.length;
  const projectWord = count === 1 ? "project" : "projects";

  async function onDelete() {
    if (count === 0) return;
    setIsDeleting(true);
    const res = await deleteProjects(projectIds);

    if (!res.ok) {
      toast.error(res.message ?? `Failed to delete ${projectWord}.`);
      setIsDeleting(false);
      return;
    }
    toast.success(
      `Deleted ${res.deletedCount ?? count} ${
        (res.deletedCount ?? count) === 1 ? "project" : "projects"
      }.`,
    );
    router.refresh();
    setIsDeleting(false);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isDeleting || count === 0}
          aria-label={`Delete all projects in ${groupLabel}`}
          className={
            "gap-2 hover:bg-destructive hover:text-white cursor-pointer " +
            (className ?? "")
          }
          onClick={(event) => event.stopPropagation()}
        >
          <Trash2 className="size-4" />
          <span className="hidden sm:inline">
            {buttonLabel ?? `Delete ${groupKind === "subdivision" ? "Subdivision" : "Street"}`}
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete this {groupKind} and all of its projects?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes <strong>{count}</strong> {projectWord} in{" "}
            <strong>{groupLabel}</strong> along with every job under{" "}
            {count === 1 ? "it" : "them"}. Existing invoices will keep showing
            this data from their snapshot, but the {projectWord} will no longer
            appear anywhere else (dashboard, accounting, payroll, search).
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer"
            variant="destructive"
            disabled={isDeleting}
            onClick={onDelete}
          >
            {isDeleting
              ? "Deleting..."
              : `Delete ${count} ${projectWord}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
