"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";
import { CompanySwitcher } from "./company-switcher";
import { VersionChangelogDialog } from "./version-changelog-dialog";
import { cn } from "@/lib/utils";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [openedRouteKey, setOpenedRouteKey] = useState(routeKey);

  const isOpen = open && openedRouteKey === routeKey;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setOpenedRouteKey(routeKey);
        }
        setOpen(nextOpen);
      }}
    >
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Open navigation menu"
          className={cn(
            "h-9 w-9 shrink-0 cursor-pointer border-primary/30 hover:bg-primary/10 md:hidden",
          )}
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-[82vw] max-w-[320px] flex-col gap-0 bg-background p-0"
      >
        <SheetHeader className="p-3">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Jump to any section of JobSyte.
          </SheetDescription>
          <CompanySwitcher />
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-primary/10 p-3 text-xs text-muted-foreground">
          <VersionChangelogDialog />
          <a
            href="https://cephrius.com"
            className="underline hover:text-primary"
          >
            Cephrius Technologies
          </a>
          <span>© JobSyte</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
