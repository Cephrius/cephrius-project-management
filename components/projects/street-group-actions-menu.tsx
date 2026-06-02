"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProjects } from "@/app/(jobsyte-app)/projects/actions";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";
import type { LookupItem } from "@/components/projects/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StreetGroupActionsMenuProps = {
  builders: LookupItem[];
  subdivisions: LookupItem[];
  builderId?: string;
  subdivisionId?: string;
  streetAddress: string;
  streetLabel: string;
  projectIds: string[];
};

export function StreetGroupActionsMenu({
  builders,
  subdivisions,
  builderId,
  subdivisionId,
  streetAddress,
  streetLabel,
  projectIds,
}: StreetGroupActionsMenuProps) {
  const router = useRouter();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const count = projectIds.length;
  const projectWord = count === 1 ? "project" : "projects";

  async function onDeleteStreet() {
    if (count === 0) return;

    setIsDeleting(true);
    const result = await deleteProjects(projectIds);

    if (!result.ok) {
      toast.error(result.message ?? `Failed to delete ${projectWord}.`);
      setIsDeleting(false);
      return;
    }

    toast.success(
      `Deleted ${result.deletedCount ?? count} ${
        (result.deletedCount ?? count) === 1 ? "project" : "projects"
      }.`,
    );

    setDeleteOpen(false);
    setIsDeleting(false);
    router.refresh();
  }

  return (
    <>
      {/* The street row already has one primary click target for expanding.
          This menu keeps secondary actions discoverable without stretching the row. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2 sm:w-auto"
            aria-label={`Actions for ${streetLabel}`}
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
            <span className="sm:hidden">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(event) => event.stopPropagation()}
          className="w-44"
        >
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              setNewProjectOpen(true);
            }}
          >
            <Plus className="size-4" />
            New Project
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onSelect={(event) => {
              event.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="size-4" />
            Delete Street
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewProjectDialog
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        initialBuilders={builders}
        initialSubdivisions={subdivisions}
        initialBuilderId={builderId}
        initialSubdivisionId={subdivisionId}
        initialStreetAddress={streetAddress}
      />

      {/* The delete flow still deletes the exact project ids from this street grouping;
          moving it into a menu changes the entry point, not the deletion scope. */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onClick={(event) => event.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this street and all of its projects?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes <strong>{count}</strong> {projectWord} in{" "}
              <strong>{streetLabel}</strong> along with every job under{" "}
              {count === 1 ? "it" : "them"}. Existing invoices will keep showing
              this data from their snapshot, but the {projectWord} will no longer
              appear anywhere else (dashboard, accounting, payroll, search).
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              variant="destructive"
              disabled={isDeleting}
              onClick={onDeleteStreet}
            >
              {isDeleting
                ? "Deleting..."
                : `Delete ${count} ${projectWord}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
