"use client"

import {
  FolderOpen,
  CalendarDays,
  FileText,
  Search,
  Settings,
  Bell,
} from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: FolderOpen,
    title: "Project Management",
    description:
      "Organize projects by subdivision, builder, and street. Import in bulk via CSV or create them one at a time.",
  },
  {
    icon: CalendarDays,
    title: "Job Scheduling",
    description:
      "Track jobs with a 12-month calendar view. Mark complete, assign superintendents, and filter by status.",
  },
  {
    icon: FileText,
    title: "Invoicing",
    description:
      "Generate invoices per project or by builder. Print-friendly layouts with historical snapshots preserved.",
  },
  {
    icon: Search,
    title: "Global Search",
    description:
      "Instantly find projects, jobs, and invoices. Quick-create new projects right from the search bar.",
  },
  {
    icon: Settings,
    title: "Business Settings",
    description:
      "Manage your company profile, set invoice defaults, and control appearance with theme and color options.",
  },
  {
    icon: Bell,
    title: "Automated Reminders",
    description:
      "Invoice due-date reminders, weekly summaries, and monthly updates delivered to your inbox automatically.",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent-foreground/70">
            Features
          </p>
          <h2 className="text-balance font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to run your operation
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mb-2 font-mono text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
