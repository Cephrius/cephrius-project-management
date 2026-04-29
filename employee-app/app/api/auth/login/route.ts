import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/server";
import { createSession } from "@/lib/auth/session";

// Onboarding: employee login is intentionally separate from contractor Supabase
// Auth. Password hashes live on `employees.password_hash`, sessions are signed
// in `employee-app/lib/auth/session.ts`, and all business reads use company_id
// from that signed session.
export const runtime = "nodejs";

const HANDLE_RE = /^[a-z0-9_-]{3,32}$/;

export async function POST(request: Request) {
  let body: { loginHandle?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  const handle = String(body.loginHandle ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!handle || !password || !HANDLE_RE.test(handle)) {
    console.warn("[auth/login] rejected: handle failed regex", { handle });
    return NextResponse.json(
      { ok: false, message: "Invalid login handle or password." },
      { status: 401 },
    );
  }

  let supabase: ReturnType<typeof createServiceClient>;
  try {
    supabase = createServiceClient();
  } catch (error) {
    console.error("[auth/login] service client configuration error", error);
    return NextResponse.json(
      { ok: false, message: "Sign in is temporarily unavailable." },
      { status: 500 },
    );
  }

  const { data: row, error: lookupError } = await supabase
    .from("employees")
    .select(
      "id, company_id, password_hash, password_must_change, is_active, deleted_at",
    )
    .ilike("login_handle", handle)
    .is("deleted_at", null)
    .maybeSingle();

  if (lookupError) {
    console.error("[auth/login] supabase lookup error", lookupError);
    return NextResponse.json(
      { ok: false, message: "Sign in is temporarily unavailable." },
      { status: 500 },
    );
  }

  if (!row) {
    console.warn("[auth/login] rejected: no employee row for handle", { handle });
    return NextResponse.json(
      { ok: false, message: "Invalid login handle or password." },
      { status: 401 },
    );
  }

  if (!row.password_hash) {
    console.warn("[auth/login] rejected: employee has no password_hash", {
      handle,
      employeeId: row.id,
    });
    return NextResponse.json(
      { ok: false, message: "Invalid login handle or password." },
      { status: 401 },
    );
  }

  if (row.is_active === false) {
    console.warn("[auth/login] rejected: employee is inactive", {
      handle,
      employeeId: row.id,
    });
    return NextResponse.json(
      { ok: false, message: "Invalid login handle or password." },
      { status: 401 },
    );
  }

  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    console.warn("[auth/login] rejected: bcrypt password mismatch", {
      handle,
      employeeId: row.id,
      hashPrefix: row.password_hash.slice(0, 7),
    });
    return NextResponse.json(
      { ok: false, message: "Invalid login handle or password." },
      { status: 401 },
    );
  }

  await supabase
    .from("employees")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", row.id);

  await createSession({
    employeeId: row.id,
    companyId: row.company_id,
    passwordMustChange: row.password_must_change === true,
  });

  return NextResponse.json({
    ok: true,
    mustChange: row.password_must_change === true,
  });
}
