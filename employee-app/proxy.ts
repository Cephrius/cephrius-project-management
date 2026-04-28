import { NextResponse, type NextRequest } from "next/server";
import { readSessionFromRequest } from "@/lib/auth/session-edge";

const PUBLIC_PATHS = new Set(["/login"]);
const PUBLIC_API_PREFIX = "/api/auth/";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith(PUBLIC_API_PREFIX)) {
    return NextResponse.next();
  }

  const session = await readSessionFromRequest(req);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (session.passwordMustChange && pathname !== "/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/change-password";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
