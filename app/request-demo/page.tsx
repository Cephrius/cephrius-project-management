"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  HardHat,
  Loader2,
  Receipt,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
const SITE_URL = "https://jobsyte.co";
const SALES_EMAIL = "sales@jobsyte.com";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const HEADER_ENTER_DURATION = 1.15;
const HOVER_SPRING = {
  type: "spring",
  stiffness: 135,
  damping: 18,
  mass: 0.9,
} as const;

const STAGGER_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
};
const FADE_UP = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

const DEMO_HIGHLIGHTS = [
  {
    icon: CalendarClock,
    title: "12-month schedule walkthrough",
    body: "We'll load your projects into the calendar and show you how superintendents and crews stay aligned.",
  },
  {
    icon: HardHat,
    title: "Field & office, side by side",
    body: "See the same dashboard your crew leads will open on a phone in the truck.",
  },
  {
    icon: Receipt,
    title: "Billing tied to the work",
    body: "Convert completed jobs into invoices and watch the monthly snapshot update in real time.",
  },
];

const REQUEST_DEMO_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Request a Demo | JobSyte",
  url: `${SITE_URL}${REQUEST_DEMO_HREF}`,
  description:
    "Request a demo of JobSyte construction project management software for contractors.",
  mainEntity: {
    "@type": "Organization",
    name: "JobSyte",
    url: SITE_URL,
    email: SALES_EMAIL,
    contactPoint: {
      "@type": "ContactPoint",
      email: SALES_EMAIL,
      contactType: "sales",
    },
  },
  about: {
    "@type": "SoftwareApplication",
    name: "JobSyte",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "ProjectManagementApplication",
    operatingSystem: "Web",
    url: SITE_URL,
  },
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
          phone: phoneNumber
            ? `${form.phoneCountry} ${phoneNumber}`
            : undefined,
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
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Keep demo intent visible to crawlers without waiting for hydration. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(REQUEST_DEMO_STRUCTURED_DATA),
        }}
      />

      {/* Background — mirrors the landing page so the demo flow feels continuous */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
        <motion.div
          className="absolute -top-40 left-[-10rem] h-[34rem] w-[34rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklch, var(--primary) 35%, transparent) 0%, transparent 70%)",
            willChange: "transform, opacity",
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, 96, 0],
                  scale: [1, 1.06, 1],
                  opacity: [0.7, 0.95, 0.7],
                }
          }
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-56 right-[-12rem] h-[38rem] w-[38rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklch, var(--primary) 22%, transparent) 0%, transparent 72%)",
            willChange: "transform, opacity",
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, -78, 0],
                  scale: [1, 1.05, 1],
                  opacity: [0.6, 0.9, 0.6],
                }
          }
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <motion.div
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 md:px-8"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: HEADER_ENTER_DURATION, ease: EASE_OUT }}
        >
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="JobSyte home"
          >
            <Image
              src="/banner_dark_trans.png"
              alt="JobSyte"
              width={400}
              height={100}
              className="h-8 sm:h-9 md:h-10 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-4"
              asChild
            >
              <Link href="/">Back to home</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-primary/25 px-4"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-12 sm:pt-16 md:px-8 md:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* LEFT — pitch + highlights */}
          <motion.section
            className="space-y-8"
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
          >
            <motion.div className="space-y-5" variants={FADE_UP}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-foreground/80 shadow-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  <Sparkles className="size-3" />
                  Demo
                </span>
                <span>Walkthrough on a live JobSyte instance</span>
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                See JobSyte run your{" "}
                <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  actual workflow
                </span>
              </h1>
              <p className="max-w-xl text-base text-muted-foreground md:text-lg">
                A 30-minute call with sample data shaped around your projects,
                crews, and billing cadence — not a generic product tour.
              </p>
              <p className="max-w-xl text-sm text-muted-foreground">
                Prefer email? Reach us at{" "}
                <a
                  href={`mailto:${SALES_EMAIL}`}
                  className="font-medium text-foreground underline decoration-foreground/40 underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {SALES_EMAIL}
                </a>
                .
              </p>
            </motion.div>

            <motion.ul className="space-y-3" variants={STAGGER_CONTAINER}>
              {DEMO_HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
                <motion.li
                  key={title}
                  variants={FADE_UP}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -2,
                          boxShadow:
                            "0 18px 40px -28px hsl(var(--primary) / 0.28)",
                        }
                  }
                  transition={HOVER_SPRING}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 backdrop-blur"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-tight">
                      {title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              variants={FADE_UP}
              className="rounded-2xl border border-border/70 bg-card/80 p-5 backdrop-blur"
            >
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Users className="size-3.5" />
                What happens after you submit
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {[
                  "We reply within one business day with scheduling options.",
                  "We import a sample of your project addresses ahead of the call.",
                  "Your account is provisioned the moment the demo wraps.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.section>

          {/* RIGHT — form */}
          <motion.section
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            transition={{ delay: 0.06 }}
          >
            <motion.div variants={FADE_UP} transition={HOVER_SPRING}>
              <Card className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/95 p-6 shadow-2xl shadow-primary/10 backdrop-blur md:p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-24 -right-16 size-52 rounded-full bg-primary/10 blur-3xl"
                />

                <div className="relative z-10 mb-5 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Request access
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Tell us about your team
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Takes about a minute. No credit card required.
                  </p>
                </div>

                <form
                  className="relative z-10 space-y-4"
                  onSubmit={handleSubmit}
                >
                  <motion.div className="space-y-2" variants={FADE_UP}>
                    <Label htmlFor="workEmail">Work email</Label>
                    <Input
                      id="workEmail"
                      type="email"
                      autoComplete="email"
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
                  </motion.div>

                  <motion.div
                    className="grid gap-4 sm:grid-cols-2"
                    variants={FADE_UP}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        autoComplete="given-name"
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
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        autoComplete="family-name"
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
                  </motion.div>

                  <motion.div
                    className="grid gap-4 sm:grid-cols-2"
                    variants={FADE_UP}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company</Label>
                      <Input
                        id="companyName"
                        autoComplete="organization"
                        value={form.companyName}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            companyName: event.target.value,
                          }))
                        }
                        placeholder="Acme Construction"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job title</Label>
                      <Input
                        id="jobTitle"
                        autoComplete="organization-title"
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
                  </motion.div>

                  <motion.div className="space-y-2" variants={FADE_UP}>
                    <Label htmlFor="companySize">Company size</Label>
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
                      <NativeSelectOption value="">
                        Select one
                      </NativeSelectOption>
                      <NativeSelectOption value="1-10">1–10</NativeSelectOption>
                      <NativeSelectOption value="11-50">
                        11–50
                      </NativeSelectOption>
                      <NativeSelectOption value="51-200">
                        51–200
                      </NativeSelectOption>
                      <NativeSelectOption value="201+">201+</NativeSelectOption>
                    </NativeSelect>
                  </motion.div>

                  <motion.div className="space-y-2" variants={FADE_UP}>
                    <Label htmlFor="phone">Phone number</Label>
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
                        <NativeSelectOption value="+1">
                          US +1
                        </NativeSelectOption>
                        <NativeSelectOption value="+44">
                          UK +44
                        </NativeSelectOption>
                        <NativeSelectOption value="+61">
                          AU +61
                        </NativeSelectOption>
                        <NativeSelectOption value="+353">
                          IE +353
                        </NativeSelectOption>
                      </NativeSelect>
                      <Input
                        id="phone"
                        type="tel"
                        autoComplete="tel-national"
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
                  </motion.div>

                  <motion.div
                    className="flex flex-wrap items-center gap-3 pt-2"
                    variants={FADE_UP}
                  >
                    <motion.div
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : {
                              y: -3,
                              scale: 1.02,
                              boxShadow:
                                "0 22px 48px -24px hsl(var(--primary) / 0.55)",
                            }
                      }
                      whileTap={
                        shouldReduceMotion ? undefined : { scale: 0.98 }
                      }
                      transition={HOVER_SPRING}
                    >
                      <Button
                        type="submit"
                        disabled={submitting}
                        size="lg"
                        className="rounded-full px-7 shadow-md"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          <>
                            Request demo
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                    <Button
                      variant="outline"
                      size="lg"
                      type="button"
                      className="rounded-full border-primary/25 px-7"
                      asChild
                    >
                      <Link href="/login">I already have an account</Link>
                    </Button>
                  </motion.div>

                  <p className="pt-2 text-xs text-muted-foreground">
                    By submitting, you agree to be contacted by the JobSyte
                    team about your demo request. We never sell your data.
                  </p>
                </form>

                <AnimatePresence>
                  {submitted && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.4, ease: EASE_OUT }}
                      className="relative z-10 mt-5 flex items-start gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>
                        Request received. We&apos;ll reach out within one
                        business day with scheduling options.
                      </span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </motion.section>
        </div>
      </div>

      <footer className="relative z-10 border-t border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-center text-xs text-muted-foreground md:flex-row md:px-8 md:text-left">
          <p>© 2026 JobSyte. All rights reserved.</p>
          <p>
            New accounts are enabled after a demo. Existing customers can{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline decoration-foreground/40 underline-offset-4 hover:decoration-foreground"
            >
              sign in
            </Link>{" "}
            immediately.
          </p>
        </div>
      </footer>
    </main>
  );
}
