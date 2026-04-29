import Link from "next/link";
import { requireEmployee } from "@/lib/auth/employee";
import { LogoutButton } from "./logout-button";

// Onboarding: all signed-in employee pages use this shell. Contractor app shell
// lives in `components/app-shell/*`; this app is intentionally smaller and
// mobile-first for field workers.
export const dynamic = "force-dynamic";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const employee = await requireEmployee();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-semibold tracking-tight">
            JobSyte <span className="text-muted-foreground">Employee</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm sm:flex">
            <Link
              href="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/my-jobs"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              My Jobs
            </Link>
            <Link
              href="/all-jobs"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Open Jobs
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {employee.name}
            </span>
            <LogoutButton />
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex items-center justify-around border-t px-4 py-2 text-xs sm:hidden">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link
            href="/my-jobs"
            className="text-muted-foreground hover:text-foreground"
          >
            My Jobs
          </Link>
          <Link
            href="/all-jobs"
            className="text-muted-foreground hover:text-foreground"
          >
            Open Jobs
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
