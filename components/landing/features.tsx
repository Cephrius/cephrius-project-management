import {
  FolderKanban,
  CalendarDays,
  FileText,
  BarChart3,
  Search,
  Settings,
} from "lucide-react";

const features = [
  {
    icon: FolderKanban,
    title: "Project Tracking",
    description:
      "Organize every project by address, builder, and subdivision. See all your active work in one place with real-time status updates.",
  },
  {
    icon: CalendarDays,
    title: "Job Scheduling",
    description:
      "Schedule jobs with completion dates, assign superintendents, and track progress. A 12-month calendar keeps your pipeline visible.",
  },
  {
    icon: FileText,
    title: "Invoice Generation",
    description:
      "Create professional invoices tied to your jobs and projects. Track issued amounts, due dates, and export with one click.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Insights",
    description:
      "See today's due jobs, this week's pipeline, open work, and invoiced totals at a glance. Know exactly where your business stands.",
  },
  {
    icon: Search,
    title: "Powerful Search",
    description:
      "Quickly find projects, jobs, and invoices with fast, full-text search across your entire business history.",
  },
  {
    icon: Settings,
    title: "Business Settings",
    description:
      "Configure your company profile, notification preferences, default invoice terms, and export your data anytime.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Features
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to run your trade business
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            From first bid to final invoice, JobSyte covers every step of your
            contracting workflow.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
