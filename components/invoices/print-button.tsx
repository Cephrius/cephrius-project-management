"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      className="rounded-md border px-3 py-2 text-sm hover:bg-muted print:hidden"
      onClick={() => window.print()}
      type="button"
    >
      Print
    </Button>
  );
}
