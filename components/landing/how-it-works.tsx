"use client"

import { motion } from "framer-motion"

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Sign up in seconds. Add your company details and you're ready to go.",
  },
  {
    number: "02",
    title: "Add your projects",
    description: "Enter projects manually or bulk-import via CSV. Organize by builder and subdivision.",
  },
  {
    number: "03",
    title: "Schedule and track jobs",
    description: "Add jobs to projects, set dates, and mark them complete as work gets done.",
  },
  {
    number: "04",
    title: "Invoice and get paid",
    description: "Generate invoices from completed jobs. Send them out and track payment status.",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24 bg-secondary">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent-foreground/70">
            How it works
          </p>
          <h2 className="text-balance font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Up and running in minutes
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-8 md:grid-cols-2"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className="flex gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent"
              >
                <span className="font-mono text-sm font-bold text-accent-foreground">
                  {step.number}
                </span>
              </motion.div>
              <div>
                <h3 className="mb-1 font-mono text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
