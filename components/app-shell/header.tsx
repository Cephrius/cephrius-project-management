"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "./breadcrumb-context";
import { createClient } from "@/lib/supbase/client";


export function Header() {
  const supabase = createClient();
  const { crumbs, rightSlot } = useBreadcrumbs();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {crumbs.length === 0 ? (
          <span className="text-foreground font-medium">Dashboard</span>
        ) : (
          crumbs.map((c, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <div key={`${c.label}-${idx}`} className="flex items-center gap-2">
                {c.href && !isLast ? (
                  <Link className="hover:underline" href={c.href}>
                    {c.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-foreground font-medium" : ""}>
                    {c.label}
                  </span>
                )}
                {!isLast && <span>›</span>}
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-2">
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
    </header>
  );
}
