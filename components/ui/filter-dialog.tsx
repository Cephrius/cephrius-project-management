"use client";

import type { ReactNode } from "react";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FilterDialogProps = {
  title: string;
  description?: string;
  triggerLabel?: string;
  activeCount?: number;
  onClear?: () => void;
  clearLabel?: string;
  children: ReactNode;
  contentClassName?: string;
  triggerClassName?: string;
};

type FilterDialogSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FilterDialog({
  title,
  description,
  triggerLabel = "Filters",
  activeCount = 0,
  onClear,
  clearLabel = "Clear Filters",
  children,
  contentClassName,
  triggerClassName,
}: FilterDialogProps) {
  const hasActiveFilters = activeCount > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 border-border/80",
            hasActiveFilters && "border-primary/40 bg-primary/5 text-primary",
            triggerClassName,
          )}
        >
          <Filter className="size-4" />
          <span>{triggerLabel}</span>
          {hasActiveFilters ? (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 rounded-full px-1.5 text-[11px] tabular-nums"
            >
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </DialogTrigger>

      <DialogContent className={cn("sm:max-w-lg", contentClassName)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {/* Pages own their filter state; this wrapper only standardizes the modal shell. */}
        <div className="space-y-4">{children}</div>

        <DialogFooter>
          {onClear ? (
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              disabled={!hasActiveFilters}
            >
              {clearLabel}
            </Button>
          ) : null}
          <DialogClose asChild>
            <Button type="button">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FilterDialogSection({
  title,
  description,
  children,
  className,
}: FilterDialogSectionProps) {
  return (
    <section className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <div className="text-sm font-medium">{title}</div>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
