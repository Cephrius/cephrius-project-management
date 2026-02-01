"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supbase/client";



export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showVerified, setShowVerified] = useState(false);


  function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  useEffect(() => {
    const match = document.cookie.match(/(^| )bf_verified=([^;]+)/);
    if (match?.[2] === "1") {
      setShowVerified(true);
      fetch("/api/auth/verified/clear", { method: "POST" }).catch(() => { });
    }
  }, []);

  async function handlePasswordLogin() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) return setMsg(error.message);

    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-6">
        {showVerified && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">Account verified. Please sign in.</div>
        )}
        <div className="space-y-1 mb-6">
          <div className="text-lg font-semibold">Sign in</div>
          <div className="text-sm text-muted-foreground">
            Access your contractor dashboard
          </div>
        </div>

        <div className="space-y-4 ">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>

          <div className="space-y-2 ">
            <Label className="grid-row-2">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••••••"
            />
          </div>

          <Button
            className="w-full"
            disabled={loading || !email || !password}
            onClick={handlePasswordLogin}
          >
            {loading ? "Logging In..." : "Sign In"}
          </Button>

          {msg && <p className="text-sm  text-destructive">{msg}</p>}
        </div>
        <div className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a className="underline" href="/signup">
            Sign up
          </a>
        </div>
      </Card>
    </div>
  );
}