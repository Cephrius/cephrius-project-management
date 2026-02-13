import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/notifications/send-email";
import {
  buildInvoiceReminderEmail,
  buildProductUpdatesEmail,
  buildWeeklySummaryEmail,
} from "@/lib/notifications/templates";
import {
  clampDueDays,
  readPreferenceSettings,
  type PreferenceSettings,
  withUpdatedPreferenceSettings,
} from "@/lib/settings/preferences";

type AdminUser = {
  id: string;
  email?: string | null;
  user_metadata?: unknown;
};

type DueInvoice = {
  invoice_number: string | null;
  due_date: string | null;
  subtotal_cents: number | null;
  bill_to_name: string | null;
};

export const runtime = "nodejs";

function toYmdUtc(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return toYmdUtc(date);
}

function getWeekStartMondayYmd(ymd: string): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay(); // 0 sunday
  const daysFromMonday = (dayOfWeek + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysFromMonday);
  return toYmdUtc(date);
}

function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function money(cents: number): string {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function isAuthorized(request: NextRequest): {
  ok: boolean;
  reason?: string;
} {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return { ok: false, reason: "Missing CRON_SECRET configuration." };
  }

  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const querySecret = request.nextUrl.searchParams.get("secret");

  if (authorization === `Bearer ${secret}`) return { ok: true };
  if (headerSecret === secret) return { ok: true };
  if (querySecret === secret) return { ok: true };

  return { ok: false, reason: "Unauthorized cron request." };
}

async function listAllUsers(): Promise<AdminUser[]> {
  const admin = createAdminClient();
  const perPage = 200;
  const users: AdminUser[] = [];
  let page = 1;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(error.message);
    }

    const batch = (data?.users ?? []) as AdminUser[];
    users.push(...batch);

    if (batch.length < perPage) break;
    page += 1;
  }

  return users;
}

