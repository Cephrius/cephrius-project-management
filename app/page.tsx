import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  FolderOpen,
  Search,
  Sparkles,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AnimatedGradientBackground } from "@/components/landing/animated-gradient-background";
import { Button } from "@/components/ui/button";

type CoreModule = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const CORE_MODULES: CoreModule[] = [
  {
    title: "Projects",
    description: "Track addresses, builders, and subdivisions in one place.",
    icon: FolderOpen,
  },
  {
    title: "Jobs",
    description: "Schedule work, assign superintendents, and track completion.",
    icon: Calendar,
  },
  {
    title: "Invoices",
    description: "Create and edit invoices from completed project work.",
    icon: FileText,
  },
  {
    title: "Global Search",
    description: "Search projects, jobs, and invoices from one flow.",
    icon: Search,
  },
  {
    title: "Notifications",
    description: "Automate reminders, weekly summaries, and product updates.",
    icon: Bell,
  },
  {
    title: "CSV Import",
    description: "Bulk import projects and jobs with dry-run validation.",
    icon: Download,
  },
];

const OPERATIONS_FLOW = [
  "Add projects by address, builder, and subdivision",
  "Schedule jobs and track completion status",
  "Generate invoices directly from completed work",
  "Send automated reminders and weekly summaries",
  "Export account and project data when needed",
];

const RELEASE_CARDS = [
  {
    version: "v0.1.6a",
    date: "Feb 18, 2026",
    highlights: [
      "Improved header responsiveness for mobile and desktop views.",
      "Refined layout behavior for cleaner navigation and spacing.",
    ],
  },
  {
    version: "v0.1.5a",
    date: "Feb 16, 2026",
    highlights: [
      "Added in-app CSV import for projects and jobs with dry-run mode.",
      "Expanded invoice editing with complete line-item updates.",
      "Improved grouped project organization and mobile readability.",
    ],
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <AnimatedGradientBackground />

      <header className="relative z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center" aria-label="JobSyte home">
            <Image
              src="/jobsyte_banner_light_trans.png"
              alt="JobSyte"
              width={200}
              height={44}
              className="h-8 w-auto dark:hidden"
              priority
            />
            <Image
              src="/jobsyte_banner_dark_trans.png"
              alt="JobSyte"
              width={200}
              height={44}
              className="hidden h-8 w-auto dark:block"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <ThemeSwitcher hideLabel />
            <Button variant="outline" size="sm" className="rounded-full px-4" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="rounded-full px-4" asChild>
              <Link href="/signup">
                Create account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-12 md:px-8">
        <section className="text-center">
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Contractor operations in one workflow
            <Sparkles className="ml-2 inline-flex size-10 text-primary align-middle md:size-12" />
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            JobSyte is built for this project: manage projects, schedule jobs, and generate invoices without juggling
            separate tools.
          </p>

          <p className="mt-8 text-sm font-semibold text-foreground">What this app handles:</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_MODULES.map((module) => (
              <div
                key={module.title}
                className="rounded-xl border border-primary/30 bg-card/70 p-4 text-left shadow-sm backdrop-blur"
              >
                <module.icon className="mb-3 size-4 text-primary" />
                <p className="text-sm font-semibold leading-tight text-foreground">{module.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{module.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/signup">
                Start with JobSyte
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="/login">Sign in to dashboard</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Includes auth, dashboard metrics, project and job lifecycle controls, invoicing, and notification
            automation.
          </p>
        </section>

        <section className="mt-14 rounded-3xl border border-border/70 bg-card/60 p-5 shadow-xl shadow-primary/5 md:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs md:justify-start">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
              Project -&gt; Job -&gt; Invoice
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
              Built for contractor teams
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
              Responsive on desktop and mobile
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight">Built around real field workflows</h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                From first project setup to final invoice, JobSyte keeps scheduling, completion tracking, and billing
                connected.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {OPERATIONS_FLOW.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4 md:p-6">
              <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Jobs this week</span>
                </div>
                <div className="space-y-2">
                  {[82, 64, 91, 53, 76].map((pct) => (
                    <div key={pct} className="space-y-1">
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ml-auto mt-4 w-48 rounded-xl border border-border/70 bg-card/90 p-3 shadow-lg">
                <p className="text-xs font-semibold text-foreground">Automation</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>Invoice reminders</li>
                  <li>Weekly summaries</li>
                  <li>Product updates</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h3 className="text-center text-4xl font-semibold tracking-tight">Recent project releases</h3>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {RELEASE_CARDS.map((release) => (
              <article key={release.version} className="rounded-2xl border border-border/70 bg-card/60 p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="text-2xl font-semibold">{release.version}</h4>
                  <p className="text-xs text-muted-foreground">{release.date}</p>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {release.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/signup">
                Create your account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
