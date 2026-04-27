"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { CAPABILITIES } from "@/components/landing/marketing-data";
import {
  EASE_OUT,
  HOVER_SPRING,
  LIST_CARD_HOVER,
  REVEAL_ITEM,
  SECTION_ENTER_DURATION,
  STAGGER_CONTAINER,
} from "@/components/landing/marketing-motion";

export function CapabilitiesSection() {
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
          <Sparkles className="size-4" />
          Capabilities
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Everything you need to run a sub-contracting business — already wired up
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Not a roadmap. Not coming soon. These are the surfaces shipping in
          JobSyte today.
        </p>
      </div>

      <motion.div
        className="mt-10 grid gap-4 md:grid-cols-2"
        variants={STAGGER_CONTAINER}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {CAPABILITIES.map(({ Icon, title, outcome }) => (
          <motion.article
            key={title}
            variants={REVEAL_ITEM}
            whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
            transition={HOVER_SPRING}
            className="rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur"
          >
            <div className="flex size-10 items-center justify-center rounded-lg border border-border/70 bg-background text-primary">
              <Icon className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{outcome}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
