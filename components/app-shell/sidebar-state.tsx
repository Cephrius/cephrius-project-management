"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "app-shell:sidebar-collapsed";

type SidebarState = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
};

const SidebarStateContext = createContext<SidebarState | null>(null);

export function SidebarStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return (
        window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1"
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_COLLAPSED_STORAGE_KEY,
        collapsed ? "1" : "0",
      );
    } catch {
      // Ignore storage write issues.
    }
  }, [collapsed]);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed: () => setCollapsed((current) => !current),
    }),
    [collapsed],
  );

  return (
    <SidebarStateContext.Provider value={value}>
      {children}
    </SidebarStateContext.Provider>
  );
}

export function useSidebarState() {
  const context = useContext(SidebarStateContext);
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarStateProvider");
  }
  return context;
}
