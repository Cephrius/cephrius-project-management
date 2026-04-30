"use client";

// Onboarding: the public demo funnel posts to `app/api/demo-request/route.ts`.
// Marketing copy and shared landing sections live in `components/landing/*`.
import Link from "next/link";
import Image from "next/image";
import { type FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

type DemoFormState = {
  fullName: string;
  workEmail: string;
  companyName: string;
  phone: string;
  teamSize: string;
  trade: string;
  currentTools: string;
  priority: string;
};

const INITIAL_FORM_STATE: DemoFormState = {
  fullName: "",
  workEmail: "",
  companyName: "",
  phone: "",
  teamSize: "",
  trade: "",
  currentTools: "",
  priority: "",
};

const SITE_URL = "https://jobsyte.co";
const SALES_EMAIL = "sales@jobsyte.com";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Request a Demo | JobSyte",
  url: `${SITE_URL}/request-demo`,
  description:
    "Request a tailored JobSyte demo for contractor project management, scheduling, invoicing, payroll, accounting, and field operations.",
  mainEntity: {
    "@type": "Organization",
    name: "JobSyte",
    url: SITE_URL,
    email: SALES_EMAIL,
  },
};

const demoValue = [
  {
    icon: ClipboardList,
    title: "Workflow mapping",
    body: "We start with your projects, crews, invoice process, and current tools.",
  },
  {
    icon: CalendarDays,
    title: "Live product tour",
    body: "See the dashboard, calendar, projects, invoices, payroll, accounting, and search.",
  },
  {
    icon: ShieldCheck,
    title: "Setup plan",
    body: "Leave with a practical rollout path for your team and data.",
  },
];

export default function RequestDemoPage() {
  const [form, setForm] = useState<DemoFormState>(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField<Key extends keyof DemoFormState>(
    key: Key,
    value: DemoFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitted(false);

    const notes = [
      form.trade && `Trade / specialty: ${form.trade}`,
      form.currentTools && `Current tools: ${form.currentTools}`,
      form.priority && `What they want to improve: ${form.priority}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          companyName: form.companyName.trim(),
          workEmail: form.workEmail.trim(),
          phone: form.phone.trim() || undefined,
          teamSize: form.teamSize || undefined,
          notes: notes || undefined,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to submit demo request.");
      }

      setForm(INITIAL_FORM_STATE);
      setSubmitted(true);
      toast.success("Demo request submitted. We will reach out shortly.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit demo request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="border-b border-border">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link href="/" aria-label="JobSyte home">
            <Image
              src="/banner_dark_trans.png"
              alt="JobSyte"
              width={400}
              height={100}
              className="h-8 w-auto sm:h-9"
              priority
            />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Home
            </Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <p className="text-sm font-medium text-primary">Request a demo</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Get a JobSyte walkthrough built around your operation.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Tell us a little about your team so the demo can focus on the
            modules that matter most: projects, scheduling, employees, invoices,
            payroll, accounting, and search.
          </p>

          <div className="mt-8 space-y-4">
            {demoValue.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3 border-t border-border pt-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-semibold">Prefer email?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Send context to{" "}
              <a
                href={`mailto:${SALES_EMAIL}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {SALES_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-card p-5 shadow-sm md:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                autoComplete="name"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="Jamie Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workEmail">Work email</Label>
              <Input
                id="workEmail"
                type="email"
                autoComplete="email"
                value={form.workEmail}
                onChange={(event) => updateField("workEmail", event.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="(555) 555-5555"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input
                id="companyName"
                autoComplete="organization"
                value={form.companyName}
                onChange={(event) =>
                  updateField("companyName", event.target.value)
                }
                placeholder="Acme Construction"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize">Team size</Label>
              <NativeSelect
                id="teamSize"
                value={form.teamSize}
                onChange={(event) => updateField("teamSize", event.target.value)}
              >
                <NativeSelectOption value="">Select one</NativeSelectOption>
                <NativeSelectOption value="1-10">1-10</NativeSelectOption>
                <NativeSelectOption value="11-50">11-50</NativeSelectOption>
                <NativeSelectOption value="51-200">51-200</NativeSelectOption>
                <NativeSelectOption value="201+">201+</NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade">Primary trade</Label>
              <Input
                id="trade"
                value={form.trade}
                onChange={(event) => updateField("trade", event.target.value)}
                placeholder="Grading, framing, concrete..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentTools">Current tools</Label>
              <Input
                id="currentTools"
                value={form.currentTools}
                onChange={(event) =>
                  updateField("currentTools", event.target.value)
                }
                placeholder="Excel, Buildertrend, QuickBooks..."
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="priority">What should the demo focus on?</Label>
              <Textarea
                id="priority"
                value={form.priority}
                onChange={(event) => updateField("priority", event.target.value)}
                placeholder="Example: scheduling crews, invoicing completed jobs, replacing spreadsheets..."
                className="min-h-28"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  Request demo
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              No credit card required. We never sell your data.
            </p>
          </div>

          {submitted && (
            <p className="mt-4 flex items-start gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              Request received. We will reach out within one business day.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
