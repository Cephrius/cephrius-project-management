import "server-only";

type EmailTemplate = {
  subject: string;
  html: string;
};

type ReminderInvoiceItem = {
  invoiceLabel: string;
  billTo: string;
  dueDate: string;
  total: string;
  status: "overdue" | "due-soon";
};

type WeeklySummaryMetrics = {
  jobsCreated: number;
  jobsCompleted: number;
  openJobs: number;
  invoicesIssued: number;
  totalInvoiced: string;
  overdueInvoices: number;
};

function formatMonthYearFromDate(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function parseYmd(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function parseYearMonth(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return new Date(Date.UTC(year, month - 1, 1));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderCard(label: string, value: string) {
  return `
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;min-width:160px;">
      <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">${escapeHtml(label)}</div>
      <div style="font-size:20px;font-weight:700;color:#111827;line-height:1.2;">${escapeHtml(value)}</div>
    </div>
  `;
}

function renderEmailLayout(input: {
  eyebrow: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  const safeHref = escapeHtml(input.ctaHref);
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:#eef2ff;border-bottom:1px solid #e5e7eb;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#4f46e5;">${escapeHtml(
                  input.eyebrow,
                )}</div>
                <div style="margin-top:10px;font-size:28px;font-weight:700;line-height:1.2;color:#111827;">${escapeHtml(
                  input.title,
                )}</div>
                <div style="margin-top:8px;font-size:14px;line-height:1.5;color:#4b5563;">${escapeHtml(
                  input.subtitle,
                )}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 24px;">
                ${input.bodyHtml}
                <div style="margin-top:22px;">
                  <a href="${safeHref}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;border-radius:10px;padding:11px 16px;">
                    ${escapeHtml(input.ctaLabel)}
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #e5e7eb;background:#f9fafb;">
                <div style="font-size:12px;line-height:1.5;color:#6b7280;">
                  JobSyte automated notification. Manage delivery preferences in Settings.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

export function buildInvoiceReminderEmail(input: {
  overdueCount: number;
  dueSoonCount: number;
  invoices: ReminderInvoiceItem[];
  appUrl: string;
  asOfYmd: string;
}): EmailTemplate {
  const summaryLabel = `${input.overdueCount} overdue, ${input.dueSoonCount} due soon`;
  const monthYearLabel = formatMonthYearFromDate(
    parseYmd(input.asOfYmd) ?? new Date(),
  );

  const tableRows = input.invoices
    .map((invoice) => {
      const statusColor = invoice.status === "overdue" ? "#b91c1c" : "#92400e";
      const statusLabel = invoice.status === "overdue" ? "Overdue" : "Due soon";
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">${escapeHtml(invoice.invoiceLabel)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">${escapeHtml(invoice.billTo)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">${escapeHtml(invoice.dueDate)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">${escapeHtml(invoice.total)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;font-weight:700;color:${statusColor};">${statusLabel}</td>
        </tr>
      `;
    })
    .join("");

  const body = `
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151;">
      You currently have ${escapeHtml(summaryLabel)}. Review the invoices below and follow up as needed.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <thead>
        <tr style="background:#f9fafb;">
          <th align="left" style="padding:10px 12px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Invoice</th>
          <th align="left" style="padding:10px 12px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Bill To</th>
          <th align="left" style="padding:10px 12px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Due Date</th>
          <th align="left" style="padding:10px 12px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Total</th>
          <th align="left" style="padding:10px 12px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Status</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `;

  return {
    subject: `JobSyte invoice reminder: ${summaryLabel}`,
    html: renderEmailLayout({
      eyebrow: "Invoices",
      title: "Invoice Reminder",
      subtitle: `Stay ahead of past-due and upcoming invoice deadlines for ${monthYearLabel}.`,
      bodyHtml: body,
      ctaLabel: "Open Invoices",
      ctaHref: `${input.appUrl}/invoices`,
    }),
  };
}

export function buildWeeklySummaryEmail(input: {
  weekStart: string;
  weekEnd: string;
  metrics: WeeklySummaryMetrics;
  appUrl: string;
}): EmailTemplate {
  const monthYearLabel = formatMonthYearFromDate(
    parseYmd(input.weekEnd) ?? new Date(),
  );
  const cards = [
    renderCard("Jobs Created", String(input.metrics.jobsCreated)),
    renderCard("Jobs Completed", String(input.metrics.jobsCompleted)),
    renderCard("Open Jobs", String(input.metrics.openJobs)),
    renderCard("Invoices Issued", String(input.metrics.invoicesIssued)),
    renderCard("Total Invoiced", input.metrics.totalInvoiced),
    renderCard("Overdue Invoices", String(input.metrics.overdueInvoices)),
  ].join("");

  const body = `
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151;">
      Reporting period: <strong>${escapeHtml(input.weekStart)}</strong> to <strong>${escapeHtml(
        input.weekEnd,
      )}</strong>.
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:10px;">
      ${cards}
    </div>
  `;

  return {
    subject: `JobSyte Weekly Summary (${input.weekStart} to ${input.weekEnd})`,
    html: renderEmailLayout({
      eyebrow: "Weekly Summary",
      title: "Your Weekly Job Snapshot",
      subtitle: `A clear view of work pipeline and invoice performance for ${monthYearLabel}.`,
      bodyHtml: body,
      ctaLabel: "Open Dashboard",
      ctaHref: `${input.appUrl}/`,
    }),
  };
}

export function buildProductUpdatesEmail(input: {
  monthKey: string;
  bullets: string[];
  appUrl: string;
}): EmailTemplate {
  const monthYearLabel = formatMonthYearFromDate(
    parseYearMonth(input.monthKey) ?? new Date(),
  );
  const bulletItems = input.bullets
    .map((bullet) => `<li style="margin:0 0 8px 0;">${escapeHtml(bullet)}</li>`)
    .join("");

  const body = `
    <p style="margin:0 0 14px 0;font-size:14px;line-height:1.6;color:#374151;">
      Here are the latest improvements we shipped in ${escapeHtml(monthYearLabel)}:
    </p>
    <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;color:#111827;">
      ${bulletItems}
    </ul>
  `;

  return {
    subject: `JobSyte Product Updates (${monthYearLabel})`,
    html: renderEmailLayout({
      eyebrow: "Product Updates",
      title: "What Is New In JobSyte",
      subtitle: `Recent enhancements designed to improve your daily workflow in ${monthYearLabel}.`,
      bodyHtml: body,
      ctaLabel: "Open JobSyte",
      ctaHref: `${input.appUrl}/`,
    }),
  };
}
