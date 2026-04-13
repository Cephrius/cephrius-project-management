"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ArrowLeft, Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PAY_TYPE_LABELS, type EmployeeProfile } from "./types";
import { EmployeeDialog } from "./employee-dialog";

type FilterKey = "all" | "active" | "inactive";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function payDisplay(employee: EmployeeProfile) {
  if (!employee.pay_type) return "Not set";
  if (employee.pay_type === "per_job") return PAY_TYPE_LABELS[employee.pay_type];
  if (employee.hourly_rate == null) return PAY_TYPE_LABELS[employee.pay_type];
  const suffix = employee.pay_type === "salary" ? "/yr" : "/hr";
  const value =
    employee.pay_type === "salary"
      ? employee.hourly_rate.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : employee.hourly_rate.toFixed(2);
  return `${PAY_TYPE_LABELS[employee.pay_type]} · $${value}${suffix}`;
}

function contactDisplay(employee: EmployeeProfile) {
  return employee.email ?? employee.phone ?? employee.contact_info ?? "—";
}

export function EmployeeRosterPageClient({
  employees,
}: {
  employees: EmployeeProfile[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const deferredQuery = useDeferredValue(query);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeProfile | null>(null);

  const filterTabs = useMemo(
    () => [
      { key: "all" as FilterKey, label: "All", count: employees.length },
      { key: "active" as FilterKey, label: "Active", count: employees.filter((e) => e.is_active).length },
      { key: "inactive" as FilterKey, label: "Inactive", count: employees.filter((e) => !e.is_active).length },
    ],
    [employees],
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return employees.filter((e) => {
      if (filter === "active" && !e.is_active) return false;
      if (filter === "inactive" && e.is_active) return false;
      if (!q) return true;
      return [e.name, e.job_title ?? "", e.role ?? "", e.email ?? "", e.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [deferredQuery, employees, filter]);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground" asChild>
            <Link href="/employees-crews">
              <ArrowLeft className="mr-1.5 size-4" />
              Back to Employees &amp; Crews
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-primary">Full Employee Roster</h1>
          <p className="text-sm text-muted-foreground">
            {employees.length} employee{employees.length === 1 ? "" : "s"} total
          </p>
        </div>
        <Button onClick={() => { setEditingEmployee(null); setDialogOpen(true); }}>
          <Plus className="mr-1.5 size-4" />
          Add Employee
        </Button>
      </div>

      <Card className="overflow-hidden shadow-none">
        <div className="border-b p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              {filterTabs.map((tab) => {
                const active = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{tab.label}</span>
                    <span className="text-xs tabular-nums">{tab.count}</span>
                  </button>
                );
              })}
            </div>

            <InputGroup className="w-full sm:w-72">
              <InputGroupAddon>
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, role, contact..."
              />
            </InputGroup>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/20 hover:bg-muted/20">
                <TableHead className="h-11">Employee</TableHead>
                <TableHead className="h-11">Contact</TableHead>
                <TableHead className="h-11">Role</TableHead>
                <TableHead className="h-11">Compensation</TableHead>
                <TableHead className="h-11">Hired</TableHead>
                <TableHead className="h-11">Status</TableHead>
                <TableHead className="h-11 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No employees match your search or filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback>
                            {employee.name
                              .split(" ")
                              .map((w) => w.charAt(0).toUpperCase())
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{employee.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {contactDisplay(employee)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {employee.job_title ?? employee.role ?? "—"}
                      </div>
                      {employee.job_title && employee.role && employee.role !== employee.job_title && (
                        <div className="text-xs text-muted-foreground">{employee.role}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{payDisplay(employee)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(employee.hire_date ?? employee.created_at)}
                    </TableCell>
                    <TableCell>
                      {employee.is_active ? (
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                     <Button
                    
                    onClick={() => { setEditingEmployee(employee); setDialogOpen(true); }}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editingEmployee}
      />
    </div>
  );
}
