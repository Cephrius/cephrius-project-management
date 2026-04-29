"use client";

// Onboarding: company switching updates `lib/company-context.ts`, which writes
// the active-company cookie consumed by `lib/active-company.ts` in server code.
import * as React from "react";
import { ChevronsUpDown, Plus, Check, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCompany, type Company } from "@/lib/company-context";
import { createCompany, deleteCompany } from "@/app/(jobsyte-app)/(app)/settings/company-actions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

function companyInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function CompanySwitcher() {
  const router = useRouter();
  const { companies, activeCompany, setActiveCompanyId } = useCompany();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newAddress, setNewAddress] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Company | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  async function onDeleteCompany() {
    if (!deleteTarget) return;

    setDeleting(true);
    const result = await deleteCompany(deleteTarget.id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(`"${deleteTarget.name}" deleted.`);
    setDeleteTarget(null);

    // Switch to a remaining company or redirect if none left
    if (result.fallbackCompanyId) {
      setActiveCompanyId(result.fallbackCompanyId);
    }
    router.refresh();
  }

  async function onCreateCompany() {
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    const result = await createCompany(name, newAddress, newPhone);
    setCreating(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(`"${name}" created.`);
    setDialogOpen(false);
    setNewName("");
    setNewAddress("");
    setNewPhone("");

    // Switch to the new company and refresh server data
    setActiveCompanyId(result.companyId);
    router.refresh();
  }

  function onSwitch(company: Company) {
    setActiveCompanyId(company.id);
    router.refresh(); // re-fetch server components with new company scope
  }

  if (!activeCompany) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-accent">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              {companyInitials(activeCompany.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {activeCompany.name}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {activeCompany.role}
              </div>
            </div>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64" align="start" sideOffset={4}>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Companies
          </DropdownMenuLabel>

          {companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => onSwitch(company)}
              className="gap-2 p-2 group/item"
            >
              <div className="flex size-6 items-center justify-center rounded-md border text-xs font-bold">
                {companyInitials(company.name)}
              </div>
              <span className="flex-1 truncate">{company.name}</span>
              {company.id === activeCompany.id && (
                <Check className="size-4 text-primary" />
              )}
              {company.role === "owner" && (
                <button
                  type="button"
                  className="size-6 flex items-center justify-center rounded-md opacity-0 group-hover/item:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(company);
                  }}
                  aria-label={`Delete ${company.name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          {/* Add Company button */}
          <DropdownMenuItem
            className="gap-2 p-2 delay-200"
            onClick={() => setDialogOpen(true)}
          >
            <div className="flex size-6 items-center  justify-center rounded-md border bg-transparent ">
              <Plus className="size-4" />
            </div>
            <span className="text-muted-foreground font-medium ">
              Add Company
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Company Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-company-name">Company Name</Label>
              <Input
                id="new-company-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Acme Construction LLC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-company-address">
                Address{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="new-company-address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="123 Main St, City, ST 12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-company-phone">
                Phone{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="new-company-phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={onCreateCompany}
              disabled={creating || !newName.trim()}
            >
              {creating ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Company Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>
              ? This will permanently delete all projects, jobs, and invoices
              associated with this company. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={onDeleteCompany}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Company"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
