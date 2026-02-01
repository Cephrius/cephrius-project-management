"use client"

import React, { useContext, useMemo } from "react";

export type Crumb = {label: string, href?: string};

type BreadcrumbState = {
    crumbs: Crumb[];
    setCrumbs: (crumbs: Crumb[]) => void;
    rightSlot: React.ReactNode | null;
    setRightSlot: (node: React.ReactNode | null) => void;
};

const BreadcrumbContext = React.createContext<BreadcrumbState | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
    const [crumbs, setCrumbs] = React.useState<Crumb[]>([]);
    const [rightSlot, setRightSlot] = React.useState<React.ReactNode | null>(null);

    const value = useMemo(
        () => ({ crumbs, setCrumbs, rightSlot, setRightSlot }),
        [crumbs, rightSlot]
    );

    return (
        <BreadcrumbContext.Provider value={value}>
            {children}
        </BreadcrumbContext.Provider>
    );

}

export function useBreadcrumbs() {
    const ctx = useContext(BreadcrumbContext);
    if (!ctx) throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");
    return ctx;
}