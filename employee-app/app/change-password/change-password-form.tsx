"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const router = useRouter();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pwd.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    if (pwd !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: pwd }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!data.ok) {
        setError(data.message ?? "Could not update password.");
        return;
      }
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Save Password"}
      </Button>
    </form>
  );
}
