"use client";

import { useEffect } from "react";
import { type Crumb, useBreadcrumbs } from "./breadcrumb-context";

export function BreadcrumbSetter({
  crumbs,
  rightSlot,
}: {
  crumbs: Crumb[];
  rightSlot?: React.ReactNode;
}) {
  const { setCrumbs, setRightSlot } = useBreadcrumbs();

  useEffect(() => {
    setCrumbs(crumbs);
    setRightSlot(rightSlot ?? null);

    return () => {
      setRightSlot(null);
    };
  }, [crumbs, rightSlot, setCrumbs, setRightSlot]);

  return null;
}
