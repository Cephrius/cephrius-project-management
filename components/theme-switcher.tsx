"use client";

import { useMemo } from "react";
import { MonitorIcon, MoonIcon, SunIcon, WindArrowDown } from "lucide-react";
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

type ThemeMode = "light" | "dark" | "system";

export function ThemeSwitcher() {
  const { theme = "system", setTheme } = useTheme();
  const selectedTheme: ThemeMode =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system";

  const THEME_DELAY_MS = 100;
  const THEME_TRANSITION_MS = 350;

  function setThemeSmooth(next: ThemeMode) {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");

    window.setTimeout(() => {
      setTheme(next);
    }, THEME_DELAY_MS);

    window.setTimeout(
      () => {
        root.classList.remove("theme-transitioning");
      },
      THEME_DELAY_MS + THEME_TRANSITION_MS + 30,
    );
  }

  const ActiveIcon = useMemo(() => {
    if (selectedTheme === "light") return SunIcon;
    if (selectedTheme === "dark") return MoonIcon;
    return MonitorIcon;
  }, [selectedTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
        >
          <ActiveIcon />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedTheme}
          onValueChange={(value) => setThemeSmooth(value as ThemeMode)}
          >
          <DropdownMenuRadioItem value="light">
            <SunIcon />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <MoonIcon />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <MonitorIcon />
            Auto
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
