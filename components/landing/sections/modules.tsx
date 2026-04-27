"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import { MODULES } from "@/components/landing/marketing-data";
import {
  EASE_OUT,
  HOVER_SPRING,
  LIST_CARD_HOVER,
  REVEAL_ITEM,
  SECTION_ENTER_DURATION,
  STAGGER_CONTAINER,
} from "@/components/landing/marketing-motion";

export function ModulesSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id="modules"
      className="mt-24"
      initial={
        shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
    >
      <div className="grid items-end gap-6 lg:grid-cols-2">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <LayoutDashboard className="size-4" />
            One workspace for the whole business
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Every module, wired together
          </h2>
        </div>
        <p className="text-muted-foreground md:text-lg">
          No more juggling spreadsheets, calendars, and accounting docs.
          Projects feed jobs, jobs feed invoices, invoices feed accounting —
          and a single search bar covers all of it.
        </p>
      </div>

      <motion.div
        className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        variants={STAGGER_CONTAINER}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.title}
              variants={REVEAL_ITEM}
              whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
              transition={HOVER_SPRING}
              className="rounded-xl border border-primary/20 bg-card/80 p-4 backdrop-blur transition-colors hover:border-primary/40"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" />
              </div>
              <p className="mt-3 text-sm font-semibold">{mod.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{mod.body}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
