export type JobRow = {
  id: string;
  company_id: string;
  project_id: string;
  title: string;
  superintendent: string | null;
  price_cents: number | null;
  scheduled_completion: string | null;
  is_completed: boolean;
  completed_at: string | null;
  completed_by_type: "employee" | "crew" | null;
  completed_by_id: string | null;
  completed_by_name: string | null;
  created_at: string;
};

export type ProjectLite = {
  id: string;
  project_address: string | null;
  builder_name: string | null;
  subdivision: string | null;
};

export type JobWithProject = JobRow & { project: ProjectLite | null };

export function formatPrice(cents: number | null): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
