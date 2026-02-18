"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";

const PRIMARY_COLOR_STORAGE_KEY = "theme:primary-color";

const PRIMARY_COLORS = [
  { id: "yellow", label: "Yellow", primary: "#eab308", foreground: "#000000" },
  { id: "blue", label: "Blue", primary: "#2563eb", foreground: "#ffffff" },
  { id: "emerald", label: "Emerald", primary: "#059669", foreground: "#ffffff" },
  { id: "teal", label: "Teal", primary: "#0f766e", foreground: "#ffffff" },
  { id: "amber", label: "Amber", primary: "#d97706", foreground: "#ffffff" },
  { id: "rose", label: "Rose", primary: "#e11d48", foreground: "#ffffff" },
  { id: "violet", label: "Violet", primary: "#7c3aed", foreground: "#ffffff" },
  { id: "slate", label: "Slate", primary: "#334155", foreground: "#ffffff" },
] as const;

type PrimaryColorKey = (typeof PRIMARY_COLORS)[number]["id"];

const DEFAULT_PRIMARY_COLOR: PrimaryColorKey = "yellow";

function applyPrimaryColor(key: PrimaryColorKey) {
  const color = PRIMARY_COLORS.find((c) => c.id === key) ?? PRIMARY_COLORS[0];
  const root = document.documentElement;

  root.style.setProperty("--primary", color.primary);
  root.style.setProperty("--primary-foreground", color.foreground);
  root.style.setProperty("--sidebar-primary", color.primary);
  root.style.setProperty("--sidebar-primary-foreground", color.foreground);
}

export function ThemeSwitcher({
  hideLabel = false,
}: {
  hideLabel?: boolean;
} = {}) {
  const { theme = "system", setTheme } = useTheme();

  const selectedTheme: ThemeMode =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system";

  const [primaryColor, setPrimaryColor] =
    useState<PrimaryColorKey>(DEFAULT_PRIMARY_COLOR);

  const THEME_DELAY_MS = 100;
  const THEME_TRANSITION_MS = 350;

  useEffect(() => {
    const saved = window.localStorage.getItem(
      PRIMARY_COLOR_STORAGE_KEY,
    ) as PrimaryColorKey | null;

    const valid = PRIMARY_COLORS.some((c) => c.id === saved);
    const next = valid && saved ? saved : DEFAULT_PRIMARY_COLOR;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrimaryColor(next);
    applyPrimaryColor(next);
  }, []);

  function setThemeSmooth(next: ThemeMode) {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");

    window.setTimeout(() => {
      setTheme(next);
    }, THEME_DELAY_MS);

    window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, THEME_DELAY_MS + THEME_TRANSITION_MS + 30);
  }

  function setPrimaryColorSmooth(next: PrimaryColorKey) {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");

    setPrimaryColor(next);
    applyPrimaryColor(next);
    window.localStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, next);

    window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, THEME_TRANSITION_MS + 30);
  }

  const ActiveIcon = useMemo(() => {
    if (selectedTheme === "light") return SunIcon;
    if (selectedTheme === "dark") return MoonIcon;
    return MonitorIcon;
  }, [selectedTheme]);

  const activePrimary = useMemo(
    () => PRIMARY_COLORS.find((c) => c.id === primaryColor) ?? PRIMARY_COLORS[0],
    [primaryColor],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Theme"
          className="cursor-pointer border-primary/30 hover:bg-primary/10"
        >
          <ActiveIcon className="size-4" />
          <span className={cn(hideLabel ? "hidden" : "hidden sm:inline")}>
            Theme
          </span>
          <span
            className="size-3 rounded-full border"
            style={{ backgroundColor: activePrimary.primary }}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={selectedTheme}
          onValueChange={(value) => setThemeSmooth(value as ThemeMode)}
        >
          <DropdownMenuRadioItem value="light">
            <SunIcon className="size-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <MoonIcon className="size-4" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <MonitorIcon className="size-4" />
            Auto
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Primary Color</DropdownMenuLabel>

        <DropdownMenuRadioGroup
          value={primaryColor}
          onValueChange={(value) => {
            if (PRIMARY_COLORS.some((c) => c.id === value)) {
              setPrimaryColorSmooth(value as PrimaryColorKey);
            }
          }}
        >
          {PRIMARY_COLORS.map((color) => (
            <DropdownMenuRadioItem key={color.id} value={color.id}>
              <span
                className="size-3 rounded-full border"
                style={{ backgroundColor: color.primary }}
                aria-hidden="true"
              />
              {color.label}
              <PaletteIcon className="ml-auto size-3.5 opacity-50" />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
