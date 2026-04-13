"use client";

import {
  AlertTriangle,
  Banknote,
  Briefcase,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import type {
  WorkforceActivityItem,
  WorkforceAlertItem,
  WorkforceDashboardModel,
  WorkforceEmployeeRosterRow,
} from "./dashboard-data";

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function BreakdownList({
  title,
  description,
  items,
  valueSuffix,
}: {
  title: string;
  description: string;
  items: Array<{ key: string; label: string; count: number; pct: number }>;
  valueSuffix?: (key: string) => string | null;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="mb-4">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No data available yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="font-medium">{item.label}</div>
                  {valueSuffix?.(item.key) && (
                    <div className="text-xs text-muted-foreground">
                      {valueSuffix(item.key)}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <div className="font-semibold">{item.count}</div>
                  <div className="text-xs text-muted-foreground">{item.pct}%</div>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/75"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkforceAnalyticsPanel({
  model,
}: {
  model: WorkforceDashboardModel;
}) {
  const assignmentData = model.assignmentLoad.map((item) => ({
    ...item,
    shortLabel: item.label.length > 18 ? `${item.label.slice(0, 18)}...` : item.label,
  }));

  const crewCapacityData = model.crewOverview.slice(0, 6).map((item) => ({
    ...item,
    shortLabel: item.label.length > 18 ? `${item.label.slice(0, 18)}...` : item.label,
  }));

  return (
    <Card className="flex h-full flex-col overflow-hidden ring-primary/15 shadow-none">
      <CardHeader className="shrink-0 border-b">
        <CardTitle>Workforce Analytics</CardTitle>
        <CardDescription>
          A clearer view of staffing mix, current job coverage, and crew capacity.
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-4">
          <BreakdownList
            title="Employee Status"
            description="Track active versus inactive profiles."
            items={model.statusBreakdown}
          />
          <BreakdownList
            title="Employment Mix"
            description="See how your workforce is structured."
            items={model.employmentTypeBreakdown}
          />
          <BreakdownList
            title="Pay Structure"
            description="Quick compensation mix by pay setup."
            items={model.payTypeBreakdown}
            valueSuffix={(key) => {
              const row = model.payTypeBreakdown.find((item) => item.key === key);
              if (!row?.avgRate) return null;
              if (key === "salary") return `Avg ${money(row.avgRate * 100)}/yr`;
              if (key === "hourly") return `Avg $${row.avgRate.toFixed(2)}/hr`;
              return null;
            }}
          />
        </div>

        <div className="grid gap-4">
          <div className="rounded-xl border bg-background p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Assignment Load</div>
                <div className="text-xs text-muted-foreground">
                  Top employees and crews carrying current workload.
                </div>
              </div>
              <Badge variant="outline">{assignmentData.length} visible</Badge>
            </div>

            {assignmentData.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No assigned jobs are available yet.
              </div>
            ) : (
              <ChartContainer
                config={{
                  activeJobs: { label: "Active Jobs", color: "hsl(217 91% 60%)" },
                  completedJobs: { label: "Completed Jobs", color: "hsl(142 71% 45%)" },
                }}
                className="h-72 w-full aspect-auto"
              >
                <BarChart
                  data={assignmentData}
                  layout="vertical"
                  margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="shortLabel"
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => (
                          <div className="flex w-full items-center justify-between gap-3">


                            <span>{typeof name === "string" ? name : item.payload.label}</span>

                            <span className="font-mono tabular-nums">{Number(value)}</span>
                          </div>
                        )}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="activeJobs" fill="var(--color-activeJobs)" radius={6} />
                  <Bar dataKey="completedJobs" fill="var(--color-completedJobs)" radius={6} />
                </BarChart>
              </ChartContainer>
            )}
          </div>

          <div className="rounded-xl border bg-background p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Crew Capacity</div>
                <div className="text-xs text-muted-foreground">
                  Compare team size against active job demand.
                </div>
              </div>
              <Badge variant="outline">{model.summary.activeCrews} active crews</Badge>
            </div>

            {crewCapacityData.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Create a crew to start tracking capacity.
              </div>
            ) : (
              <ChartContainer
                config={{
                  members: { label: "Members", color: "hsl(215 20% 45%)" },
                  activeJobs: { label: "Active Jobs", color: "hsl(35 92% 55%)" },
                }}
                className="h-72 w-full aspect-auto"
              >
                <BarChart
                  data={crewCapacityData}
                  margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={34} />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span>{typeof name === "string" ? name : "Value"}</span>
                            <span className="font-mono tabular-nums">{Number(value)}</span>
                          </div>
                        )}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="members" fill="var(--color-members)" radius={6} />
                  <Bar dataKey="activeJobs" fill="var(--color-activeJobs)" radius={6} />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkforceQuickInsightsCard({
  alerts,
  recentEmployees,
}: {
  alerts: WorkforceAlertItem[];
  recentEmployees: WorkforceEmployeeRosterRow[];
}) {
  return (
    <Card className="overflow-hidden ring-primary/15 shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Quick Insights</CardTitle>
        <CardDescription>
          Immediate staffing signals and the most recent employee additions.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="size-4 text-amber-500" />
            Workforce Alerts
          </div>
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
              No immediate staffing issues surfaced from the current dataset.
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={
                    alert.tone === "warning"
                      ? "rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30"
                      : "rounded-xl border border-primary/15 bg-primary/[0.04] p-3"
                  }
                >
                  <div className="text-sm font-medium">{alert.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{alert.detail}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <UserPlus className="size-4 text-primary" />
            Recent Hires
          </div>
          {recentEmployees.length === 0 ? (
            <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
              No employees have been added in the last 30 days.
            </div>
          ) : (
            <div className="space-y-3">
              {recentEmployees.map((row) => (
                <div key={row.employee.id} className="flex items-start gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {row.employee.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">{row.employee.name}</div>
                      <Badge variant="secondary">New</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.employee.job_title ?? row.employee.role ?? "Role pending"} · Added{" "}
                      {formatDate(row.employee.created_at)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {row.crewNames.length > 0
                        ? row.crewNames.join(", ")
                        : "Not assigned to a crew yet"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function activityIcon(activity: WorkforceActivityItem) {
  if (activity.kind === "payroll_logged") {
    return <Banknote className="size-4 text-emerald-600" />;
  }
  if (activity.kind === "job_completed") {
    return <CheckCircle2 className="size-4 text-blue-600" />;
  }
  return <Briefcase className="size-4 text-primary" />;
}

export function WorkforceRecentActivityCard({
  activity,
}: {
  activity: WorkforceActivityItem[];
}) {
  return (
    <Card className="overflow-hidden ring-primary/15 shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest workforce updates across hiring, job completion, and payroll.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        {activity.length === 0 ? (
          <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
            No recent workforce activity is available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  {activityIcon(item)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(item.at)}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
