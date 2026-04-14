"use client";

import Link from "next/link";
import {
  DollarSign,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function getActiveHref(pathname: string) {
  if (pathname === "/dashboard") return "/dashboard";
  if (pathname === "/accounting" || pathname.includes("/accounting")) {
    return "/accounting";
  }
  if (pathname.startsWith("/projects")) return "/projects";
  if (pathname.startsWith("/invoices")) return "/invoices";
  if (pathname.startsWith("/employees-crews")) return "/employees-crews";
  if (pathname.startsWith("/payroll")) return "/payroll";
  if (pathname.startsWith("/settings")) return "/settings";
  return "";
}

const navItems = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/projects",   label: "Projects",   icon: FolderKanban },
  { href: "/invoices",   label: "Invoices",   icon: FileText },
  { href: "/accounting", label: "Accounting", icon: DollarSign },
  { href: "/payroll",    label: "Payroll",    icon: Wallet },
  { href: "/employees-crews",  label: "Employees & Crews",  icon: Users },
  { href: "/settings",   label: "Settings",   icon: Settings },
];

export function SidebarNav({
  mobile = false,
  collapsed = false,
}: {
  mobile?: boolean;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);

  if (mobile) {
    return (
      <nav className="grid grid-cols-7 gap-1 ">
        {navItems.map((item) => {
          const isActive = activeHref === item.href;
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
        const isActive = activeHref === item.href;
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
