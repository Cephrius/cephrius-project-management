"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileText } from "lucide-react";
import { FAQ_ITEMS } from "@/components/landing/marketing-data";
import {
  EASE_OUT,
  HOVER_SPRING,
  LIST_CARD_HOVER,
  REVEAL_ITEM,
  SECTION_ENTER_DURATION,
  STAGGER_CONTAINER,
} from "@/components/landing/marketing-motion";

export function FaqSection() {
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
          <FileText className="size-4" />
          Frequently asked
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          The questions sub-contractors actually ask before switching
        </h2>
      </div>

      <motion.div
        className="mt-10 grid gap-4 md:grid-cols-2"
        variants={STAGGER_CONTAINER}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {FAQ_ITEMS.map(({ q, a }) => (
          <motion.article
            key={q}
            variants={REVEAL_ITEM}
            whileHover={shouldReduceMotion ? undefined : LIST_CARD_HOVER}
            transition={HOVER_SPRING}
            className="rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur"
          >
            <h3 className="text-base font-semibold tracking-tight">{q}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{a}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