export async function GET(request: NextRequest) {
  const auth = isAuthorized(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, message: auth.reason },
      { status: auth.reason?.includes("Unauthorized") ? 401 : 500 },
    );
  }

  let users: AdminUser[] = [];
  try {
    users = await listAllUsers();
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to list users.",
      },
      { status: 500 },
    );
  }

  const mode = request.nextUrl.searchParams.get("mode") ?? "auto";
  const force = request.nextUrl.searchParams.get("force") === "1";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    request.nextUrl.origin;

  const now = new Date();
  const todayYmd = toYmdUtc(now);
  const todayWeekdayUtc = now.getUTCDay(); // 0 sunday, 1 monday
  const currentMonthKey = toMonthKey(now);

  const remindersLeadDays = clampDueDays(
    process.env.INVOICE_REMINDER_LEAD_DAYS ?? 3,
    3,
  );
  const reminderLeadYmd = shiftYmd(todayYmd, remindersLeadDays);
  const reminderOldestYmd = shiftYmd(todayYmd, -30);

  const weeklyWindowEnd = shiftYmd(todayYmd, -1);
  const weeklyWindowStart = shiftYmd(todayYmd, -7);
  const weeklyWindowKey = getWeekStartMondayYmd(weeklyWindowStart);
  const weeklyWindowStartIso = `${weeklyWindowStart}T00:00:00.000Z`;
  const weeklyWindowEndIso = `${weeklyWindowEnd}T23:59:59.999Z`;

  const runInvoiceReminders =
    mode === "auto" || mode === "all" || mode === "reminders";
  const runWeeklySummaries = mode === "auto" || mode === "all" || mode === "weekly";
  const runProductUpdates =
    mode === "auto" || mode === "all" || mode === "product-updates";

  const admin = createAdminClient();

  const result = {
    ok: true,
    mode,
    users_scanned: users.length,
    reminders_sent: 0,
    weekly_summaries_sent: 0,
    product_updates_sent: 0,
    skipped_no_email: 0,
    skipped_disabled: 0,
    metadata_updates: 0,
    errors: [] as Array<{ user_id: string; scope: string; message: string }>,
  };

  for (const user of users) {
    const userId = user.id;
    const email = (user.email ?? "").trim().toLowerCase();
    const settings = readPreferenceSettings(user.user_metadata);
    const metadataPatch: Partial<PreferenceSettings> = {};

    if (!email) {
      result.skipped_no_email += 1;
      continue;
    }

    if (runInvoiceReminders && settings.email_invoice_reminders) {
      const reminderAlreadySentToday =
        settings.invoice_reminder_last_sent_on === todayYmd;
      if (!reminderAlreadySentToday || force) {
        const { data: dueInvoices, error: dueInvoicesError } = await admin
          .from("invoices")
          .select("invoice_number, due_date, subtotal_cents, bill_to_name")
          .eq("user_id", userId)
          .is("deleted_at", null)
          .not("due_date", "is", null)
          .gte("due_date", reminderOldestYmd)
          .lte("due_date", reminderLeadYmd)
          .order("due_date", { ascending: true })
          .limit(30);

        if (dueInvoicesError) {
          result.errors.push({
            user_id: userId,
            scope: "invoice-reminders",
            message: dueInvoicesError.message,
          });
        } else {
          const invoices = (dueInvoices ?? []) as DueInvoice[];
          const relevantInvoices = invoices.filter((invoice) => invoice.due_date);
          const overdue = relevantInvoices.filter(
            (invoice) => (invoice.due_date as string) < todayYmd,
          );
          const dueSoon = relevantInvoices.filter(
            (invoice) => (invoice.due_date as string) >= todayYmd,
          );

          if (overdue.length + dueSoon.length > 0) {
            const reminderItems = [
              ...overdue.map((invoice) => ({
                invoiceLabel: (invoice.invoice_number ?? "Invoice").trim(),
                billTo: (invoice.bill_to_name ?? "Unknown Builder").trim(),
                dueDate: invoice.due_date ?? "N/A",
                total: money(invoice.subtotal_cents ?? 0),
                status: "overdue" as const,
              })),
              ...dueSoon.map((invoice) => ({
                invoiceLabel: (invoice.invoice_number ?? "Invoice").trim(),
                billTo: (invoice.bill_to_name ?? "Unknown Builder").trim(),
                dueDate: invoice.due_date ?? "N/A",
                total: money(invoice.subtotal_cents ?? 0),
                status: "due-soon" as const,
              })),
            ];
            const template = buildInvoiceReminderEmail({
              overdueCount: overdue.length,
              dueSoonCount: dueSoon.length,
              invoices: reminderItems,
              appUrl,
              asOfYmd: todayYmd,
            });
            const sendRes = await sendEmail({
              to: email,
              subject: template.subject,
              html: template.html,
            });

            if (sendRes.ok) {
              metadataPatch.invoice_reminder_last_sent_on = todayYmd;
              result.reminders_sent += 1;
            } else if (!sendRes.skipped) {
              result.errors.push({
                user_id: userId,
                scope: "invoice-reminders",
                message: sendRes.message ?? "Failed to send reminder email.",
              });
            }
          }
        }
      }
    } else if (runInvoiceReminders) {
      result.skipped_disabled += 1;
    }

    if (runWeeklySummaries && settings.weekly_summary) {
      const shouldRunWeekly = force || mode === "weekly" || todayWeekdayUtc === 1;
      const alreadySentForWindow =
        settings.weekly_summary_last_sent_on === weeklyWindowKey;

      if (shouldRunWeekly && !alreadySentForWindow) {
        const { data: projects, error: projectsError } = await admin
          .from("projects")
          .select("id")
          .eq("user_id", userId)
          .is("deleted_at", null);

        if (projectsError) {
          result.errors.push({
            user_id: userId,
            scope: "weekly-summary",
            message: projectsError.message,
          });
        } else {
          const projectIds = (projects ?? []).map((project) => String(project.id));

          let jobsCreatedCount = 0;
          let jobsCompletedCount = 0;
          let openJobsCount = 0;

          if (projectIds.length > 0) {
            const [jobsCreatedRes, jobsCompletedRes, openJobsRes] =
              await Promise.all([
                admin
                  .from("jobs")
                  .select("id", { count: "exact", head: true })
                  .is("deleted_at", null)
                  .in("project_id", projectIds)
                  .gte("created_at", weeklyWindowStartIso)
                  .lte("created_at", weeklyWindowEndIso),
                admin
                  .from("jobs")
                  .select("id", { count: "exact", head: true })
                  .eq("is_completed", true)
                  .is("deleted_at", null)
                  .in("project_id", projectIds)
                  .gte("completed_at", weeklyWindowStartIso)
                  .lte("completed_at", weeklyWindowEndIso),
                admin
                  .from("jobs")
                  .select("id", { count: "exact", head: true })
                  .eq("is_completed", false)
                  .is("deleted_at", null)
                  .in("project_id", projectIds),
              ]);

            if (jobsCreatedRes.error || jobsCompletedRes.error || openJobsRes.error) {
              result.errors.push({
                user_id: userId,
                scope: "weekly-summary",
                message:
                  jobsCreatedRes.error?.message ??
                  jobsCompletedRes.error?.message ??
                  openJobsRes.error?.message ??
                  "Failed to load weekly job metrics.",
              });
            } else {
              jobsCreatedCount = jobsCreatedRes.count ?? 0;
              jobsCompletedCount = jobsCompletedRes.count ?? 0;
              openJobsCount = openJobsRes.count ?? 0;
            }
          }

          const { data: invoices, error: invoicesError } = await admin
            .from("invoices")
            .select("subtotal_cents")
            .eq("user_id", userId)
            .is("deleted_at", null)
            .gte("invoice_date", weeklyWindowStart)
            .lte("invoice_date", weeklyWindowEnd);

          const { count: overdueInvoicesCount, error: overdueError } = await admin
            .from("invoices")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .is("deleted_at", null)
            .not("due_date", "is", null)
            .lt("due_date", todayYmd);

          if (invoicesError || overdueError) {
            result.errors.push({
              user_id: userId,
              scope: "weekly-summary",
              message:
                invoicesError?.message ??
                overdueError?.message ??
                "Failed to load weekly invoice metrics.",
            });
          } else {
            const invoiceRows = (invoices ?? []) as Array<{
              subtotal_cents: number | null;
            }>;
            const invoicesIssuedCount = invoiceRows.length;
            const issuedTotalCents = invoiceRows.reduce(
              (sum, row) => sum + (row.subtotal_cents ?? 0),
              0,
            );

            const template = buildWeeklySummaryEmail({
              weekStart: weeklyWindowStart,
              weekEnd: weeklyWindowEnd,
              metrics: {
                jobsCreated: jobsCreatedCount,
                jobsCompleted: jobsCompletedCount,
                openJobs: openJobsCount,
                invoicesIssued: invoicesIssuedCount,
                totalInvoiced: money(issuedTotalCents),
                overdueInvoices: overdueInvoicesCount ?? 0,
              },
              appUrl,
            });
            const sendRes = await sendEmail({
              to: email,
              subject: template.subject,
              html: template.html,
            });

            if (sendRes.ok) {
              metadataPatch.weekly_summary_last_sent_on = weeklyWindowKey;
              result.weekly_summaries_sent += 1;
            } else if (!sendRes.skipped) {
              result.errors.push({
                user_id: userId,
                scope: "weekly-summary",
                message: sendRes.message ?? "Failed to send weekly summary email.",
              });
            }
          }
        }
      }
    } else if (runWeeklySummaries) {
      result.skipped_disabled += 1;
    }

    if (runProductUpdates && settings.product_updates) {
      const shouldRunProductUpdates =
        force || mode === "product-updates" || now.getUTCDate() === 1;
      const alreadySentThisMonth =
        settings.product_updates_last_sent_month === currentMonthKey;

      if (shouldRunProductUpdates && !alreadySentThisMonth) {
        const bullets = (
          process.env.PRODUCT_UPDATE_BULLETS ??
          "Performance improvements|Invoice workflow enhancements|Search and navigation refinements"
        )
          .split("|")
          .map((value) => value.trim())
          .filter(Boolean)
          .slice(0, 8);

        const template = buildProductUpdatesEmail({
          monthKey: currentMonthKey,
          bullets,
          appUrl,
        });
        const sendRes = await sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
        });

        if (sendRes.ok) {
          metadataPatch.product_updates_last_sent_month = currentMonthKey;
          result.product_updates_sent += 1;
        } else if (!sendRes.skipped) {
          result.errors.push({
            user_id: userId,
            scope: "product-updates",
            message: sendRes.message ?? "Failed to send product updates email.",
          });
        }
      }
    } else if (runProductUpdates) {
      result.skipped_disabled += 1;
    }

    if (Object.keys(metadataPatch).length > 0) {
      const nextUserMetadata = withUpdatedPreferenceSettings(
        user.user_metadata,
        metadataPatch,
      );

      const { error: metadataError } = await admin.auth.admin.updateUserById(userId, {
        user_metadata: nextUserMetadata,
      });

      if (metadataError) {
        result.errors.push({
          user_id: userId,
          scope: "metadata-update",
          message: metadataError.message,
        });
      } else {
        result.metadata_updates += 1;
      }
    }
  }

  return NextResponse.json(result, { status: 200 });
}
