import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-medium text-primary">
              Built for contractors
            </span>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Manage your projects.
            <span className="block text-primary">
              Streamline your business.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            The all-in-one platform for subcontractors to track projects, schedule jobs,
            generate invoices, and stay on top of every detail in the field.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full gap-2 sm:w-auto" asChild>
              <Link href="/signup">
                Start Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto" asChild>
              <Link href="/login">Sign In to Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-4xl sm:mt-20">
          <div className="rounded-xl border border-border/60 bg-card shadow-2xl shadow-primary/5">
            <Image
              src="/images/hero-dashboard.jpg"
              alt="JobSyte dashboard showing project management, job scheduling, and invoice tracking"
              width={1200}
              height={675}
              className="rounded-xl"
              priority
            />
          </div>
          <div className="pointer-events-none absolute -inset-x-10 -bottom-10 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>
    </section>
  );
}
