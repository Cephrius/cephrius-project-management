"use client";

import Link from "next/link";
import { LogOutIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBreadcrumbs } from "./breadcrumb-context";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitcher } from "@/components/theme-switcher";

const mobileNavItems = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/invoices", label: "Invoices" },
  { href: "/settings", label: "Settings" },
];

export function Header() {
  const supabase = createClient();
  const pathname = usePathname();
  const { crumbs, rightSlot } = useBreadcrumbs();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="border-b border-primary/20 bg-background px-4 py-3">
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
                  <Link className="hover:text-primary hover:underline" href={c.href}>
                    {c.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "font-medium text-primary" : "text-muted-foreground"}
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
          <ThemeSwitcher />

          <Button
            variant="destructive"
            size="icon"
            className="cursor-pointer sm:hidden"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <LogOutIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            className="hidden cursor-pointer sm:inline-flex"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>

      <nav className="mt-3 flex flex-wrap gap-2 md:hidden">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
