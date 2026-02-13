"use client";

import Link from "next/link";
import {
  Briefcase,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  FolderKanban,
  LogOutIcon,
  Plus,
  Search,
} from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBreadcrumbs } from "./breadcrumb-context";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";
import { useSidebarState } from "./sidebar-state";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";

type SuggestionType = "project" | "job" | "invoice";

type SearchSuggestion = {
  id: string;
  type: SuggestionType;
  title: string;
  subtitle: string | null;
  href: string;
};

function suggestionTypeLabel(type: SuggestionType) {
  if (type === "project") return "Project";
  if (type === "job") return "Job";
  return "Invoice";
}

function normalizeQuery(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function splitAddressFromQuery(value: string) {
  const normalized = normalizeQuery(value);
  if (!normalized) return { houseNumber: "", streetAddress: "" };

  const [firstPart, ...restParts] = normalized.split(" ");
  if (/^\d+[A-Za-z0-9-]*$/.test(firstPart)) {
    return {
      houseNumber: firstPart,
      streetAddress: restParts.join(" "),
    };
  }

  return { houseNumber: "", streetAddress: normalized };
}

export function Header() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { crumbs, rightSlot } = useBreadcrumbs();
  const { collapsed, toggleCollapsed } = useSidebarState();
  const currentQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(currentQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectSeed, setNewProjectSeed] = useState(0);
  const [newProjectHouseNumber, setNewProjectHouseNumber] = useState("");
  const [newProjectStreetAddress, setNewProjectStreetAddress] = useState("");
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(currentQuery);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
    setIsSearchFocused(false);
  }, [pathname, currentQuery]);

  useEffect(() => {
    function handleOutsideMouseDown(event: MouseEvent) {
      if (!searchContainerRef.current) return;
      if (searchContainerRef.current.contains(event.target as Node)) return;
      setIsSearchFocused(false);
      setActiveSuggestionIndex(-1);
    }

    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () => document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, []);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(normalized)}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          setSuggestions([]);
          setActiveSuggestionIndex(-1);
          return;
        }

        const payload = (await response.json()) as {
          suggestions?: SearchSuggestion[];
        };
        const nextSuggestions = Array.isArray(payload.suggestions)
          ? payload.suggestions
          : [];

        setSuggestions(nextSuggestions);
        setActiveSuggestionIndex(-1);
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          setSuggestions([]);
          setActiveSuggestionIndex(-1);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  function selectSuggestion(suggestion: SearchSuggestion) {
    setIsSearchFocused(false);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
    router.push(suggestion.href);
  }

  function openNewProjectFromQuery(rawQuery: string) {
    const { houseNumber, streetAddress } = splitAddressFromQuery(rawQuery);

    setNewProjectHouseNumber(houseNumber);
    setNewProjectStreetAddress(streetAddress);
    setNewProjectSeed((current) => current + 1);
    setNewProjectOpen(true);
    setIsSearchFocused(false);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    const canCreateProject = query.trim().length >= 2;
    const optionCount = suggestions.length + (canCreateProject ? 1 : 0);
    const canNavigate = isSearchFocused && optionCount > 0;
    if (!canNavigate) {
      if (event.key === "Escape") {
        setIsSearchFocused(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => {
        if (current < 0) return 0;
        return (current + 1) % optionCount;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => {
        if (current < 0) return optionCount - 1;
        return current === 0 ? optionCount - 1 : current - 1;
      });
      return;
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0) {
      event.preventDefault();
      if (activeSuggestionIndex < suggestions.length) {
        const selected = suggestions[activeSuggestionIndex];
        if (selected) selectSuggestion(selected);
        return;
      }
      if (canCreateProject) {
        openNewProjectFromQuery(query);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsSearchFocused(false);
      setActiveSuggestionIndex(-1);
    }
  }

  const handleGlobalSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = query.trim();
    setIsSearchFocused(false);
    setActiveSuggestionIndex(-1);

    if (!normalized) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  };

  const showSuggestions = isSearchFocused && query.trim().length >= 2;
  const canCreateProject = query.trim().length >= 2;

  return (
    <header className="border-b border-primary/20 bg-background px-4 py-3 rounded-xl">
      <div className="relative grid gap-3 pr-24 sm:pr-36 md:grid-cols-[1fr_minmax(18rem,30rem)_1fr] md:items-center md:gap-4 md:pr-0">
        <div className="absolute right-0 top-0 flex items-center gap-2 md:hidden">
          <ThemeSwitcher />

          <Button
            variant="destructive"
            size="icon"
            className="cursor-pointer sm:hidden"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <LogOutIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="hidden cursor-pointer sm:inline-flex"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>

        <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="hidden md:inline-flex cursor-pointer"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <ChevronsLeft className="size-4" />
            )}
          </Button>

          {crumbs.map((c, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <div
                key={`${c.label}-${idx}`}
                className="flex items-center gap-2"
              >
                {c.href && !isLast ? (
                  <Link className="hover:text-primary hover:underline" href={c.href}>
                    {c.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "font-medium text-primary" : "text-muted-foreground"}
                  >
                    {c.label}
                  </span>
                )}
                {!isLast && <span>&gt;</span>}
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleGlobalSearch}
          className="flex w-full items-center gap-2 md:col-start-2 md:justify-self-center"
        >
          <div className="relative w-full" ref={searchContainerRef}>
            <Input
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search projects, jobs, invoices..."
              className="h-9 border-primary/20 focus-visible:ring-primary/30"
              aria-label="Global search"
              autoComplete="off"
            />

            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-primary/20 bg-background shadow-lg">
                {isLoadingSuggestions ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No matches found.
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto py-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        className={cn(
                          "flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition-colors",
                          activeSuggestionIndex === index
                            ? "bg-primary/10"
                            : "hover:bg-primary/5",
                        )}
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          {suggestion.type === "project" && (
                            <FolderKanban className="mt-0.5 size-4 shrink-0 text-primary" />
                          )}
                          {suggestion.type === "job" && (
                            <Briefcase className="mt-0.5 size-4 shrink-0 text-primary" />
                          )}
                          {suggestion.type === "invoice" && (
                            <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {suggestion.title}
                            </div>
                            {suggestion.subtitle && (
                              <div className="truncate text-xs text-muted-foreground">
                                {suggestion.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                          {suggestionTypeLabel(suggestion.type)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {canCreateProject && (
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-start justify-between gap-3 border-t border-primary/10 px-3 py-2 text-left text-sm transition-colors",
                      activeSuggestionIndex === suggestions.length
                        ? "bg-primary/10"
                        : "hover:bg-primary/5",
                    )}
                    onClick={() => openNewProjectFromQuery(query)}
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <Plus className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          Create New Project
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          Prefill from: {normalizeQuery(query)}
                        </div>
                      </div>
                    </div>
                    <div className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                      Action
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="cursor-pointer border-primary/30 hover:bg-primary/10"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end md:col-start-3 md:justify-self-end">
          {rightSlot}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeSwitcher />
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <NewProjectDialog
        key={`header-new-project-${newProjectSeed}`}
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        initialBuilders={[]}
        initialSubdivisions={[]}
        initialHouseNumber={newProjectHouseNumber}
        initialStreetAddress={newProjectStreetAddress}
      />
    </header>
  );
}
