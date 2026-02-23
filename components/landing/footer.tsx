"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="border-t border-border px-6 py-12"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <span className="text-xs font-bold text-accent-foreground font-mono">JS</span>
          </div>
          <span className="text-sm font-semibold text-foreground font-mono">JobSyte</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </Link>
          <Link href="#pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          {"© 2026 JobSyte. All rights reserved."}
        </p>
      </div>
    </motion.footer>
  )
}
