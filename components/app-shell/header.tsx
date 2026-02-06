"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "./breadcrumb-context";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const supabase = createClient();
  const { crumbs, rightSlot } = useBreadcrumbs();

  return (
    <header className="border-b bg-background px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {crumbs.map((c, idx) => {
              const isLast = idx === crumbs.length - 1;
              return (
                <div
                  key={`${c.label}-${idx}`}
                  className="flex items-center gap-2"
                >
                  {c.href && !isLast ? (
                    <Link className="hover:underline" href={c.href}>
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? "text-foreground font-medium" : ""}
                    >
                      {c.label}
                    </span>
                  )}
                  {!isLast && <span>&gt;</span>}
                </div>
              );
            })}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {rightSlot}

          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <nav className="mt-3 flex flex-wrap gap-2 md:hidden">
        <Link
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
          href="/"
        >
          Dashboard
        </Link>
        <Link
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
          href="/projects"
        >
          Projects
        </Link>
        <Link
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
          href="/invoices"
        >
          Invoices
        </Link>
        <Link
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
          href="/settings"
        >
          Settings
        </Link>
      </nav>
    </header>
  );
}
