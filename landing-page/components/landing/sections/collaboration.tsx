"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import {
  COLLABORATION_CARDS,
  REQUEST_DEMO_HREF,
  type CollaborationCard,
} from "@/components/landing/marketing-data";
import {
  COLLABORATION_CARD_HOVER,
  EASE_OUT,
  HOVER_SPRING,
  REVEAL_ITEM,
  SECTION_ENTER_DURATION,
  STAGGER_CONTAINER,
} from "@/components/landing/marketing-motion";

function CollaborationVisual({
  visual,
}: {
  visual: CollaborationCard["visual"];
}) {
  if (visual === "invite") {
    return (
      <div className="space-y-3">
        {[
          { name: "Knockdown", line: "24151 Wayland St", badge: "Due today" },
          { name: "Rough Grade", line: "35523 Pontiac Dr", badge: "Due today" },
          {
            name: "Final Grade",
            line: "112 Sample Street",
            badge: "Incomplete",
          },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.line}</p>
            </div>
            <div className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              {item.badge}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visual === "edit") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-background p-3">
          <p className="text-sm font-medium">Project 35523 Pontiac Dr</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Jobs: Rough Grade, Final Grade, Inspection.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Pipeline Status</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              106 open
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            {["Projects", "Jobs", "Invoices"].map((name) => (
              <span
                key={name}
                className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Invoice Summary</p>
          <p className="mt-1 text-xs text-muted-foreground">
            140 invoices issued in February. Total amount issued: $44,314.00.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>
      <div className="mt-3 rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-xs text-muted-foreground">
        Recent invoice: INV-2060204-9236
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Billing snapshot</span>
        <span>Open Invoices</span>
      </div>
    </div>
  );
}

export function CollaborationSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id="collaboration"
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
          <Users className="size-4" />
          Operations visibility
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          Run projects, jobs, and invoices from one dashboard
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          JobSyte keeps schedule focus, pipeline health, and billing activity
          connected so your team can move faster with fewer handoffs.
        </p>
      </div>

      <motion.div
        className="mt-10 grid gap-6 lg:grid-cols-3"
        variants={STAGGER_CONTAINER}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {COLLABORATION_CARDS.map((card) => (
          <motion.article
            key={card.title}
            variants={REVEAL_ITEM}
            style={{ transformPerspective: 1200 }}
            whileHover={
              shouldReduceMotion ? undefined : COLLABORATION_CARD_HOVER
            }
            transition={HOVER_SPRING}
          >
            <div className="rounded-3xl border border-border bg-card p-5">
              <CollaborationVisual visual={card.visual} />
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">
              {card.title}
            </h3>
            <p className="mt-2 text-muted-foreground">{card.description}</p>
            <Link
              href={REQUEST_DEMO_HREF}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              Explore module
              <ArrowRight className="size-4" />
            </Link>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}
