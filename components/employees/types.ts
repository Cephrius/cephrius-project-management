export type EmploymentType = "full_time" | "part_time" | "contractor";
export type PayType = "hourly" | "per_job" | "salary";
export type PaymentMethod = "check" | "wire" | "card" | "epay";
export type WorkAssignmentType = "employee" | "crew";

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contractor: "Contractor",
};

export const PAY_TYPE_LABELS: Record<PayType, string> = {
  hourly: "Hourly",
  per_job: "Per Job",
  salary: "Salary",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  check: "Check",
  wire: "Wire Transfer",
  card: "Card",
  epay: "E-Pay",
};

export const CREW_SPECIALIZATIONS = [
  "Framing",
  "Drywall",
  "Electrical",
  "Plumbing",
  "Roofing",
  "Painting",
  "Concrete",
  "Landscaping",
  "HVAC",
  "Flooring",
  "General",
  "Other",
] as const;

export type EmployeeProfile = {
  id: string;
  name: string;
  // Legacy — kept for backward compat display
  contact_info: string | null;
  // Basic info
  role: string | null;
  job_title: string | null;
  employment_type: EmploymentType | null;
  is_active: boolean;
  // Contact
  email: string | null;
  phone: string | null;
  address: string | null;
  // Work & Pay
  hourly_rate: number | null;
  pay_type: PayType | null;
  hire_date: string | null;
  // Payment
  payment_method: PaymentMethod | null;
  payment_details: Record<string, string> | null;
  // Notes
  notes: string | null;
  created_at: string;
};

export type CrewProfile = {
  id: string;
  name: string;
  // Legacy
  notes: string | null;
  // New fields
  description: string | null;
  crew_lead_id: string | null;
  crew_lead_name: string | null;
  specialization: string | null;
  is_active: boolean;
  created_at: string;
  member_ids: string[];
  member_names: string[];
};

export type WorkforceMetrics = {
  jobCountByEmployeeId: Record<string, number>;
  jobCountByCrewId: Record<string, number>;
  totalPaidCentsByEmployeeId: Record<string, number>;
  totalPaidCentsByCrewId: Record<string, number>;
  grandTotalPaidCents: number;
};

export type WorkforceJob = {
  id: string;
  title: string;
  project_id: string;
  project_address: string;
  created_at: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_by_type: WorkAssignmentType | null;
  completed_by_id: string | null;
  completed_by_name: string | null;
};

export type WorkforcePayment = {
  id: string;
  job_id: string;
  paid_to_type: WorkAssignmentType;
  paid_to_id: string;
  amount_cents: number;
  paid_at: string;
  refunded_at: string | null;
};
