"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, type FormEvent, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

type DemoFormState = {
  workEmail: string;
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle: string;
  companySize: string;
  phoneCountry: string;
  phone: string;
};

const INITIAL_FORM_STATE: DemoFormState = {
  workEmail: "",
  firstName: "",
  lastName: "",
  companyName: "",
  jobTitle: "",
  companySize: "",
  phoneCountry: "+1",
  phone: "",
};

const REQUEST_DEMO_HREF = "/request-demo";
const SALES_EMAIL = "sales@jobsyte.com";
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const REQUEST_DEMO_LIGHT_THEME_STYLE: CSSProperties = {
  colorScheme: "light",
  "--background": "#ffffff",
  "--foreground": "#000000",
  "--card": "#ffffff",
  "--card-foreground": "#000000",
  "--primary": "#2563eb",
  "--primary-foreground": "#ffffff",
  "--secondary": "#f7f8fb",
  "--secondary-foreground": "#000000",
  "--muted": "#f7f8fb",
  "--muted-foreground": "#000000",
  "--accent": "#ebf2ff",
  "--accent-foreground": "#000000",
  "--border": "#d9dee8",
  "--input": "#d9dee8",
  "--ring": "#60a5fa",
};

export default function RequestDemoPage() {
  const shouldReduceMotion = useReducedMotion();
  const [form, setForm] = useState<DemoFormState>(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitted(false);

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`
      .replace(/\s+/g, " ")
      .trim();
    const companyName = form.companyName.trim();
    const workEmail = form.workEmail.trim();
    const phoneNumber = form.phone.trim();
    const jobTitle = form.jobTitle.trim();

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          companyName,
          workEmail,
          phone: phoneNumber ? `${form.phoneCountry} ${phoneNumber}` : undefined,
          teamSize: form.companySize || undefined,
          notes: jobTitle ? `Job title: ${jobTitle}` : undefined,
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
    <main
      className="relative min-h-screen overflow-hidden bg-background"
      style={REQUEST_DEMO_LIGHT_THEME_STYLE}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, hsl(var(--primary) / 0.28) 0%, transparent 68%)",
          }}
          animate={{
            x: [-80, 80, -80],
            y: [0, 40, 0],
            scale: [1, 1.08, 1],
            opacity: [0.45, 0.75, 0.45],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-56 right-[-8rem] h-[36rem] w-[36rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, hsl(var(--accent) / 0.2) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -70, 0],
            y: [20, -20, 20],
            scale: [1, 1.06, 1],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

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
              className="size-10 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4 bg-gray-200 text-black"
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
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <motion.section
            className="space-y-6 lg:pt-8"
            initial={
              shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight md:text-5xl text-black">
                Got a question for our sales team?
              </h1>
              <p className="max-w-xl text-base text-muted-foreground md:text-lg">
                We are looking forward to learning more about your team&apos;s
                workflow and how JobSyte can help you move projects faster with
                fewer handoffs.
              </p>
              <p className="max-w-xl text-base italic text-muted-foreground md:text-lg">
                For any question about JobSyte and about how we can fit your needs reach us at{" "}
                <a
                  href={`mailto:${SALES_EMAIL}`}
                  className="underline decoration-foreground/50 underline-offset-4 hover:decoration-foreground"
                >
                  {SALES_EMAIL}
                </a>
                .
              </p>
            </div>

            <div className="max-w-xl space-y-4 rounded-2xl border border-border/70 bg-card/80 p-5">
              <p className="text-2xl font-semibold leading-tight tracking-tight text-black">
                &quot;JobSyte is the best product we&apos;ve used for keeping
                crews and billing aligned.&quot;
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Clement Ouizille
                </span>
                , Co-founder, Convelio
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={
              shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.06 }}
          >
            <Card className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-6 shadow-xl md:p-8">
              <div className="pointer-events-none absolute -bottom-24 -right-16 size-52 rounded-full bg-primary/10 blur-3xl" />

              <form className="relative z-10 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="workEmail">Work Email</Label>
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
                    placeholder="you@company.com"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          firstName: event.target.value,
                        }))
                      }
                      placeholder="Jamie"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          lastName: event.target.value,
                        }))
                      }
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company</Label>
                    <Input
                      id="companyName"
                      value={form.companyName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          companyName: event.target.value,
                        }))
                      }
                      placeholder="Your company"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={form.jobTitle}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          jobTitle: event.target.value,
                        }))
                      }
                      placeholder="Director of Operations"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <NativeSelect
                    id="companySize"
                    className="w-full"
                    value={form.companySize}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        companySize: event.target.value,
                      }))
                    }
                  >
                    <NativeSelectOption value="">Select one</NativeSelectOption>
                    <NativeSelectOption value="1-10">1-10</NativeSelectOption>
                    <NativeSelectOption value="11-50">11-50</NativeSelectOption>
                    <NativeSelectOption value="51-200">51-200</NativeSelectOption>
                    <NativeSelectOption value="201+">201+</NativeSelectOption>
                  </NativeSelect>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
                    <NativeSelect
                      id="phoneCountry"
                      className="w-full"
                      value={form.phoneCountry}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          phoneCountry: event.target.value,
                        }))
                      }
                    >
                      <NativeSelectOption value="+1">US +1</NativeSelectOption>
                      <NativeSelectOption value="+44">UK +44</NativeSelectOption>
                      <NativeSelectOption value="+61">AU +61</NativeSelectOption>
                      <NativeSelectOption value="+353">IE +353</NativeSelectOption>
                    </NativeSelect>
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

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full px-7"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit
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
                <p className="relative z-10 mt-5 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-foreground">
                  Request received. We will reach out with scheduling options and
                  next signup steps.
                </p>
              )}
            </Card>
          </motion.section>
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
