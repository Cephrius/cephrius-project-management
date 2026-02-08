export type ProjectListItem = {
  id: string;
  project_address: string;
  builder_name: string | null;
  subdivision: string | null;
  job_count?: number;
};

export type LookupItem = {
  id: string;
  name: string;
};
