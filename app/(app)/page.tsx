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
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { MonthJobsCalendar } from "@/components/dashboard/month-jobs-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

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

export default async function AppHome() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

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
    supabase.from("projects").select("id, project_address"),
    supabase
      .from("jobs")
      .select("id")
      .eq("is_completed", false)
      .is("deleted_at", null)
      .eq("scheduled_completion", today),
    supabase
      .from("jobs")
      .select("id")
      .eq("is_completed", false)
      .is("deleted_at", null)
      .gte("scheduled_completion", weekStart)
      .lte("scheduled_completion", weekEnd),
    supabase
      .from("jobs")
      .select(
        "id, title, scheduled_completion, is_completed, project_id, superintendent, price_cents",
      )
      .is("deleted_at", null)
      .gte("scheduled_completion", monthStart)
      .lte("scheduled_completion", calendarEnd)
      .order("scheduled_completion", { ascending: true }),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("is_completed", false)
      .is("deleted_at", null),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("is_completed", true)
      .is("deleted_at", null)
      .gte("completed_at", `${monthStart}T00:00:00`)
      .lte("completed_at", `${monthEnd}T23:59:59.999`),
    supabase
      .from("invoices")
      .select("id, subtotal_cents")
      .gte("invoice_date", monthStart)
      .lte("invoice_date", monthEnd),
    supabase
      .from("invoices")
      .select("id, invoice_number, invoice_date, subtotal_cents")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("jobs")
      .select("id, title, scheduled_completion, project_id, superintendent")
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
        <Card className="p-6">
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

  return (
    <div className="space-y-6">
      <BreadcrumbSetter crumbs={[{ label: "Dashboard", href: "/" }]} />

      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Today&apos;s schedule, this week&apos;s pipeline, and billing at a
          glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Schedule Focus</div>
          <div className="mt-2 text-3xl font-semibold">{dueTodayCount}</div>
          <div className="text-xs text-muted-foreground">Jobs due today</div>
          <div className="mt-3 text-sm">
            <span className="font-medium">{currentWeekJobsCount}</span>{" "}
            incomplete this week ({format(weekStartDate, "MMM d")} -{" "}
            {format(weekEndDate, "MMM d")})
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Work Pipeline</div>
          <div className="mt-2 text-3xl font-semibold">{openJobsCount}</div>
          <div className="text-xs text-muted-foreground">Open Jobs</div>
          <div className="mt-3 text-sm">
            <span className="font-medium">{completedThisMonth}</span> Completed
            in {format(monthStartDate, "MMMM")}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Projects</div>
          <div className="mt-2 text-3xl font-semibold">{projects.length}</div>
          <div className="text-xs text-muted-foreground">Active Projects</div>
          <div className="mt-3">
            <Link href="/projects">
              <Button variant="outline" size="sm">
                Open Projects
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Invoices ({monthName})
          </div>
          <div className="mt-2 text-3xl font-semibold">{invoiceMonthCount}</div>
          <div className="text-xs text-muted-foreground">Invoices Issued</div>
          <div className="mt-3 text-sm font-medium">
            Total Amount Issued: {money(invoiceMonthTotal)}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-4 sm:p-6">
          <div className="mb-4">
            <div className="text-sm font-semibold">
              Jobs Calendar (Next 12 Months)
            </div>
            <div className="text-xs text-muted-foreground">
              Browse future months to view scheduled jobs, then select a date
              for details.
            </div>
          </div>
          <MonthJobsCalendar
            jobs={monthJobs}
            monthStart={monthStart}
            calendarEnd={calendarEnd}
          />
        </Card>
        {/* WEEKS UPCOMING JOBS */}
        <Card className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Jobs This Week</div>
              <div className="text-xs text-muted-foreground">
                All incomplete jobs scheduled for this week.
              </div>
            </div>
            <Badge variant="secondary">{upcomingJobs.length}</Badge>
          </div>

          {upcomingJobs.length === 0 ? (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              No incomplete jobs scheduled for this week.
            </div>
          ) : (
            <div
              className={
                upcomingJobs.length >= 4
                  ? "space-y-2 max-h-[22rem] overflow-y-auto pr-1"
                  : "space-y-2"
              }
            >
              {upcomingJobs.map((job) => (
                <div key={job.id} className="rounded-md border p-3">
                  <div className="text-sm font-medium">{job.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {job.scheduled_completion} - {job.project_address}
                  </div>
                  {job.superintendent && (
                    <div className="text-xs text-muted-foreground">
                      Superintendent / GC: {job.superintendent}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Recent Invoices</div>
            <div className="text-xs text-muted-foreground">
              Most recently created invoices.
            </div>
          </div>
          <Link href="/invoices">
            <Button size="sm" variant="outline">
              View All
            </Button>
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            No invoices yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentInvoices.map((invoice) => (
              <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                <div className="rounded-md border p-3 transition hover:bg-muted/40">
                  <div className="text-sm font-medium">
                    {invoice.invoice_number}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Date: {invoice.invoice_date}
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {money(invoice.subtotal_cents)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
