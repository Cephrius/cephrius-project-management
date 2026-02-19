import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-card p-8 text-center shadow-lg shadow-primary/5 sm:p-12">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to take control of your projects?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Join contractors who use JobSyte to stay organized, get paid faster,
            and grow their business. Start for free today.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full gap-2 sm:w-auto" asChild>
              <Link href="/signup">
                Create Free Account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/login">Already have an account?</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
