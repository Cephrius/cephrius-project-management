"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import {
  Activity,
  Banknote,
  Briefcase,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { deleteCrew, deleteEmployee } from "@/app/(app)/employees/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { buildWorkforceDashboardModel } from "./dashboard-data";
import { EmployeeDialog } from "./employee-dialog";
import { CrewDialog } from "./crew-dialog";
import {
  WorkforceAnalyticsPanel,
  WorkforceQuickInsightsCard,
  WorkforceRecentActivityCard,
} from "./workforce-insights";
import {
  PAY_TYPE_LABELS,
  type CrewProfile,
  type EmployeeProfile,
  type WorkforceJob,
  type WorkforcePayment,
} from "./types";

export type { EmployeeProfile, CrewProfile };

type EmployeeFilterKey =
  | "all"
  | "active"
  | "inactive"
  | "unassigned"
  | "on_jobs";

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function compactMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

function formatDate(value: string | null) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function contactDisplay(employee: EmployeeProfile) {
  if (employee.email) return employee.email;
  if (employee.phone) return employee.phone;
  return employee.contact_info ?? "";
}

function payDisplay(employee: EmployeeProfile) {
  if (!employee.pay_type) return "Not set";
  if (employee.pay_type === "per_job") return PAY_TYPE_LABELS[employee.pay_type];
  if (employee.hourly_rate == null) return PAY_TYPE_LABELS[employee.pay_type];

  const suffix = employee.pay_type === "salary" ? "/yr" : "/hr";
  const value =
    employee.pay_type === "salary"
      ? employee.hourly_rate.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })
      : employee.hourly_rate.toFixed(2);
  return `${PAY_TYPE_LABELS[employee.pay_type]} · $${value}${suffix}`;
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge
      variant="outline"
      className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
    >
      Active
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  );
}

function WorkforceStatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="bg-primary/[0.035] ring-primary/15 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </div>
          <div className="flex size-9 items-center justify-center rounded-xl bg-background text-primary shadow-xs ring-1 ring-border">
            {icon}
          </div>
        </div>
        <div className="mt-3 text-3xl font-semibold tabular-nums">{value}</div>
        <div className="mt-2 text-sm text-muted-foreground">{detail}</div>
      </CardContent>
    </Card>
  );
}

