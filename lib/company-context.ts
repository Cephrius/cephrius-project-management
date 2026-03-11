"use client";

import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export type Company = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  role: string;
};

type CompanyContextValue = {
  companies: Company[];
  activeCompany: Company | null;
  setActiveCompanyId: (id: string) => void;
};

const CompanyContext = createContext<CompanyContextValue>({
  companies: [],
  activeCompany: null,
  setActiveCompanyId: () => {},
});

const STORAGE_KEY = "jobsyte:active-company-id";

export function CompanyProvider({
  companies,
  children,
}: {
  companies: Company[];
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === "undefined") return companies[0]?.id ?? "";
    return localStorage.getItem(STORAGE_KEY) ?? companies[0]?.id ?? "";
  });

  const activeCompany =
    companies.find((c) => c.id === activeId) ?? companies[0] ?? null;

  const setActiveCompanyId = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem(STORAGE_KEY, id);
    // Set cookie so server components can read the active company
    document.cookie = `jobsyte:active-company-id=${id};path=/;max-age=31536000;samesite=lax`;
  }, []);

  const value: CompanyContextValue = {
    companies,
    activeCompany,
    setActiveCompanyId,
  };

  return createElement(CompanyContext.Provider, { value }, children);
}

export function useCompany() {
  return useContext(CompanyContext);
}
