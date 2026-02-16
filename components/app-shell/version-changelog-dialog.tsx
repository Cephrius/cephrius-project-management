"use client";

import { useEffect, useState } from "react";
import { Bug, History, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LATEST_RELEASE, RELEASE_NOTES, type ReleaseNote } from "@/lib/release-notes";

const LAST_SEEN_RELEASE_KEY = "jobsyte:last-seen-release-version";

function ReleaseSection({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: "changes" | "fixes" | "major";
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        {icon === "changes" || icon === "major" ? (
          <Sparkles className="size-4" />
        ) : (
          <Bug className="size-4" />
        )}
        {title}
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="rounded-md border border-primary/10 bg-primary/[0.03] px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReleaseCard({
  release,
  latest = false,
}: {
  release: ReleaseNote;
  latest?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border p-4",
        latest ? "border-primary/30 bg-primary/[0.04]" : "border-primary/15 bg-background",
      )}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 ">
        <div className="text-base font-semibold text-primary">{release.version}</div>
        {latest && <Badge className="bg-primary text-primary-foreground">Latest</Badge>}
        <div className="text-xs text-muted-foreground">{release.releasedOn}</div>
      </div>

      <div className="space-y-4">
        <ReleaseSection
          title="Major Additions"
          items={release.majorAdditions ?? []}
          icon="major"
        />
        <ReleaseSection title="Changes" items={release.changes} icon="changes" />
        <ReleaseSection title="Bug Fixes" items={release.bugFixes} icon="fixes" />
      </div>
    </section>
  );
}

export function VersionChangelogDialog({ collapsed }: { collapsed?: boolean }) {
  const [open, setOpen] = useState(false);
  const previousReleases = RELEASE_NOTES.slice(1);

  useEffect(() => {
    try {
      const lastSeenVersion = window.localStorage.getItem(LAST_SEEN_RELEASE_KEY);
      if (lastSeenVersion === LATEST_RELEASE.version) return;

      // Auto-open once for newly published versions and mark as seen.
      window.localStorage.setItem(LAST_SEEN_RELEASE_KEY, LATEST_RELEASE.version);
      const timer = window.setTimeout(() => setOpen(true), 500);
      return () => window.clearTimeout(timer);
    } catch {
      // Ignore storage errors and keep default closed state.
    }
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;

    try {
      window.localStorage.setItem(LAST_SEEN_RELEASE_KEY, LATEST_RELEASE.version);
    } catch {
      // Ignore storage errors.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-pointer rounded-md px-1 py-0.5 transition hover:bg-primary/10 hover:text-primary",
            collapsed && "mx-auto",
          )}
          aria-label={`Open release notes (${LATEST_RELEASE.version})`}
        >
          {LATEST_RELEASE.version}
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[85dvh] max-w-none sm:max-w-none w-[min(85vw,650px)] gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-primary/15 bg-primary/[0.04] px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <History className="size-3.5" />
            Release Notes
          </div>
          <DialogTitle className="text-xl">What&apos;s New in JobSyte</DialogTitle>
          <DialogDescription>
            Latest updates plus previous versions, including shipped changes and bug fixes.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85dvh-7rem)]">
          <div className="space-y-4 p-5">
            <ReleaseCard release={LATEST_RELEASE} latest />

            {previousReleases.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Previous Versions
                </div>
                {previousReleases.map((release) => (
                  <ReleaseCard key={release.version} release={release} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
