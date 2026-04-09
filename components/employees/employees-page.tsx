"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { Plus, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createCrew,
  createEmployee,
  deleteCrew,
  deleteEmployee,
  updateCrew,
  updateEmployee,
} from "@/app/(app)/employees/actions";
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

export type EmployeeProfile = {
  id: string;
  name: string;
  contact_info: string | null;
  role: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type CrewProfile = {
  id: string;
  name: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  member_ids: string[];
  member_names: string[];
};

function EmployeeDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  initial?: EmployeeProfile | null;
}) 


{
  const isEditing = Boolean(initial);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initial?.name ?? "");
  const [contactInfo, setContactInfo] = useState(initial?.contact_info ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

    useEffect(() => {
    if(!open) return;

    setName(initial?.name ?? "");
    setContactInfo(initial?.contact_info ?? "");
    setRole(initial?.role ?? "");
    setNotes(initial?.notes ?? "");
    setIsActive(initial?.is_active ?? true);
  }, [open, initial]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Employee" : "New Employee"}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const fd = new FormData();
            if (initial?.id) fd.set("employee_id", initial.id);
            fd.set("name", name);
            fd.set("contact_info", contactInfo);
            fd.set("role", role);
            fd.set("notes", notes);
            fd.set("is_active", String(isActive));

            startTransition(async () => {
              const result = isEditing
                ? await updateEmployee(fd)
                : await createEmployee(fd);

              if (!result.ok) {
                toast.error(result.message ?? "Failed to save employee.");
                return;
              }

              toast.success(isEditing ? "Employee updated." : "Employee created.");
              onOpenChange(false);
            });
          }}
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Contact Info</Label>
            <Input
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Phone, email, or both"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Framer, Painter, Electrician..." />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(Boolean(checked))} />
            Active
          </label>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CrewDialog({
  open,
  onOpenChange,
  employees,
  initial,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  employees: EmployeeProfile[];
  initial?: CrewProfile | null;
}) {
  const isEditing = Boolean(initial);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initial?.name ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [memberIds, setMemberIds] = useState<string[]>(initial?.member_ids ?? []);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.is_active),
    [employees],
  );

  useEffect(() => {
    if(!open) return;

    setName(initial?.name ?? "");
    setNotes(initial?.notes ?? "");
    setIsActive(initial?.is_active ?? true);
    setMemberIds(initial?.member_ids ?? []);
  }, [open, initial]);

  function toggleMember(employeeId: string) {
    setMemberIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId],
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Crew" : "New Crew"}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const fd = new FormData();
            if (initial?.id) fd.set("crew_id", initial.id);
            fd.set("name", name);
            fd.set("notes", notes);
            fd.set("is_active", String(isActive));
            memberIds.forEach((memberId) => fd.append("member_ids", memberId));

            startTransition(async () => {
              const result = isEditing
                ? await updateCrew(fd)
                : await createCrew(fd);

              if (!result.ok) {
                toast.error(result.message ?? "Failed to save crew.");
                return;
              }

              toast.success(isEditing ? "Crew updated." : "Crew created.");
              onOpenChange(false);
            });
          }}
        >
          <div className="space-y-2">
            <Label>Crew Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(Boolean(checked))} />
            Active
          </label>

          <div className="space-y-2">
            <Label>Assign Employees</Label>
            <div className="max-h-52 overflow-y-auto rounded-md border p-2 space-y-1">
              {activeEmployees.length === 0 ? (
                <p className="p-2 text-sm text-muted-foreground">No active employees available.</p>
              ) : (
                activeEmployees.map((employee) => (
                  <label key={employee.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50">
                    <Checkbox
                      checked={memberIds.includes(employee.id)}
                      onCheckedChange={() => toggleMember(employee.id)}
                    />
                    <span>{employee.name}</span>
                    {employee.role && <span className="text-xs text-muted-foreground">• {employee.role}</span>}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EmployeesPageClient({
  employees,
  crews,
}: {
  employees: EmployeeProfile[];
  crews: CrewProfile[];
}) {
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [crewDialogOpen, setCrewDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeProfile | null>(null);
  const [editingCrew, setEditingCrew] = useState<CrewProfile | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Employees & Crews</h1>
        <p className="text-sm text-muted-foreground">
          Manage workforce profiles and teams used for job assignments and payroll.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <div className="text-sm font-semibold">Employees</div>
              <div className="text-xs text-muted-foreground">{employees.length} total</div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingEmployee(null);
                setEmployeeDialogOpen(true);
              }}
            >
              <User className="mr-1 size-4" />
              Add Employee
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-xs text-muted-foreground">{employee.contact_info ?? "No contact"}</div>
                    </TableCell>
                    <TableCell>{employee.role ?? "—"}</TableCell>
                    <TableCell>
                      {employee.is_active ? (
                        <Badge variant="outline" className="border-green-300 bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingEmployee(employee);
                            setEmployeeDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                size="sm"
                                variant="destructive"
                                className="text-destructive hover:text-destructive"
                                disabled={isPending}
                                >
                                Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Delete employee?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove {employee.name} from your active employee list.
                                    This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isPending}
                                    onClick={() => {
                                    startTransition(async () => {
                                        const result = await deleteEmployee(employee.id);
                                        if (!result.ok) {
                                        toast.error(result.message ?? "Failed to delete employee.");
                                        return;
                                        }
                                        toast.success("Employee deleted.");
                                    });
                                    }}
                                >
                                    Confirm Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <div className="text-sm font-semibold">Crews</div>
              <div className="text-xs text-muted-foreground">{crews.length} total</div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingCrew(null);
                setCrewDialogOpen(true);
              }}
            >
              <Users className="mr-1 size-4" />
              Add Crew
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crews.map((crew) => (
                  <TableRow key={crew.id}>
                    <TableCell>
                      <div className="font-medium">{crew.name}</div>
                      <div className="text-xs text-muted-foreground">{crew.notes ?? "No notes"}</div>
                    </TableCell>
                    <TableCell>
                      {crew.member_names.length === 0
                        ? "No members"
                        : crew.member_names.join(", ")}
                    </TableCell>
                    <TableCell>
                      {crew.is_active ? (
                        <Badge variant="outline" className="border-green-300 bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCrew(crew);
                            setCrewDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-destructive hover:text-destructive"
                              disabled={isPending}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete crew?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove {crew.name} and its member assignment setup.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isPending}
                                onClick={() => {
                                  startTransition(async () => {
                                    const result = await deleteCrew(crew.id);
                                    if (!result.ok) {
                                      toast.error(result.message ?? "Failed to delete crew.");
                                      return;
                                    }
                                    toast.success("Crew deleted.");
                                  });
                                }}
                              >
                                Confirm Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <EmployeeDialog
        key={editingEmployee?.id ?? "new-employee"}
        open={employeeDialogOpen}
        onOpenChange={setEmployeeDialogOpen}
        initial={editingEmployee}
      />

      <CrewDialog
        key={editingCrew?.id ?? "new-crew"}
        open={crewDialogOpen}
        onOpenChange={setCrewDialogOpen}
        initial={editingCrew}
        employees={employees}
      />
    </div>
  );
}
