import Link from "next/link";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  FolderKanban,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { MonthJobsCalendar } from "@/components/dashboard/month-jobs-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ToggleJobCompleteButton } from "@/components/dashboard/toggle-job-complete-button";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";

type ProjectRow = {
  id: string;
  project_address: string;
};

type JobSummaryRow = {
  id: string;
  title: string;
  scheduled_completion: string | null;
  is_completed: boolean;
  project_id: string;
  superintendent: string | null;
  price_cents?: number | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  subtotal_cents: number;
};

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}
export const metadata = {
  robots: {
    index: false,
    follow: false,
  }
}
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const companyId = await getActiveCompanyId();
  if (!companyId) redirect("/login");

  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const weekStartDate = startOfWeek(now, { weekStartsOn: 0 });
  const weekEndDate = endOfWeek(now, { weekStartsOn: 0 });
  const weekStart = format(weekStartDate, "yyyy-MM-dd");
  const weekEnd = format(weekEndDate, "yyyy-MM-dd");

  const monthStartDate = startOfMonth(now);
  const monthEndDate = endOfMonth(now);
  const calendarEndDate = endOfMonth(addMonths(now, 12));
  const monthStart = format(monthStartDate, "yyyy-MM-dd");
  const monthEnd = format(monthEndDate, "yyyy-MM-dd");
  const calendarEnd = format(calendarEndDate, "yyyy-MM-dd");

  const [
    projectsRes,
    dueTodayRes,
    currentWeekJobsRes,
    monthJobsRes,
    openJobsCountRes,
    completedMonthCountRes,
    monthInvoicesRes,
    recentInvoicesRes,
    upcomingJobsRes,
  ] = await Promise.all([
    supabase.from("projects").select("id, project_address").eq("company_id", companyId).is("deleted_at", null),
    supabase
      .from("jobs")
      .select("id")
      .eq("company_id", companyId)
      .eq("is_completed", false)
      .is("deleted_at", null)
      .eq("scheduled_completion", today),
    supabase
      .from("jobs")
      .select("id")
      .eq("company_id", companyId)
      .eq("is_completed", false)
      .is("deleted_at", null)
      .gte("scheduled_completion", weekStart)
      .lte("scheduled_completion", weekEnd),
    supabase
      .from("jobs")
      .select(
        "id, title, scheduled_completion, is_completed, project_id, superintendent, price_cents",
      )
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .gte("scheduled_completion", monthStart)
      .lte("scheduled_completion", calendarEnd)
      .order("scheduled_completion", { ascending: true }),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("is_completed", false)
      .is("deleted_at", null),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("is_completed", true)
      .is("deleted_at", null)
      .gte("completed_at", `${monthStart}T00:00:00`)
      .lte("completed_at", `${monthEnd}T23:59:59.999`),
    supabase
      .from("invoices")
      .select("id, subtotal_cents")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .gte("invoice_date", monthStart)
      .lte("invoice_date", monthEnd),
    supabase
      .from("invoices")
      .select("id, invoice_number, invoice_date, subtotal_cents")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .is("deleted_at", null)
      .limit(5),
    supabase
      .from("jobs")
      .select("id, title, scheduled_completion, project_id, superintendent")
      .eq("company_id", companyId)
      .eq("is_completed", false)
      .is("deleted_at", null)
      .gte("scheduled_completion", weekStart)
      .lte("scheduled_completion", weekEnd)
      .order("scheduled_completion", { ascending: true }),
  ]);

  const firstError =
    projectsRes.error ??
    dueTodayRes.error ??
    currentWeekJobsRes.error ??
    monthJobsRes.error ??
    openJobsCountRes.error ??
    completedMonthCountRes.error ??
    monthInvoicesRes.error ??
    recentInvoicesRes.error ??
    upcomingJobsRes.error;

  if (firstError) {
    return (
      <div className="space-y-6">
        <BreadcrumbSetter crumbs={[{ label: "Dashboard", href: "/" }]} />
        <Card className="border-primary/20 p-6">
          <div className="text-sm text-muted-foreground">
            Failed to load dashboard: {firstError.message}
          </div>
        </Card>
      </div>
    );
  }

  const projects = (projectsRes.data ?? []) as ProjectRow[];
  const projectMap = new Map(projects.map((p) => [p.id, p.project_address]));

  const monthJobs = ((monthJobsRes.data ?? []) as JobSummaryRow[])
    .filter((j) => !!j.scheduled_completion)
    .map((j) => ({
      id: j.id,
      title: j.title,
      scheduled_completion: j.scheduled_completion!,
      is_completed: j.is_completed,
      superintendent: j.superintendent,
      project_address: projectMap.get(j.project_id) ?? "Unknown project",
    }));

  const dueTodayCount = (dueTodayRes.data ?? []).length;
  const currentWeekJobsCount = (currentWeekJobsRes.data ?? []).length;
  const openJobsCount = openJobsCountRes.count ?? 0;
  const completedThisMonth = completedMonthCountRes.count ?? 0;

  const monthInvoices = (monthInvoicesRes.data ?? []) as Array<{
    subtotal_cents: number | null;
  }>;
  const invoiceMonthCount = monthInvoices.length;
  const invoiceMonthTotal = monthInvoices.reduce(
    (sum, inv) => sum + (inv.subtotal_cents ?? 0),
    0,
  );

  const upcomingJobs = ((upcomingJobsRes.data ?? []) as JobSummaryRow[]).map(
    (j) => ({
      ...j,
      project_address: projectMap.get(j.project_id) ?? "Unknown project",
    }),
  );

  const recentInvoices = (recentInvoicesRes.data ?? []) as InvoiceRow[];
  const monthName = format(monthStartDate, "MMMM yyyy");

  // Derived stats for new widgets
  const completionRate =
    openJobsCount + completedThisMonth > 0
      ? Math.round(
        (completedThisMonth / (openJobsCount + completedThisMonth)) * 100,
      )
      : 0;

  const overdueJobs = upcomingJobs.filter((j) => {
    if (!j.scheduled_completion) return false;
    return j.scheduled_completion < today;
  });

  const highValueJobs = ((monthJobsRes.data ?? []) as JobSummaryRow[])
    .filter((j) => (j.price_cents ?? 0) > 0)
    .sort((a, b) => (b.price_cents ?? 0) - (a.price_cents ?? 0))
    .slice(0, 5);

  const totalPipelineValue = ((monthJobsRes.data ?? []) as JobSummaryRow[])
    .filter((j) => !j.is_completed)
    .reduce((sum, j) => sum + (j.price_cents ?? 0), 0);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <BreadcrumbSetter crumbs={[{ label: "Dashboard", href: "/" }]} />

      {/* ─── Page heading ─── */}
      <div className="shrink-0 pb-4">
        <h1 className="text-xl font-semibold text-primary">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Today&apos;s schedule, this week&apos;s pipeline, and billing at a
          glance.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════
          ROW 1 — KPI stat cards (fixed height, no scroll)
         ═══════════════════════════════════════════════ */}
      <div className="shrink-0 grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4 pb-4">
        {/* Schedule Focus */}
        <Card className="border-primary/20" size="sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <CalendarDays className="size-4 text-primary" />
              </div>
              <CardTitle className="text-xs font-medium text-primary/80">
                Schedule Focus
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums sm:text-3xl">
              {dueTodayCount}
            </div>
            <p className="text-xs text-muted-foreground">Jobs due today</p>
            <Separator className="my-3" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Clock className="size-3.5 text-muted-foreground" />
              <span>
                <span className="font-semibold">{currentWeekJobsCount}</span>{" "}
                incomplete this week
              </span>
            </div>
            <p className="mt-0.5 pl-5 text-[11px] text-muted-foreground">
              {format(weekStartDate, "MMM d")} –{" "}
              {format(weekEndDate, "MMM d")}
            </p>
          </CardContent>
        </Card>

        {/* Work Pipeline */}
        <Card className="border-primary/20" size="sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="size-4 text-primary" />
              </div>
              <CardTitle className="text-xs font-medium text-primary/80">
                Work Pipeline
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums sm:text-3xl">
              {openJobsCount}
            </div>
            <p className="text-xs text-muted-foreground">Open jobs</p>
            <Separator className="my-3" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
              <span>
                <span className="font-semibold">{completedThisMonth}</span>{" "}
                completed in {format(monthStartDate, "MMMM")}
              </span>
            </div>
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Completion rate</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="border-primary/20" size="sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <FolderKanban className="size-4 text-primary" />
              </div>
              <CardTitle className="text-xs font-medium text-primary/80">
                Active Projects
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums sm:text-3xl">
              {projects.length}
            </div>
            <p className="text-xs text-muted-foreground">Active projects</p>
            <Separator className="my-3" />
            {totalPipelineValue > 0 ? (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                <BarChart3 className="size-3.5 text-muted-foreground" />
                <span>
                  <span className="font-semibold">
                    {money(totalPipelineValue)}
                  </span>{" "}
                  pipeline value
                </span>
              </div>
            ) : (
              <Link href="/projects">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/30 hover:bg-primary/10"
                >
                  Open Projects
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Invoices this month */}
        <Card className="border-primary/20" size="sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="size-4 text-primary" />
              </div>
              <CardTitle className="text-xs font-medium text-primary/80">
                Invoices · {monthName}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums sm:text-3xl">
              {invoiceMonthCount}
            </div>
            <p className="text-xs text-muted-foreground">Invoices issued</p>
            <Separator className="my-3" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <DollarSign className="size-3.5 text-muted-foreground" />
              <span>
                Total:{" "}
                <span className="font-semibold">
                  {money(invoiceMonthTotal)}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════
          ROW 2 — Main content panels (fill remaining space, each scrolls internally)
         ═══════════════════════════════════════════════ */}
      <div className="min-h-0 flex-1 grid gap-4 xl:grid-cols-[2fr_1fr] xl:grid-rows-[1fr]">
        {/* Left column — Calendar + Invoices/High-Value stacked, scrolls internally */}
        <div className="min-h-0 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Jobs Calendar */}
          <Card className="border-primary/20 shrink-0">
            <CardHeader>
              <CardTitle className="text-primary">
                Jobs Calendar · Next 12 Months
              </CardTitle>
              <CardDescription>
                Browse future months to view scheduled jobs, then select a date
                for details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthJobsCalendar
                jobs={monthJobs}
                monthStart={monthStart}
                calendarEnd={calendarEnd}
              />
            </CardContent>
          </Card>

          {/* Recent Invoices + High-Value Jobs side by side */}
          <div className="grid gap-4 shrink-0 lg:grid-cols-2">
            {/* Recent Invoices */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">
                  Recent Invoices
                </CardTitle>
                <CardDescription>
                  Most recently created invoices.
                </CardDescription>
                <CardAction>
                  <Link href="/invoices">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      View All
                    </Button>
                  </Link>
                </CardAction>
              </CardHeader>
              <CardContent>
                {recentInvoices.length === 0 ? (
                  <div className="rounded-md border p-3 text-center text-sm text-muted-foreground">
                    No invoices yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentInvoices.map((invoice) => (
                      <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                        <div className="flex items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/3 p-3 transition hover:bg-primary/10 dark:bg-primary/7 dark:hover:bg-primary/13">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {invoice.invoice_number}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {invoice.invoice_date}
                            </div>
                          </div>
                          <div className="shrink-0 text-sm font-semibold tabular-nums">
                            {money(invoice.subtotal_cents)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* High-Value Jobs */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="size-4 text-green-600 dark:text-green-400" />
                  <CardTitle className="text-primary">
                    Top Jobs by Value
                  </CardTitle>
                </div>
                <CardDescription>
                  Highest-priced jobs this period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {highValueJobs.length === 0 ? (
                  <div className="rounded-md border p-3 text-center text-sm text-muted-foreground">
                    No priced jobs found. Add prices to jobs to see them here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {highValueJobs.map((job, idx) => (
                      <div
                        key={job.id}
                        className="flex items-center gap-3 rounded-md border border-primary/20 bg-primary/3 p-3 dark:bg-primary/7"
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {job.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {projectMap.get(job.project_id) ?? "Unknown project"}
                          </div>
                        </div>
                        <div className="shrink-0 text-sm font-semibold tabular-nums text-green-700 dark:text-green-400">
                          {money(job.price_cents ?? 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions + Snapshot + Ideas */}
          <div className="grid gap-4 shrink-0 sm:grid-cols-2 xl:grid-cols-3">
            {/* Quick Actions */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/projects">
                    <Button
                      variant="outline"
                      className="h-auto w-full flex-col gap-1 border-primary/20 py-3 hover:bg-primary/10"
                    >
                      <FolderKanban className="size-5 text-primary" />
                      <span className="text-xs">New Project</span>
                    </Button>
                  </Link>
                  <Link href="/invoices">
                    <Button
                      variant="outline"
                      className="h-auto w-full flex-col gap-1 border-primary/20 py-3 hover:bg-primary/10"
                    >
                      <DollarSign className="size-5 text-primary" />
                      <span className="text-xs">New Invoice</span>
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button
                      variant="outline"
                      className="h-auto w-full flex-col gap-1 border-primary/20 py-3 hover:bg-primary/10"
                    >
                      <BarChart3 className="size-5 text-primary" />
                      <span className="text-xs">Search</span>
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button
                      variant="outline"
                      className="h-auto w-full flex-col gap-1 border-primary/20 py-3 hover:bg-primary/10"
                    >
                      <CheckCircle2 className="size-5 text-primary" />
                      <span className="text-xs">Settings</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Snapshot */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">
                  {format(monthStartDate, "MMMM")} Snapshot
                </CardTitle>
                <CardDescription>At a glance for this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Jobs completed
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {completedThisMonth}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Invoices issued
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {invoiceMonthCount}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Revenue billed
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {money(invoiceMonthTotal)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Completion rate
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {completionRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ideas placeholder */}
            <Card className="border-dashed border-primary/20">
              <CardHeader>
                <CardTitle className="text-muted-foreground">
                  💡 Widget Ideas
                </CardTitle>

              </CardHeader>
              <CardContent>
                Future Notifications panel: upcoming deadlines, expiring documents, etc.
                <br />
                Project health indicators based on job completion rates and delays.
                <br />
                Revenue forecasts based on open jobs and historical conversion rates.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column — Jobs this week + Overdue */}
        <div className="min-h-0 flex flex-col gap-4">
          {/* Overdue alert */}
          {overdueJobs.length > 0 && (
            <Card className="border-destructive/30 bg-destructive/5 shrink-0" size="sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-destructive" />
                  <CardTitle className="text-destructive">
                    Overdue Jobs
                  </CardTitle>
                </div>
                <CardDescription>
                  {overdueJobs.length} job{overdueJobs.length === 1 ? "" : "s"}{" "}
                  past scheduled date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueJobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-start justify-between gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-2 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{job.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Due: {job.scheduled_completion}
                        </div>
                      </div>
                      <Badge variant="destructive" className="shrink-0 text-[10px]">
                        Overdue
                      </Badge>
                    </div>
                  ))}
                  {overdueJobs.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{overdueJobs.length - 3} more
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Jobs This Week */}
          <Card className="border-primary/20 min-h-0 flex flex-1 flex-col max-h-[60vh] xl:max-h-none mb-20 md:mb-0">
            <CardHeader className="shrink-0">
              <div className="flex items-center justify-between ">
                <div>
                  <CardTitle className="text-primary">
                    Jobs This Week
                  </CardTitle>
                  <CardDescription>
                    Incomplete jobs scheduled for this week.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10"
                >
                  {upcomingJobs.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-y-auto pr-1">
              {upcomingJobs.length === 0 ? (
                <div className="rounded-md border p-3 text-center text-sm text-muted-foreground">
                  No incomplete jobs this week 🎉
                </div>
              ) : (
                <div className="space-y-2 pr-1 ">
                  {upcomingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-md border border-primary/20 bg-primary/3 p-3 dark:bg-primary/7"
                    >
                      <div className="text-sm font-medium wrap-break-word">
                        {job.title}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {job.scheduled_completion}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {job.project_address}
                      </div>
                      {job.superintendent && (
                        <div className="text-xs text-muted-foreground wrap-break-word">
                          Supt / GC: {job.superintendent}
                        </div>
                      )}
                      <ToggleJobCompleteButton jobId={job.id} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