export function EmployeesPageClient({
  employees,
  crews,
  jobs,
  payments,
}: {
  employees: EmployeeProfile[];
  crews: CrewProfile[];
  jobs: WorkforceJob[];
  payments: WorkforcePayment[];
}) {
  const [nowIso] = useState(() => new Date().toISOString());
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [crewDialogOpen, setCrewDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeProfile | null>(null);
  const [editingCrew, setEditingCrew] = useState<CrewProfile | null>(null);
  const [employeeQuery, setEmployeeQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<EmployeeFilterKey>("all");
  const [isPending, startTransition] = useTransition();
  const deferredEmployeeQuery = useDeferredValue(employeeQuery);

  const model = useMemo(
    () =>
      buildWorkforceDashboardModel({
        employees,
        crews,
        jobs,
        payments,
        now: nowIso,
      }),
    [crews, employees, jobs, nowIso, payments],
  );

  const crewById = useMemo(
    () => new Map(crews.map((crew) => [crew.id, crew])),
    [crews],
  );

  const recentEmployeeRows = useMemo(
    () =>
      model.recentEmployees
        .map((employee) =>
          model.employeeRoster.find((row) => row.employee.id === employee.id),
        )
        .filter((row): row is (typeof model.employeeRoster)[number] => Boolean(row)),
    [model],
  );

  const employeeFilterTabs = useMemo(
    () => [
      { key: "all", label: "All", count: model.employeeRoster.length },
      {
        key: "active",
        label: "Active",
        count: model.employeeRoster.filter((row) => row.employee.is_active).length,
      },
      {
        key: "inactive",
        label: "Inactive",
        count: model.employeeRoster.filter((row) => !row.employee.is_active).length,
      },
      {
        key: "unassigned",
        label: "Unassigned",
        count: model.employeeRoster.filter((row) => row.crewNames.length === 0).length,
      },
      {
        key: "on_jobs",
        label: "On Jobs",
        count: model.employeeRoster.filter((row) => row.activeJobs > 0).length,
      },
    ] as const,
    [model.employeeRoster],
  );

  const filteredEmployeeRows = useMemo(() => {
    const query = deferredEmployeeQuery.trim().toLowerCase();

    return model.employeeRoster.filter((row) => {
      if (employeeFilter === "active" && !row.employee.is_active) return false;
      if (employeeFilter === "inactive" && row.employee.is_active) return false;
      if (employeeFilter === "unassigned" && row.crewNames.length > 0) return false;
      if (employeeFilter === "on_jobs" && row.activeJobs === 0) return false;

      if (!query) return true;

      const haystack = [
        row.employee.name,
        row.employee.job_title ?? "",
        row.employee.role ?? "",
        row.employee.email ?? "",
        row.employee.phone ?? "",
        row.crewNames.join(" "),
        row.employee.pay_type ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredEmployeeQuery, employeeFilter, model.employeeRoster]);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <h1 className="text-2xl font-semibold text-primary">Employees &amp; Crews</h1>
          <p className="text-sm text-muted-foreground">
            A workforce dashboard for staffing coverage, crew health, payroll visibility,
            and employee operations in one place.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => {
              setEditingCrew(null);
              setCrewDialogOpen(true);
            }}
          >
            <Plus className="mr-1 size-4" />
            Add Crew
          </Button>
          <Button
            onClick={() => {
              setEditingEmployee(null);
              setEmployeeDialogOpen(true);
            }}
          >
            <Plus className="mr-1 size-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <WorkforceStatCard
          title="Total Employees"
          value={String(model.summary.totalEmployees)}
          detail={`${model.summary.activeEmployees} active · ${model.summary.inactiveEmployees} inactive`}
          icon={<Users className="size-4" />}
        />
        <WorkforceStatCard
          title="Crew Coverage"
          value={String(model.summary.assignedEmployees)}
          detail={`${model.summary.unassignedEmployees} unassigned · ${model.summary.activeCrews} active crews`}
          icon={<UserCheck className="size-4" />}
        />
        <WorkforceStatCard
          title="Recently Added"
          value={String(model.summary.recentEmployees)}
          detail="Employees added in the last 30 days"
          icon={<UserPlus className="size-4" />}
        />
        <WorkforceStatCard
          title="On Active Jobs"
          value={String(model.summary.employeesWithActiveJobs)}
          detail="Employees participating in open assigned work"
          icon={<Briefcase className="size-4" />}
        />
        <WorkforceStatCard
          title="Completed Work"
          value={String(model.summary.employeesWithCompletedJobs)}
          detail="Employees tied to completed assigned jobs"
          icon={<CheckCircle2 className="size-4" />}
        />
        <WorkforceStatCard
          title="Payroll Logged"
          value={money(model.summary.payrollLoggedCents)}
          detail={`${money(model.summary.employeePayrollLoggedCents)} direct employees · ${money(model.summary.crewPayrollLoggedCents)} crews`}
          icon={<Banknote className="size-4" />}
        />
        <WorkforceStatCard
          title="Avg Hourly Rate"
          value={
            model.summary.avgHourlyRate != null
              ? `$${model.summary.avgHourlyRate.toFixed(2)}`
              : "—"
          }
          detail={
            model.summary.avgSalary != null
              ? `Avg salary ${compactMoney(model.summary.avgSalary * 100)}/yr`
              : "No hourly or salary rates configured"
          }
          icon={<Clock3 className="size-4" />}
        />
        <WorkforceStatCard
          title="Workforce Activity"
          value={String(model.activity.length)}
          detail="Recent payroll, job completion, and hiring events surfaced"
          icon={<Activity className="size-4" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
        <WorkforceAnalyticsPanel model={model} />

        <div className="space-y-6">
          <WorkforceQuickInsightsCard
            alerts={model.alerts}
            recentEmployees={recentEmployeeRows}
          />
          <WorkforceRecentActivityCard activity={model.activity} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)]">
        <Card className="overflow-hidden ring-primary/15 shadow-none">
          <div className="border-b p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-base font-semibold">Employee Roster</div>
                <div className="text-sm text-muted-foreground">
                  Search, filter, and review employee role, crew, compensation, and workload at a glance.
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto">
                <InputGroup className="w-full sm:w-80">
                  <InputGroupAddon>
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    value={employeeQuery}
                    onChange={(event) => setEmployeeQuery(event.target.value)}
                    placeholder="Search employees, crews, roles..."
                  />
                </InputGroup>
                <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                  {employeeFilterTabs.map((tab) => {
                    const active = employeeFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setEmployeeFilter(tab.key)}
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
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/20 hover:bg-muted/20">
                  <TableHead className="h-11">Employee</TableHead>
                  <TableHead className="h-11">Crew</TableHead>
                  <TableHead className="h-11">Role</TableHead>
                  <TableHead className="h-11">Compensation</TableHead>
                  <TableHead className="h-11">Workload</TableHead>
                  <TableHead className="h-11">Status</TableHead>
                  <TableHead className="h-11 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredEmployeeRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No employees match the current search or filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployeeRows.map((row) => {
                    const { employee } = row;
                    const contact = contactDisplay(employee);
                    const secondaryRoleText =
                      !employee.job_title && employee.role
                        ? employee.role
                        : employee.job_title &&
                            employee.role &&
                            employee.role !== employee.job_title
                          ? employee.role
                          : `Added ${formatDate(employee.created_at)}`;

                    return (
                      <TableRow key={employee.id} className="align-top">
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <Avatar size="sm">
                              <AvatarFallback>
                                {employee.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium leading-tight">{employee.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {contact || "No contact details on file"}
                              </div>
                              {row.isRecentlyAdded && (
                                <Badge variant="secondary" className="mt-2">
                                  Added recently
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {row.crewNames.length === 0 ? (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          ) : (
                            <div className="space-y-1">
                              {row.crewNames.slice(0, 2).map((crewName) => (
                                <div key={crewName} className="text-sm font-medium">
                                  {crewName}
                                </div>
                              ))}
                              {row.crewNames.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{row.crewNames.length - 2} more crews
                                </div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {employee.job_title ?? employee.role ?? "Role pending"}
                          </div>
                          <div className="text-xs text-muted-foreground">{secondaryRoleText}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{payDisplay(employee)}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.directPayrollLoggedCents > 0
                              ? `${money(row.directPayrollLoggedCents)} direct payroll logged`
                              : "No direct payroll logged"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="font-medium tabular-nums">
                              {row.activeJobs} active · {row.completedJobs} completed
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {row.activeJobs > 0
                                ? "Currently assigned to open work"
                                : "No open assigned work"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge active={employee.is_active} />
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
                                  disabled={isPending}
                                >
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete employee?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove {employee.name} from your active workforce list.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isPending}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isPending}
                                    onClick={() => {
                                      startTransition(async () => {
                                        const result = await deleteEmployee(employee.id);
                                        if (!result.ok) {
                                          toast.error(
                                            result.message ?? "Failed to delete employee.",
                                          );
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="overflow-hidden ring-primary/15 shadow-none">
          <div className="border-b p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">Crew Overview</div>
                <div className="text-sm text-muted-foreground">
                  Review crew size, lead coverage, job load, and payroll activity.
                </div>
              </div>
              <Badge variant="outline">{model.summary.totalCrews} total crews</Badge>
            </div>
          </div>

          <div className="space-y-4 p-5">
            {model.crewOverview.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                No crews have been created yet.
              </div>
            ) : (
              model.crewOverview.map((crewRow) => {
                const crew = crewById.get(crewRow.id);
                if (!crew) return null;

                return (
                  <div key={crew.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-sm font-semibold">{crew.name}</div>
                          {crew.specialization && (
                            <Badge variant="outline">{crew.specialization}</Badge>
                          )}
                          <StatusBadge active={crew.is_active} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {crewRow.crewLeadName
                            ? `Lead: ${crewRow.crewLeadName}`
                            : "No crew lead assigned"}
                        </div>
                        {crew.description && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {crew.description}
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
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
                              disabled={isPending}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete crew?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove {crew.name} and its member assignments.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isPending}>
                                Cancel
                              </AlertDialogCancel>
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
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <div className="text-xs text-muted-foreground">Members</div>
                        <div className="mt-1 text-lg font-semibold tabular-nums">
                          {crewRow.members}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3">
                        <div className="text-xs text-muted-foreground">Active Jobs</div>
                        <div className="mt-1 text-lg font-semibold tabular-nums">
                          {crewRow.activeJobs}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3">
                        <div className="text-xs text-muted-foreground">Completed Jobs</div>
                        <div className="mt-1 text-lg font-semibold tabular-nums">
                          {crewRow.completedJobs}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3">
                        <div className="text-xs text-muted-foreground">Payroll Logged</div>
                        <div className="mt-1 text-lg font-semibold tabular-nums">
                          {crewRow.payrollLoggedCents > 0
                            ? money(crewRow.payrollLoggedCents)
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Crew Members
                      </div>
                      {crew.member_names.length === 0 ? (
                        <div className="mt-2 text-sm text-muted-foreground">
                          No employees assigned to this crew.
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {crew.member_names.slice(0, 5).map((name) => (
                            <Badge key={name} variant="secondary">
                              {name}
                            </Badge>
                          ))}
                          {crew.member_names.length > 5 && (
                            <Badge variant="outline">
                              +{crew.member_names.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
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
