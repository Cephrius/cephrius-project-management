"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { APP_URL, REQUEST_DEMO_HREF } from "@/components/landing/marketing-data";
import {
  EASE_OUT,
  HEADER_ENTER_DURATION,
} from "@/components/landing/marketing-motion";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/modules", label: "Modules" },
  { href: "/why-jobsyte", label: "Why JobSyte" },
  { href: "/faq", label: "FAQ" },
  { href: "/request-demo", label: "Request a demo" },
];

export default function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
        <motion.div
          className="absolute -top-40 left-[-10rem] h-[34rem] w-[34rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklch, var(--primary) 35%, transparent) 0%, transparent 70%)",
            willChange: "transform, opacity",
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, 96, 0],
                  scale: [1, 1.06, 1],
                  opacity: [0.7, 0.95, 0.7],
                }
          }
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-56 right-[-12rem] h-[38rem] w-[38rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklch, var(--primary) 22%, transparent) 0%, transparent 72%)",
            willChange: "transform, opacity",
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, -78, 0],
                  scale: [1, 1.05, 1],
                  opacity: [0.6, 0.9, 0.6],
                }
          }
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <motion.div
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 md:px-8"
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: HEADER_ENTER_DURATION, ease: EASE_OUT }}
        >
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="JobSyte home"
            >
              <Image
                src="/jobsyte_banner_light_trans.png"
                alt="JobSyte"
                width={800}
                height={200}
                className="h-16 w-auto sm:h-20 md:h-24 dark:hidden"
                priority
              />
              <Image
                src="/jobsyte_banner_dark_trans.png"
                alt="JobSyte"
                width={800}
                height={200}
                className="hidden h-16 w-auto sm:h-20 md:h-24 dark:block"
                priority
              />
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.slice(0, 5).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 justify-end md:flex">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-4"
              asChild
            >
              <Link href={`${APP_URL}/login`}>Sign in</Link>
            </Button>
            <Button size="sm" className="rounded-full px-4 shadow-sm" asChild>
              <Link href={REQUEST_DEMO_HREF}>
                Request a demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/60 text-foreground md:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </motion.div>

        {mobileOpen ? (
          <div className="border-t border-border/60 bg-background/90 backdrop-blur-xl md:hidden">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 rounded-full"
                  asChild
                >
                  <Link
                    href={`${APP_URL}/login`}
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                </Button>
                <Button size="sm" className="flex-1 rounded-full shadow-sm" asChild>
                  <Link
                    href={REQUEST_DEMO_HREF}
                    onClick={() => setMobileOpen(false)}
                  >
                    Request a demo
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-12 sm:pt-16 md:px-8 md:pt-20">
        {children}
      </div>

      <footer className="relative z-10 border-t border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link
                href="/"
                className="flex items-center"
                aria-label="JobSyte home"
              >
                <Image
                  src="/jobsyte_banner_light_trans.png"
                  alt="JobSyte"
                  width={800}
                  height={200}
                  className="h-24 w-auto sm:h-28 md:h-32 dark:hidden"
                />
                <Image
                  src="/jobsyte_banner_dark_trans.png"
                  alt="JobSyte"
                  width={800}
                  height={200}
                  className="hidden h-24 w-auto sm:h-28 md:h-32 dark:block"
                />
              </Link>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                Construction project management built for sub-contractors. Keep
                your field and office on the same page.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Account
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href={`${APP_URL}/login`}
                    className="hover:text-foreground"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href={REQUEST_DEMO_HREF}
                    className="hover:text-foreground"
                  >
                    Get started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Contact
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="mailto:sales@jobsyte.com"
                    className="hover:text-foreground"
                  >
                    sales@jobsyte.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
            <p>© 2026 JobSyte. All rights reserved.</p>
            <p>Powered by Cephrius Technologies</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
