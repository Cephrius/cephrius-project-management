import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for getting started with a few projects.",
    features: [
      "Up to 5 active projects",
      "Unlimited jobs per project",
      "Basic invoice generation",
      "Dashboard overview",
      "Email support",
    ],
    cta: "Get Started",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing contractors managing multiple job sites.",
    features: [
      "Unlimited projects",
      "Unlimited jobs & invoices",
      "12-month calendar view",
      "Advanced search",
      "Data export (JSON)",
      "Invoice reminders",
      "Weekly email summaries",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    featured: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "/month",
    description: "For teams and established contracting businesses.",
    features: [
      "Everything in Pro",
      "Multi-user accounts",
      "Custom invoice branding",
      "API access",
      "Dedicated account manager",
      "Phone support",
    ],
    cta: "Contact Sales",
    href: "/signup",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Start free and scale as your business grows. No hidden fees.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-xl border p-6 transition-shadow",
                plan.featured
                  ? "border-primary bg-card shadow-xl shadow-primary/10"
                  : "border-border/60 bg-card hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.featured ? "default" : "outline"}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
