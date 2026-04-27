"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { HOME_BUILDER_LOGO_WHEEL } from "@/components/landing/marketing-data";
import {
  EASE_OUT,
  HOVER_SPRING,
  LOGO_CARD_HOVER,
  LOGO_MARQUEE_DURATION,
  SECTION_ENTER_DURATION,
} from "@/components/landing/marketing-motion";

export function BuildersSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className="mt-24 text-center"
      initial={
        shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: SECTION_ENTER_DURATION, ease: EASE_OUT }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Trusted by sub-contractors working with national builders
      </p>
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card/70 py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
        <motion.div
          className="flex w-max items-center gap-4 px-4"
          animate={shouldReduceMotion ? undefined : { x: ["0%", "-50%"] }}
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: LOGO_MARQUEE_DURATION,
                  ease: "linear",
                  repeat: Infinity,
                }
          }
          style={{ willChange: "transform" }}
        >
          {HOME_BUILDER_LOGO_WHEEL.map((logo, index) => (
            <motion.div
              key={`${logo.src}-${index}`}
              className="flex h-20 w-44 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white px-4 py-3 shadow-sm ring-1 ring-black/5"
              whileHover={shouldReduceMotion ? undefined : LOGO_CARD_HOVER}
              transition={HOVER_SPRING}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={176}
                height={68}
                className="h-auto max-h-12 w-full object-contain"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
