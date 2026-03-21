"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function RouteTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={cn(
        "flex min-h-0 flex-1 flex-col animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
