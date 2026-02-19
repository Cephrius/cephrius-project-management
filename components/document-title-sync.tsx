"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getPageTitle(pathname: string): string {
  if (pathname === "/" ) return "JobSyte";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/invoices")) return "Invoices";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/login")) return "Login";
  if (pathname.startsWith("/signup")) return "Sign Up";
  if (pathname.startsWith("/verify")) return "Verify";
  return "JobSyte";
}

export function DocumentTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    const pageTitle = getPageTitle(pathname);
    document.title = pageTitle === "JobSyte" ? "JobSyte" : `${pageTitle} | JobSyte`;
  }, [pathname]);

  return null;
}
