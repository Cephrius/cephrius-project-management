"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { FEATURE_HIGHLIGHTS } from "@/components/landing/marketing-data";
import {
  EASE_OUT,
  HOVER_SPRING,
  LIST_CARD_HOVER,
  REVEAL_ITEM,
  SECTION_ENTER_DURATION,
  STAGGER_CONTAINER,
} from "@/components/landing/marketing-motion";

export function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id="features"
      className="mt-20"
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
          Why JobSyte
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Everything a sub-contractor needs, none of the noise
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
          Six core surfaces, one shared source of truth. JobSyte was built
          alongside crews in the field, not assumed from a spreadsheet.
        </p>
      </div>

      <motion.div
        className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={STAGGER_CONTAINER}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {FEATURE_HIGHLIGHTS.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.article
              key={feature.title}
              variants={REVEAL_ITEM}
              whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
              transition={HOVER_SPRING}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur transition-colors hover:border-primary/40"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
              />
              <div className="relative flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="relative mt-5 text-lg font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="relative mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.article>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
