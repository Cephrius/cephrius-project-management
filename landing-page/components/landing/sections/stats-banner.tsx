"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  EASE_OUT,
  SECTION_ENTER_DURATION,
} from "@/components/landing/marketing-motion";

const STATS = [
  { value: "1", label: "Login that opens every workflow" },
  { value: "8", label: "Modules wired into a shared ledger" },
  { value: "12mo", label: "Forward calendar visibility" },
  { value: "0", label: "Spreadsheets you need to maintain" },
];

export function StatsBannerSection() {
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
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-card/40 p-8 backdrop-blur md:p-10">
        <div className="grid gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-semibold tracking-tight text-primary md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
