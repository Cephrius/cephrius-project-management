"use client";

import Link from "next/link";
import { Search, LogOutIcon } from "lucide-react";
import { type FormEvent } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBreadcrumbs } from "./breadcrumb-context";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Header() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { crumbs, rightSlot } = useBreadcrumbs();
  const currentQuery = searchParams.get("q") ?? "";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  const handleGlobalSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();
    if (!query) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="border-b border-primary/20 bg-background px-4 py-3">
      <div className="relative grid gap-3 pr-24 sm:pr-36 md:grid-cols-[1fr_minmax(18rem,30rem)_1fr] md:items-center md:gap-4 md:pr-0">
        <div className="absolute right-0 top-0 flex items-center gap-2 md:hidden">
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
            size="sm"
            className="hidden cursor-pointer sm:inline-flex"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>

        <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
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

        <form
          onSubmit={handleGlobalSearch}
          className="flex w-full items-center gap-2 md:col-start-2 md:justify-self-center"
        >
          <Input
            key={`${pathname}-${currentQuery}`}
            name="q"
            defaultValue={currentQuery}
            placeholder="Search projects, jobs, invoices..."
            className="h-9 border-primary/20 focus-visible:ring-primary/30"
            aria-label="Global search"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="cursor-pointer border-primary/30 hover:bg-primary/10"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end md:col-start-3 md:justify-self-end">
          {rightSlot}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeSwitcher />
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
