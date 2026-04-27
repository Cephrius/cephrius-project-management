"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2, HardHat } from "lucide-react";
import { WHY_JOBSYTE_PAINS } from "@/components/landing/marketing-data";
import {
  EASE_OUT,
  HOVER_SPRING,
  LIST_CARD_HOVER,
  REVEAL_ITEM,
  SECTION_ENTER_DURATION,
  STAGGER_CONTAINER,
} from "@/components/landing/marketing-motion";

export function WhyJobSyteSection() {
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
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          <HardHat className="size-4" />
          Built for sub-contractor reality
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Stop pretending PM software made for general contractors fits your crew
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          JobSyte was shaped by sub-contractors running grading, framing, and
          finishing crews. Every screen earns its place — nothing exists just
          because enterprise PM tools have it.
        </p>
      </div>

      <motion.div
        className="mt-10 grid gap-4 md:grid-cols-2"
        variants={STAGGER_CONTAINER}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {WHY_JOBSYTE_PAINS.map((row, idx) => (
          <motion.article
            key={`pain-${idx}`}
            variants={REVEAL_ITEM}
            whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
            transition={HOVER_SPRING}
            className="grid gap-4 rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur md:grid-cols-2"
          >
            <div className="flex gap-3">
              <AlertTriangle className="size-5 shrink-0 text-destructive" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  Before JobSyte
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{row.pain}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  With JobSyte
                </p>
                <p className="mt-1 text-sm text-foreground">{row.fix}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
