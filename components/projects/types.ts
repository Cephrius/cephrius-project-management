export type ProjectLifecycleStatus = "active" | "completed" | "not-started";
export type ProjectBillingStatus = "invoiced" | "paid";

export type ProjectListItem = {
  id: string;
  project_address: string;
  builder_name: string | null;
  subdivision: string | null;
  builder_id: string | null;
  subdivision_id: string | null;
  created_at: string;
  job_count: number;
  open_job_count: number;
  last_activity_at: string | null;
  status: ProjectLifecycleStatus;
  billing_statuses: ProjectBillingStatus[];
  invoiced_job_count: number;
  paid_job_count: number;
  crew_names: string[];
};

export type LookupItem = {
  id: string;
  name: string;
};
