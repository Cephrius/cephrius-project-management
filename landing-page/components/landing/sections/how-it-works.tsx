"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  HardHat,
  Receipt,
} from "lucide-react";
import {
  EASE_OUT,
  HOVER_SPRING,
  LIST_CARD_HOVER,
  REVEAL_ITEM,
  SECTION_ENTER_DURATION,
  STAGGER_CONTAINER,
} from "@/components/landing/marketing-motion";

const STEPS = [
  {
    step: "01",
    icon: CalendarDays,
    title: "Plan the week",
    body: "Open the 12-month calendar to see what's due, assign crews, and flag overdue jobs before they slip.",
    bullets: [
      "Drag-aware scheduling",
      "Superintendent assignment",
      "Overdue alerts",
    ],
  },
  {
    step: "02",
    icon: HardHat,
    title: "Run the day",
    body: "Field crews see today's stops, mark jobs complete, and the dashboard updates the office in real time.",
    bullets: [
      "Mobile-first crew view",
      "One-tap completion",
      "Live pipeline counters",
    ],
  },
  {
    step: "03",
    icon: Receipt,
    title: "Bill it out",
    body: "Convert completed jobs into invoices, track issued vs. paid, and reconcile against the project ledger.",
    bullets: [
      "Job → invoice in one click",
      "Paid / Issued tracking",
      "Monthly revenue snapshot",
    ],
  },
];

export function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id="how-it-works"
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
          <CalendarClock className="size-4" />
          How JobSyte fits your day
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          From morning huddle to end-of-month billing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
          JobSyte mirrors how sub-contractors actually work — schedule the week,
          dispatch crews, capture the work, and bill it out without re-keying
          anything.
        </p>
      </div>

      <motion.div
        className="mt-12 grid gap-4 lg:grid-cols-3"
        variants={STAGGER_CONTAINER}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <motion.article
              key={step.step}
              variants={REVEAL_ITEM}
              whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
              transition={HOVER_SPRING}
              className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <span className="text-xs font-mono font-semibold tracking-widest text-primary/40">
                  {step.step}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              <ul className="mt-4 space-y-1.5">
                {step.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                    <span className="text-foreground/80">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
