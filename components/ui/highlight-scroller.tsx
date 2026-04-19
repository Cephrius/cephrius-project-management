"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const HIGHLIGHT_CLASSES = [
  "ring-2",
  "ring-primary",
  "ring-offset-2",
  "ring-offset-background",
  "rounded-md",
  "animate-pulse",
];

const HIGHLIGHT_DURATION_MS = 15000;

export function HighlightScroller() {
  const params = useSearchParams();
  const id = params.get("highlight");

  useEffect(() => {
    if (!id) return;
    const el = document.querySelector<HTMLElement>(
      `[data-highlight-id="${CSS.escape(id)}"]`,
    );
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add(...HIGHLIGHT_CLASSES);

    const stop = () => {
      el.classList.remove(...HIGHLIGHT_CLASSES);
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", stop, true);
      document.removeEventListener("keydown", stop, true);
    };

    const timer = window.setTimeout(stop, HIGHLIGHT_DURATION_MS);
    document.addEventListener("pointerdown", stop, true);
    document.addEventListener("keydown", stop, true);

    return stop;
  }, [id]);

  return null;
}
