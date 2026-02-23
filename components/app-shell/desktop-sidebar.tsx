"use client";

import { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./sidebar-nav";
import { cn } from "@/lib/utils";
import { useSidebarState } from "./sidebar-state";
import { VersionChangelogDialog } from "./version-changelog-dialog";

function companyInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DesktopSidebar({ companyName }: { companyName: string }) {
  const { collapsed } = useSidebarState();
  const initials = useMemo(() => companyInitials(companyName), [companyName]);

  return (
    <aside
      className={cn(
        "hidden overflow-hidden rounded-2xl border border-primary/20 bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 md:sticky md:top-3 md:flex md:h-[calc(100vh-1.5rem)] md:shrink-0 md:flex-col md:self-start transition-[width] duration-300 ease-in-out",
        collapsed ? "md:w-20" : "md:w-64",
      )}
    >
      <div
        className={cn(
          "flex items-center p-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <div className={cn("min-w-0", collapsed && "text-center")}>
          <div className="truncate text-sm font-semibold text-primary">
            {collapsed ? initials || "JS" : companyName}
          </div>
          {!collapsed && (
            <div className="text-xs text-muted-foreground">JobSyte Portal</div>
          )}
        </div>
      </div>

      <Separator />

      <SidebarNav collapsed={collapsed} />

      <div
        className={cn(
          "mt-auto border-t border-primary/10 p-2 text-xs text-muted-foreground flex-col",
          collapsed && "text-center",
        )}
      >
        <VersionChangelogDialog collapsed={collapsed} />
        {!collapsed && (
          <>
            {" "}
            <a
              href="https://cephrius.com"
              className="underline hover:text-primary"
            >
              Cephrius Technologies
            </a>
            <a>© {new Date().getFullYear()}</a>
          </>
        )}
      </div>
    </aside>
  );
}
