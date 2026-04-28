import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/server";
import { createSession, getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Not signed in." },
      { status: 401 },
    );
  }

  let body: { newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  const newPassword = String(body.newPassword ?? "");
  if (newPassword.length < 10) {
    return NextResponse.json(
      { ok: false, message: "Password must be at least 10 characters." },
      { status: 400 },
    );
  }

  const hash = await bcrypt.hash(newPassword, 10);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("employees")
    .update({ password_hash: hash, password_must_change: false })
    .eq("id", session.employeeId)
    .eq("company_id", session.companyId);

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 },
    );
  }

  // Re-issue session so middleware no longer forces /change-password.
  await createSession({
    employeeId: session.employeeId,
    companyId: session.companyId,
    passwordMustChange: false,
  });

  return NextResponse.json({ ok: true });
}
