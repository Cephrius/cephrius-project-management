"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center px-6 pt-20">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5"
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-accent"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs text-muted-foreground">Now in early access</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-balance font-mono text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl"
        >
          Contractor operations, simplified
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          Manage projects, schedule jobs, and send invoices from one place. Built for contractors who want less admin and more time on the job.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary gap-2 px-8">
            See how it works
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          No credit card required
        </motion.p>
      </div>
    </section>
  )
}
