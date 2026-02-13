"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Download,
  Info,
  KeyRound,
  LogOut,
  Mail,
  Palette,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  updateAccountEmail,
  updateAccountPassword,
  updateCompanyProfile,
  updatePreferences,
} from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSwitcher } from "@/components/theme-switcher";

type SettingsPageClientProps = {
  initialProfile: {
    companyName: string;
    address: string;
    phone: string;
  };
  account: {
    email: string;
    createdAt: string | null;
    lastSignInAt: string | null;
  };
  initialPreferences: {
    emailInvoiceReminders: boolean;
    weeklySummary: boolean;
    productUpdates: boolean;
    defaultDueDays: number;
  };
};

const PROJECT_STORAGE_KEYS_TO_CLEAR_ON_SIGN_OUT = [
  "projects:selected-project-id",
  "projects:expanded-subdivisions",
  "projects:expanded-builders",
];

function formatDate(value: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function clampDueDays(value: number) {
  if (!Number.isFinite(value)) return 30;
  return Math.min(180, Math.max(0, Math.round(value)));
}

export function SettingsPageClient({
  initialProfile,
  account,
  initialPreferences,
}: SettingsPageClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [companyName, setCompanyName] = useState(initialProfile.companyName);
  const [address, setAddress] = useState(initialProfile.address);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [savingProfile, setSavingProfile] = useState(false);

  const [emailInvoiceReminders, setEmailInvoiceReminders] = useState(
    initialPreferences.emailInvoiceReminders,
  );
  const [weeklySummary, setWeeklySummary] = useState(
    initialPreferences.weeklySummary,
  );
  const [productUpdates, setProductUpdates] = useState(
    initialPreferences.productUpdates,
  );
  const [defaultDueDays, setDefaultDueDays] = useState(
    String(initialPreferences.defaultDueDays),
  );
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [signingOutAll, setSigningOutAll] = useState(false);

  async function onSaveProfile() {
    setSavingProfile(true);
    const res = await updateCompanyProfile({
      companyName,
      address,
      phone,
    });
    setSavingProfile(false);

    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message ?? "Profile updated.");
    router.refresh();
  }

  async function onSavePreferences() {
    setSavingPreferences(true);

    const parsed = Number(defaultDueDays);
    const dueDays = clampDueDays(parsed);
    const res = await updatePreferences({
      emailInvoiceReminders,
      weeklySummary,
      productUpdates,
      defaultDueDays: dueDays,
    });

    setSavingPreferences(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    setDefaultDueDays(String(dueDays));
    toast.success(res.message ?? "Preferences saved.");
    router.refresh();
  }

  async function onUpdateEmail() {
    setSavingEmail(true);
    const res = await updateAccountEmail({ email: newEmail });
    setSavingEmail(false);

    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message ?? "Email update requested.");
    setNewEmail("");
  }

  async function onUpdatePassword() {
    setSavingPassword(true);
    const res = await updateAccountPassword({
      nextPassword,
      confirmPassword,
    });
    setSavingPassword(false);

    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    setNextPassword("");
    setConfirmPassword("");
    toast.success(res.message ?? "Password updated.");
  }

  async function onSignOutEverywhere() {
    setSigningOutAll(true);

    for (const key of PROJECT_STORAGE_KEYS_TO_CLEAR_ON_SIGN_OUT) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }

    const { error } = await supabase.auth.signOut({ scope: "global" });
    setSigningOutAll(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    window.location.href = "/login";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, business profile, preferences, and security.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Info className="size-4 text-primary" />
            Account Details
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <div className="font-medium text-primary/80">Current Email</div>
              <div className="text-muted-foreground">{account.email}</div>
            </div>
            <div>
              <div className="font-medium text-primary/80">Account Created</div>
              <div className="text-muted-foreground">
                {formatDate(account.createdAt)}
              </div>
            </div>
            <div>
              <div className="font-medium text-primary/80">Last Sign In</div>
              <div className="text-muted-foreground">
                {formatDate(account.lastSignInAt)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Palette className="size-4 text-primary" />
            Appearance
          </div>

          <p className="text-sm text-muted-foreground">
            Pick the app theme and accent color used across dashboard pages.
          </p>
          <div>
            <ThemeSwitcher />
          </div>
        </Card>
      </div>

      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Building2 className="size-4 text-primary" />
          Business Profile
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Cephrius LLC"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-phone">Phone</Label>
            <Input
              id="company-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(555) 555-0100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-address">Business Address</Label>
          <Textarea
            id="company-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            rows={3}
            placeholder="Street, City, State ZIP"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onSaveProfile}
            disabled={savingProfile || !companyName.trim()}
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </Card>

      <Card className="space-y-5 p-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="size-4 text-primary" />
          Preferences
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-md border border-primary/20 p-3">
            <div>
              <div className="font-medium">Invoice Reminder Emails</div>
              <div className="text-sm text-muted-foreground">
                Receive reminders for invoices nearing due date.
              </div>
            </div>
            <Switch
              checked={emailInvoiceReminders}
              onCheckedChange={setEmailInvoiceReminders}
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border border-primary/20 p-3">
            <div>
              <div className="font-medium">Weekly Summary</div>
              <div className="text-sm text-muted-foreground">
                Get a weekly email summary of job and invoice activity.
              </div>
            </div>
            <Switch checked={weeklySummary} onCheckedChange={setWeeklySummary} />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border border-primary/20 p-3">
            <div>
              <div className="font-medium">Product Updates</div>
              <div className="text-sm text-muted-foreground">
                Receive product release and improvement updates.
              </div>
            </div>
            <Switch checked={productUpdates} onCheckedChange={setProductUpdates} />
          </div>
        </div>

        <div className="max-w-xs space-y-2">
          <Label htmlFor="default-due-days">Default Invoice Due Days</Label>
          <Input
            id="default-due-days"
            type="number"
            min={0}
            max={180}
            value={defaultDueDays}
            onChange={(event) => setDefaultDueDays(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Used as your preferred due-date offset when creating invoices.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onSavePreferences}
            disabled={savingPreferences}
          >
            {savingPreferences ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </Card>

      <Card className="space-y-5 p-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="size-4 text-primary" />
          Security
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-md border border-primary/20 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Mail className="size-4 text-primary" />
              Change Email
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="new@email.com"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={onUpdateEmail}
              disabled={savingEmail || !newEmail.trim()}
            >
              {savingEmail ? "Submitting..." : "Update Email"}
            </Button>
          </div>

          <div className="space-y-3 rounded-md border border-primary/20 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <KeyRound className="size-4 text-primary" />
              Change Password
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={nextPassword}
                onChange={(event) => setNextPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter password"
              />
            </div>
            <Button
              type="button"
              onClick={onUpdatePassword}
              disabled={savingPassword || !nextPassword || !confirmPassword}
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-destructive/40 p-5">
        <div className="text-lg font-semibold text-destructive">Data & Session</div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/api/settings/export">
              <Download className="size-4" />
              Export My Data (JSON)
            </Link>
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onSignOutEverywhere}
            disabled={signingOutAll}
          >
            <LogOut className="size-4" />
            {signingOutAll ? "Signing Out..." : "Sign Out All Sessions"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
