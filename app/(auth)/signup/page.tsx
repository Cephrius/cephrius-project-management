"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supbase/client";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const passwordError = useMemo(() => {
    if (!password || !confirm) return null;
    return password === confirm ? null : "Passwords do not match.";
  }, [password, confirm]);

  async function handleSignup() {
    setLoading(true);
    setMsg(null);

    if (password !== confirm) {
      setLoading(false);
      setMsg("Passwords do not match.");
      return;
    }

    // 1) Create user (email/password)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // We'll verify via OTP code, then send them to login.
        data: { company_name: companyName },
      },
    });

    if (signUpError) {
      setLoading(false);
      setMsg(signUpError.message);
      return;
    }

    // 2) Send email OTP code (our "2FA code")
    // shouldCreateUser=false ensures we are sending OTP to the user we just created.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      setLoading(false);
      setMsg(otpError.message);
      return;
    }

    setLoading(false);

    // Go to verify page; pass companyName along so we can create contractor_profiles after verification
    router.push(
      `/verify?email=${encodeURIComponent(email)}&company=${encodeURIComponent(companyName)}`
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-1 mb-6">
          <div className="text-lg font-semibold">Create your account</div>
          <div className="text-sm text-muted-foreground">
            Start managing projects and invoices.
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Cephrius Steel LLC"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="text-xs text-destructive">{passwordError}</p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={loading || !companyName || !email || !password || !confirm || !!passwordError}
            onClick={handleSignup}
          >
            {loading ? "Creating..." : "Create account"}
          </Button>

          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a className="underline" href="/login">
              Sign in
            </a>
          </div>

          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        </div>
      </Card>
    </div>
  );
}