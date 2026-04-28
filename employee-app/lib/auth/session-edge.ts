// Edge-compatible session reader for middleware. Uses only `jose` (no Node APIs).
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "jobsyte_employee_session";

export type EmployeeSessionLite = {
  employeeId: string;
  companyId: string;
  passwordMustChange: boolean;
};

function getKey() {
  const secret = process.env.EMPLOYEE_SESSION_SECRET;
  if (!secret) throw new Error("Missing EMPLOYEE_SESSION_SECRET");
  return new TextEncoder().encode(secret);
}

export async function readSessionFromRequest(
  req: NextRequest,
): Promise<EmployeeSessionLite | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey());
    if (typeof payload.sub !== "string" || typeof payload.cid !== "string") {
      return null;
    }
    return {
      employeeId: payload.sub,
      companyId: payload.cid,
      passwordMustChange: payload.pmc === true,
    };
  } catch {
    return null;
  }
}
