"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";
import { deleteRecentSearch, clearRecentSearches } from "@/app/(jobsyte-app)/search/actions";

export function RecentSearches({ recents }: { recents: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const remove = (value: string) => {
    startTransition(async () => {
      await deleteRecentSearch(value);
      router.refresh();
    });
  };

  const clearAll = () => {
    startTransition(async () => {
      await clearRecentSearches();
      router.refresh();
    });
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Clock className="size-4" />
          Recent searches
        </div>
        {recents.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            disabled={isPending}
            className="text-xs font-medium text-muted-foreground transition hover:text-primary disabled:opacity-50"
          >
            Clear all
          </button>
        )}
      </div>
      {recents.length === 0 ? (
        <div className="px-4 py-6 text-sm text-muted-foreground">
          No recent searches yet. Try searching for the search bar.
        </div>
      ) : (
        <ul className="divide-y">
          {recents.map((value) => (
            <li key={value} className="group flex items-center gap-2 px-2 py-1">
              <Link
                href={`/search?q=${encodeURIComponent(value)}`}
                className="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition hover:bg-muted/40"
              >
                <Clock className="size-3.5 text-muted-foreground" />
                <span className="truncate">{value}</span>
              </Link>
              <button
                type="button"
                onClick={() => remove(value)}
                disabled={isPending}
                aria-label={`Remove ${value} from recent searches`}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100 disabled:opacity-50"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
