"use client";


import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supbase/client";

export function Header() {
  const supabase = createClient();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Building Your Application</span>
        <span className="mx-2">›</span>
        <span>Dashboard</span>
      </div>

      <Button
        variant="outline"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
      >
        Sign out
      </Button>
    </header>
  );
}