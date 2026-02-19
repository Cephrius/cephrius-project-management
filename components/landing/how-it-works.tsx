const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up in seconds with your email and company name. No credit card required to get started.",
  },
  {
    number: "02",
    title: "Add Your Projects",
    description:
      "Enter your active projects with addresses, builders, and subdivisions. Import existing data or start fresh.",
  },
  {
    number: "03",
    title: "Schedule & Track Jobs",
    description:
      "Break each project into jobs with scheduled dates, superintendents, and pricing. Mark them complete as you go.",
  },
  {
    number: "04",
    title: "Invoice & Get Paid",
    description:
      "Generate professional invoices tied to your completed work. Track amounts issued and stay on top of payments.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How It Works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            No complicated setup. No learning curve. Just the tools you need to manage your work.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-border md:left-1/2 md:block" />

          <div className="grid gap-8 md:gap-0">
            {steps.map((step, index) => (
              <div key={step.number} className="relative md:grid md:grid-cols-2 md:gap-12">
                <div className="absolute left-6 top-0 hidden size-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background md:left-1/2 md:block" />

                <div
                  className={`${
                    index % 2 === 0
                      ? "md:pr-16 md:text-right"
                      : "md:col-start-2 md:pl-16"
                  }`}
                >
                  <div className="rounded-xl border border-border/60 bg-card p-6">
                    <span className="text-xs font-bold tracking-wider text-primary">
                      STEP {step.number}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
