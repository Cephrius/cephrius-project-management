import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "jobsyte_employee_session";
const ALG = "HS256";
const EXP_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type EmployeeSession = {
  employeeId: string;
  companyId: string;
  passwordMustChange: boolean;
};

function getKey() {
  const secret = process.env.EMPLOYEE_SESSION_SECRET;
  if (!secret) throw new Error("Missing EMPLOYEE_SESSION_SECRET");
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: EmployeeSession) {
  const token = await new SignJWT({
    sub: payload.employeeId,
    cid: payload.companyId,
    pmc: payload.passwordMustChange,
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${EXP_SECONDS}s`)
    .sign(getKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: EXP_SECONDS,
  });
}

export async function getSession(): Promise<EmployeeSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
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

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
