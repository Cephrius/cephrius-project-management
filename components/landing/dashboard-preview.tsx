"use client"

import { motion } from "framer-motion"

export function DashboardPreview() {
  return (
    <section className="px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-5xl"
      >
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-foreground/5">
          <div className="border-b border-border px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="rounded-md bg-secondary px-4 py-1 text-xs text-muted-foreground">
                app.jobsyte.io
              </div>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-02-19%20140401-FYxj0UjNEtikjD9nw13IqbLtSGpMMa.png"
            alt="JobSyte dashboard showing schedule focus, work pipeline, projects overview, jobs calendar, and recent invoices"
            className="w-full"
          />
        </div>
      </motion.div>
    </section>
  )
}
