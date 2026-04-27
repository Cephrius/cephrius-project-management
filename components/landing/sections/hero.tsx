"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REQUEST_DEMO_HREF } from "@/components/landing/marketing-data";
import {
  CTA_HOVER,
  HERO_ITEM,
  HERO_STAGGER_CONTAINER,
  HOVER_SPRING,
} from "@/components/landing/marketing-motion";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className="mx-auto max-w-3xl text-center"
      variants={HERO_STAGGER_CONTAINER}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate="visible"
    >
      <motion.div
        variants={HERO_ITEM}
        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-foreground/80 shadow-sm"
      >
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          <Sparkles className="size-3" />
          Live
        </span>
        Now in early access for sub-contractors
      </motion.div>
      <motion.h1
        variants={HERO_ITEM}
        className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
      >
        Construction project management,{" "}
        <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
          built for the field
        </span>
      </motion.h1>
      <motion.p
        variants={HERO_ITEM}
        className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl"
      >
        JobSyte keeps projects, job schedules, invoices, dashboard reporting,
        and global search in one workflow — so your field and office teams move
        as one.
      </motion.p>

      <motion.div
        variants={HERO_ITEM}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <motion.div
          whileHover={shouldReduceMotion ? undefined : CTA_HOVER}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={HOVER_SPRING}
        >
          <Button size="lg" className="rounded-full px-7 shadow-md" asChild>
            <Link href={REQUEST_DEMO_HREF}>
              Request a demo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
      <motion.div
        variants={HERO_ITEM}
        className="mt-7 hidden items-center justify-center text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground md:flex"
        animate={
          shouldReduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }
        }
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        Scroll to explore
        <ChevronDown className="ml-2 size-4" />
      </motion.div>
    </motion.section>
  );
}
