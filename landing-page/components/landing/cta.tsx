"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section id="pricing" className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-balance font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ready to simplify your operations?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
          Join contractors who are spending less time on paperwork and more time
          on the job site.
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8"
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8"
          >
            Get started for free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          Free while in early access. No credit card required.
        </motion.p>
      </motion.div>
    </section>
  );
}
