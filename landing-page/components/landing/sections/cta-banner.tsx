"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REQUEST_DEMO_HREF } from "@/components/landing/marketing-data";
import {
  CTA_HOVER,
  EASE_OUT,
  HOVER_SPRING,
  SECTION_ENTER_DURATION,
} from "@/components/landing/marketing-motion";

type CtaBannerProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
};

export function CtaBanner({
  title = "Ready to run your crews on JobSyte?",
  description = "See how schedule, jobs, invoices, and accounting come together in one workflow built for sub-contractors.",
  ctaLabel = "Request a demo",
}: CtaBannerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className="mt-24"
      initial={
        shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
    >
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card/70 to-card/40 p-8 text-center backdrop-blur md:p-12">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
          {description}
        </p>
        <div className="mt-8 flex items-center justify-center">
          <motion.div
            whileHover={shouldReduceMotion ? undefined : CTA_HOVER}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={HOVER_SPRING}
          >
            <Button size="lg" className="rounded-full px-7 shadow-md" asChild>
              <Link href={REQUEST_DEMO_HREF}>
                {ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
