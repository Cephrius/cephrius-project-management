import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/notifications/send-email";

export const runtime = "nodejs";

type DemoRequestPayload = {
  fullName: string;
  companyName: string;
  workEmail: string;
  phone?: string;
  teamSize?: string;
  notes?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmailAddress(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/<([^>]+)>/);
  const candidate = (match?.[1] ?? trimmed).trim().toLowerCase();
  if (!EMAIL_PATTERN.test(candidate)) return null;
  return candidate;
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parsePayload(raw: unknown): {
  payload?: DemoRequestPayload;
  message?: string;
} {
  if (!raw || typeof raw !== "object") {
    return { message: "Invalid request payload." };
  }

  const body = raw as Record<string, unknown>;

  const fullName = toStringOrEmpty(body.fullName);
  const companyName = toStringOrEmpty(body.companyName);
  const workEmail = toStringOrEmpty(body.workEmail).toLowerCase();
  const phone = toStringOrEmpty(body.phone);
  const teamSize = toStringOrEmpty(body.teamSize);
  const notes = toStringOrEmpty(body.notes);

  if (!fullName || !companyName || !workEmail) {
    return {
      message: "Full name, company name, and work email are required.",
    };
  }

  if (!EMAIL_PATTERN.test(workEmail)) {
    return { message: "Enter a valid work email address." };
  }

  return {
    payload: {
      fullName: fullName.slice(0, 120),
      companyName: companyName.slice(0, 160),
      workEmail: workEmail.slice(0, 160),
      phone: phone ? phone.slice(0, 40) : undefined,
      teamSize: teamSize ? teamSize.slice(0, 80) : undefined,
      notes: notes ? notes.slice(0, 1500) : undefined,
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const parsed = parsePayload(body);
  if (!parsed.payload) {
    return NextResponse.json(
      { ok: false, message: parsed.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const to =
    parseEmailAddress(process.env.DEMO_REQUEST_TO_EMAIL) ??
    parseEmailAddress(process.env.RESEND_FROM_EMAIL);

  if (!to) {
    return NextResponse.json(
      {
        ok: false,
        message: "Demo request inbox is not configured. Set DEMO_REQUEST_TO_EMAIL.",
      },
      { status: 500 },
    );
  }

  const submittedAt = new Date().toISOString();
  const html = `
    <h2>New JobSyte demo request</h2>
    <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
    <p><strong>Name:</strong> ${escapeHtml(parsed.payload.fullName)}</p>
    <p><strong>Company:</strong> ${escapeHtml(parsed.payload.companyName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(parsed.payload.workEmail)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(parsed.payload.phone ?? "-")}</p>
    <p><strong>Team size:</strong> ${escapeHtml(parsed.payload.teamSize ?? "-")}</p>
    <p><strong>Notes:</strong></p>
    <p>${escapeHtml(parsed.payload.notes ?? "-").replaceAll("\n", "<br />")}</p>
  `;

  const sendResult = await sendEmail({
    to,
    subject: `New demo request - ${parsed.payload.companyName}`,
    html,
  });

  if (!sendResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: sendResult.message ?? "Could not submit demo request.",
      },
      { status: sendResult.skipped ? 503 : 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
