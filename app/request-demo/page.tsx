"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { AnimatedGradientBackground } from "@/components/landing/animated-gradient-background";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DemoFormState = {
  fullName: string;
  companyName: string;
  workEmail: string;
  phone: string;
  // teamSize: string;
  notes: string;
};

const INITIAL_FORM_STATE: DemoFormState = {
  fullName: "",
  companyName: "",
  workEmail: "",
  phone: "",
  // teamSize: "",
  notes: "",
};

const REQUEST_DEMO_HREF = "/request-demo";
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function RequestDemoPage() {
  const shouldReduceMotion = useReducedMotion();
  const [form, setForm] = useState<DemoFormState>(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitted(false);

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
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
    <main className="relative min-h-screen overflow-hidden bg-background">
      <AnimatedGradientBackground />

      <motion.header
        className="relative z-20 border-b border-border/60 bg-background/80 backdrop-blur"
        initial={
          shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link
            href="/"
            className="flex items-center"
            aria-label="JobSyte home"
          >
            <Image
              src="/banner_light_trans.png"
              alt="JobSyte"
              width={400}
              height={100}
              className="size-10 w-auto dark:hidden"
              priority
            />
            <Image
              src="/banner_dark_trans.png"
              alt="JobSyte"
              width={480}
              height={100}
              className="hidden size-10 w-auto dark:block"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <ThemeSwitcher hideLabel />
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="rounded-full px-4" asChild>
              <Link href={REQUEST_DEMO_HREF}>
                Request demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 px-4 py-10">
        <div className="mx-auto w-full max-w-3xl">
          <Card className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-lg md:p-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Request a JobSyte demo
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                We are here to help you better understand the benefits and
                implementation opportunities for your business.
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="Alex Johnson"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        companyName: event.target.value,
                      }))
                    }
                    placeholder="Alex Contracting"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workEmail">Work email</Label>
                  <Input
                    id="workEmail"
                    type="email"
                    value={form.workEmail}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        workEmail: event.target.value,
                      }))
                    }
                    placeholder="alex@company.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="teamSize">Team size (optional)</Label>
                <Input
                  id="teamSize"
                  value={form.teamSize}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      teamSize: event.target.value,
                    }))
                  }
                  placeholder="Example: 8 field staff"
                />
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="notes">
                  What do you want to see in the demo? (optional)
                </Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Current workflow, invoicing needs, team pain points, etc."
                  rows={5}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Request demo
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
                <Button variant="outline" type="button" asChild>
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>
            </form>

            {submitted && (
              <p className="mt-5 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-foreground">
                Request received. We will reach out with scheduling options and
                next signup steps.
              </p>
            )}
          </Card>
        </div>
      </div>

      <footer className="relative z-10 border-t border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center md:flex-row md:px-8 md:text-left">
          <p className="text-sm text-muted-foreground">
            New accounts are enabled after a demo. Existing customers can sign
            in immediately.
          </p>
        </div>
      </footer>
    </main>
  );
}
