"use client";

import Link from "next/link";
import { Home, FolderKanban, FileText, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({
  mobile = false,
  collapsed = false,
}: {
  mobile?: boolean;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className={cn("p-3 text-sm space-y-1", collapsed && "px-2")}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        const linkClass = cn(
          "flex items-center rounded-md border border-transparent transition",
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
          collapsed ? "justify-center px-2 py-2.5" : "gap-2 px-3 py-2",
        );
        const linkContent = (
          <>
            <Icon className="size-4 shrink-0" />
            {!collapsed && item.label}
          </>
        );

        if (!collapsed) {
          return (
            <Link key={item.href} href={item.href} className={linkClass}>
              {linkContent}
            </Link>
          );
        }

        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={linkClass}
                aria-label={item.label}
              >
                {linkContent}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
