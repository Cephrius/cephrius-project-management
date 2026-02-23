"use client";

import { motion } from "framer-motion";

export function AnimatedGradientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full blur-3xl dark:hidden"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--primary) / 0.28) 0%, transparent 68%)",
        }}
        animate={{
          x: [-80, 80, -80],
          y: [0, 40, 0],
          scale: [1, 1.08, 1],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -top-56 right-[-8rem] h-[36rem] w-[36rem] rounded-full blur-3xl dark:hidden"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--accent) / 0.2) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -70, 0],
          y: [20, -20, 20],
          scale: [1, 1.06, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -top-44 left-1/2 hidden h-[44rem] w-[44rem] -translate-x-1/2 rounded-full blur-3xl dark:block"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--primary) / 0.24) 0%, transparent 68%)",
        }}
        animate={{
          x: [-70, 70, -70],
          y: [0, 35, 0],
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -top-52 left-[-9rem] hidden h-[38rem] w-[38rem] rounded-full blur-3xl dark:block"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--accent) / 0.18) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 70, 0],
          y: [20, -25, 20],
          scale: [1, 1.05, 1],
          opacity: [0.24, 0.42, 0.24],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

