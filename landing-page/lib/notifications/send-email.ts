import "server-only";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

type SendEmailResult = {
  ok: boolean;
  skipped?: boolean;
  message?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  from: fromOverride,
}: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = fromOverride?.trim() || process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return {
      ok: false,
      skipped: true,
      message: "Email provider not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        message: body || `Email API error (${response.status}).`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to send email.",
    };
  }
}
