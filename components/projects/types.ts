export type ProjectListItem = {
  id: string;
  project_address: string;
  builder_name: string | null;
  subdivision: string | null;
  created_at: string;
  job_count: number;
  open_job_count: number;
  last_activity_at: string | null;
  status: "active" | "completed" | "not-started";
  crew_names: string[];
};

export type LookupItem = {
  id: string;
  name: string;
};
