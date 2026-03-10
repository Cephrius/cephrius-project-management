"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";
import { revalidatePath } from "next/cache";

type IdName = { id: string; name: string };

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toTitleCase(value: string) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";

  return normalized.replace(/[A-Za-z]+/g, (segment) => {
    return segment[0].toUpperCase() + segment.slice(1).toLowerCase();
  });
}

function normalizeName(value: string) {
  return toTitleCase(value);
}

function normalizeProjectAddress(value: string) {
  return toTitleCase(value);
}

function normalizeHouseNumber(value: string) {
  return normalizeWhitespace(value);
}

function isValidHouseNumber(value: string) {
  return /^\d+$/.test(value);
}

function normalizeStreetAddress(value: string) {
  return toTitleCase(value);
}

function combineProjectAddress(houseNumber: string, streetAddress: string) {
  return normalizeProjectAddress(`${houseNumber} ${streetAddress}`);
}

function isMissingDeletedAtColumnError(message: string | undefined) {
  const normalized = (message ?? "").toLowerCase();
  return normalized.includes("column") && normalized.includes("deleted_at");
}

function normalizeHeader(value: string) {
  return normalizeWhitespace(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parsePriceToCents(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

function parseScheduledDate(value: string) {
  const raw = normalizeWhitespace(value);
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!slashMatch) return null;

  const month = Number(slashMatch[1]);
  const day = Number(slashMatch[2]);
  const year = Number(slashMatch[3]);
  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(year)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseCompositeCell(value: string) {
  const raw = normalizeWhitespace(value);
  if (!raw) return null;

  const match = raw.match(
    /^(.+?)\s*-+>\s*job\s*:\s*(.+?)\s*-+>\s*price\s*:?\s*(.+)$/i,
  );
  if (!match) return null;

  return {
    projectAddress: match[1],
    jobTitle: match[2],
    priceRaw: match[3],
  };
}

function parseCsv(content: string) {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentField += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = "";
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

function buildRowObject(headers: string[], row: string[]) {
  const obj: Record<string, string> = {};
  headers.forEach((header, index) => {
    obj[header] = normalizeWhitespace(row[index] ?? "");
  });
  return obj;
}

function getRowValue(
  row: Record<string, string>,
  aliases: readonly string[],
): string {
  for (const alias of aliases) {
    const key = normalizeHeader(alias);
    const value = row[key];
    if (value) return value;
  }
  return "";
}

function normalizeJobKey(parts: {
  title: string;
  priceCents: number;
  scheduled?: string | null;
  superintendent?: string | null;
}) {
  return [
    normalizeWhitespace(parts.title).toLowerCase(),
    String(parts.priceCents),
    normalizeWhitespace(parts.scheduled ?? "").toLowerCase(),
    normalizeWhitespace(parts.superintendent ?? "").toLowerCase(),
  ].join("|");
}

const IMPORT_HEADER_ALIASES = {
  projectAddress: ["project_address", "projectaddress", "address", "project"],
  houseNumber: [
    "house_number",
    "housenumber",
    "street_number",
    "streetnumber",
    "street no",
    "street_no",
  ],
  streetAddress: [
    "street_address",
    "streetaddress",
    "street",
    "street_name",
    "streetname",
    "address_line",
    "addressline",
  ],
  jobTitle: ["job_title", "jobtitle", "job", "title"],
  price: ["price", "amount", "job_price", "jobprice", "job_cost", "jobcost", "cost"],
  builderName: ["builder_name", "buildername", "builder"],
  subdivisionName: ["subdivision_name", "subdivisionname", "subdivision"],
  superintendent: ["superintendent", "gc", "crew", "contractor"],
  scheduledCompletion: [
    "scheduled_completion",
    "scheduledcompletion",
    "scheduled",
    "scheduled_for",
    "date",
  ],
} as const;

type ImportSummary = {
  dryRun: boolean;
  rowsRead: number;
  buildersCreated: number;
  subdivisionsCreated: number;
  projectsCreated: number;
  jobsCreated: number;
  jobsSkippedDuplicate: number;
  rowsSkippedInvalid: number;
  rowErrors: string[];
};

type ImportResult =
  | { ok: true; summary: ImportSummary }
  | { ok: false; message: string };

export async function createBuilder(
  nameRaw: string,
): Promise<{ ok: boolean; data?: IdName; message?: string }> {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Session expired. Please log in again." };
  }

  const name = normalizeName(nameRaw);
  if (!name) return { ok: false, message: "Builder name is required." };

  // Insert first; if duplicate (unique index), fetch existing row
  const ins = await supabase
    .from("builders")
    .insert({ user_id: user.id, name })
    .select("id, name")
    .single();

  if (!ins.error && ins.data) return { ok: true, data: ins.data as IdName };

  // Duplicate? Fetch existing
  const sel = await supabase
    .from("builders")
    .select("id, name")
    .eq("user_id", user.id)
    .ilike("name", name) // case-insensitive-ish; ok for MVP
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (sel.data) return { ok: true, data: sel.data as IdName };

  return {
    ok: false,
    message: ins.error?.message ?? "Failed to save builder.",
  };
}

export async function createSubdivision(
  nameRaw: string,
): Promise<{ ok: boolean; data?: IdName; message?: string }> {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
    error: userError,
  } = await (await supabase).auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Session expired. Please log in again." };
  }

  const name = normalizeName(nameRaw);
  if (!name) return { ok: false, message: "Subdivision name is required." };

  const ins = await supabase
    .from("subdivisions")
    .insert({ user_id: user.id, name })
    .select("id, name")
    .single();

  if (!ins.error && ins.data) return { ok: true, data: ins.data as IdName };

  const sel = await supabase
    .from("subdivisions")
    .select("id, name")
    .eq("user_id", user.id)
    .ilike("name", name)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (sel.data) return { ok: true, data: sel.data as IdName };

  return {
    ok: false,
    message: ins.error?.message ?? "Failed to save subdivision.",
  };
}

export async function createProject(formData: FormData) {
  const supabase = createClient();

  // Check auth
  const {
    data: { user },
    error: userError,
  } = await (await supabase).auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Session expired. Please log in again." };
  }

  const houseNumberRaw = String(formData.get("house_number") || "");
  const streetAddressRaw = String(formData.get("street_address") || "");
  const projectAddressRaw = String(formData.get("project_address") || "");

  const houseNumber = normalizeHouseNumber(houseNumberRaw);
  const streetAddress = normalizeStreetAddress(streetAddressRaw);
  const usingSplitAddress =
    houseNumberRaw.trim().length > 0 || streetAddressRaw.trim().length > 0;
  const project_address = usingSplitAddress
    ? combineProjectAddress(houseNumber, streetAddress)
    : normalizeProjectAddress(projectAddressRaw);

  // We will accept either selected IDs or typed names.
  const builder_id = String(formData.get("builder_id") || "").trim() || null;
  const builder_name_raw = String(formData.get("builder_name") || "").trim();

  const subdivision_id =
    String(formData.get("subdivision_id") || "").trim() || null;
  const subdivision_name_raw = String(
    formData.get("subdivision_name") || "",
  ).trim();

  if (usingSplitAddress && (!houseNumber || !streetAddress)) {
    return {
      ok: false,
      message: "Street number and street address are required.",
    };
  }
  if (usingSplitAddress && !isValidHouseNumber(houseNumber)) {
    return { ok: false, message: "Street number must be numeric." };
  }
  if (!project_address) {
    return { ok: false, message: "Project address is required." };
  }

  // Resolve builder
  let finalBuilderId: string | null = builder_id;
  let builder_name_snapshot = "";

  if (finalBuilderId) {
    const { data: b } = await (await supabase)
      .from("builders")
      .select("id, name")
      .eq("id", finalBuilderId)
      .maybeSingle();

    if (!b) return { ok: false, message: "Selected builder not found." };
    builder_name_snapshot = b.name;
  } else {
    const name = normalizeName(builder_name_raw);
    if (!name) return { ok: false, message: "Builder is required." };
    const created = await createBuilder(name);
    if (!created.ok || !created.data)
      return {
        ok: false,
        message: created.message ?? "Failed to save builder.",
      };
    finalBuilderId = created.data.id;
    builder_name_snapshot = created.data.name;
  }

  // Resolve subdivision (REQUIRED)
  let finalSubdivisionId: string | null = subdivision_id;
  let subdivision_snapshot: string | null = null;

  const subName = normalizeName(subdivision_name_raw);

  if (finalSubdivisionId) {
    const { data: s } = await (await supabase)
      .from("subdivisions")
      .select("id, name")
      .eq("id", finalSubdivisionId)
      .maybeSingle();

    if (!s) return { ok: false, message: "Selected subdivision not found." };
    subdivision_snapshot = s.name;
  } else {
    // If no ID, we require a name and create it
    if (!subName) return { ok: false, message: "Subdivision is required." };

    const created = await createSubdivision(subName);
    if (!created.ok || !created.data) {
      return {
        ok: false,
        message: created.message ?? "Failed to save subdivision.",
      };
    }

    finalSubdivisionId = created.data.id;
    subdivision_snapshot = created.data.name;
  }

  // Insert project
  const companyId = await getActiveCompanyId();
  if (!companyId) return { ok: false, message: "No active company found." };

  const { data, error } = await (
    await supabase
  )
    .from("projects")
    .insert({
      user_id: user.id,
      company_id: companyId,
      project_address,
      builder_id: finalBuilderId,
      subdivision_id: finalSubdivisionId,
      builder_name: builder_name_snapshot, // keep your existing columns as snapshots
      subdivision: subdivision_snapshot,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  return { ok: true, projectId: data.id as string };
  // Reload window
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { ok: false, message: "Session expired. Please log in again." };
  }

  const id = projectId.trim();
  if (!id) return { ok: false, message: "Invalid project ID." };

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();
  
  if (projectError) return { ok: false, message: "Failed to find project." };
  if (!project) return { ok: false, message: "Project not found." };

  const deletedAt = new Date().toISOString();

  // Soft delete project
  const { error: jobsError } = await supabase
    .from("jobs")
    .update({ deleted_at: deletedAt })
    .eq("project_id", id)
    .is("deleted_at", null); // only delete non-deleted jobs

  if (jobsError)
    return { ok: false, message: "Failed to delete project jobs." };

  const { error: projectDeleteError } = await supabase
    .from("projects")
    .update({ deleted_at: deletedAt })
    .eq("id", id)
    .eq("user_id", user.id);

  if (projectDeleteError) {
    if (isMissingDeletedAtColumnError(projectDeleteError.message)) {
      return {
        ok: false,
        message:
          "Projects table is missing deleted_at. Add that column before enabling project deletion.",
      };
    }
    return { ok: false, message: "Failed to delete project." };
  }
  return { ok: true };
}

export async function editProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Session expired. Please log in again." };
  }

  const projectId = String(formData.get("project_id") || "").trim();
  const houseNumberRaw = String(formData.get("house_number") || "");
  const streetAddressRaw = String(formData.get("street_address") || "");
  const projectAddressRaw = String(formData.get("project_address") || "");

  const houseNumber = normalizeHouseNumber(houseNumberRaw);
  const streetAddress = normalizeStreetAddress(streetAddressRaw);
  const usingSplitAddress =
    houseNumberRaw.trim().length > 0 || streetAddressRaw.trim().length > 0;
  const project_address = usingSplitAddress
    ? combineProjectAddress(houseNumber, streetAddress)
    : normalizeProjectAddress(projectAddressRaw);

  const builder_id = String(formData.get("builder_id") || "").trim() || null;
  const builder_name_raw = String(formData.get("builder_name") || "").trim();

  const subdivision_id =
    String(formData.get("subdivision_id") || "").trim() || null;
  const subdivision_name_raw = String(
    formData.get("subdivision_name") || "",
  ).trim();

  if (!projectId) return { ok: false, message: "Project id is required." };
  if (usingSplitAddress && (!houseNumber || !streetAddress)) {
    return {
      ok: false,
      message: "Street number and street address are required.",
    };
  }
  if (usingSplitAddress && !isValidHouseNumber(houseNumber)) {
    return { ok: false, message: "Street number must be numeric." };
  }
  if (!project_address)
    return { ok: false, message: "Project address is required." };

  const { data: existing, error: existingErr } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingErr) return { ok: false, message: existingErr.message };
  if (!existing) return { ok: false, message: "Project not found." };

  let finalBuilderId: string | null = builder_id;
  let builder_name_snapshot = "";

  if (finalBuilderId) {
    const { data: b } = await supabase
      .from("builders")
      .select("id, name")
      .eq("id", finalBuilderId)
      .maybeSingle();

    if (!b) return { ok: false, message: "Selected builder not found." };
    builder_name_snapshot = b.name;
  } else {
    const name = normalizeName(builder_name_raw);
    if (!name) return { ok: false, message: "Builder is required." };
    const created = await createBuilder(name);
    if (!created.ok || !created.data) {
      return { ok: false, message: created.message ?? "Failed to save builder." };
    }
    finalBuilderId = created.data.id;
    builder_name_snapshot = created.data.name;
  }

  let finalSubdivisionId: string | null = subdivision_id;
  let subdivision_snapshot: string | null = null;

  if (finalSubdivisionId) {
    const { data: s } = await supabase
      .from("subdivisions")
      .select("id, name")
      .eq("id", finalSubdivisionId)
      .maybeSingle();

    if (!s) return { ok: false, message: "Selected subdivision not found." };
    subdivision_snapshot = s.name;
  } else {
    const name = normalizeName(subdivision_name_raw);
    if (!name) return { ok: false, message: "Subdivision is required." };
    const created = await createSubdivision(name);
    if (!created.ok || !created.data) {
      return {
        ok: false,
        message: created.message ?? "Failed to save subdivision.",
      };
    }
    finalSubdivisionId = created.data.id;
    subdivision_snapshot = created.data.name;
  }

  const { error: updateErr } = await supabase
    .from("projects")
    .update({
      project_address,
      builder_id: finalBuilderId,
      builder_name: builder_name_snapshot,
      subdivision_id: finalSubdivisionId,
      subdivision: subdivision_snapshot,
    })
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (updateErr) return { ok: false, message: updateErr.message };
  return { ok: true };
}

export async function importProjectsJobsCsv(
  formData: FormData,
): Promise<ImportResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Session expired. Please log in again." };
  }
  const userId = user.id;

  const companyId = await getActiveCompanyId();
  if (!companyId) {
    return { ok: false, message: "No active company found." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "Select a CSV file to import." };
  }
  if (file.size <= 0) return { ok: false, message: "The selected file is empty." };
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, message: "CSV is too large. Max size is 8MB." };
  }

  const defaultBuilder = toTitleCase(String(formData.get("default_builder") || ""));
  const defaultSubdivision = toTitleCase(
    String(formData.get("default_subdivision") || ""),
  );
  const dryRun = String(formData.get("dry_run") || "").toLowerCase() === "true";

  const csvRaw = (await file.text()).replace(/^\uFEFF/, "");
  const rows = parseCsv(csvRaw);
  if (rows.length < 2) {
    return {
      ok: false,
      message: "CSV must include a header row and at least one data row.",
    };
  }

  const headers = rows[0].map((header) => normalizeHeader(header));
  const dataRows = rows
    .slice(1)
    .filter((row) => row.some((cell) => normalizeWhitespace(cell).length > 0));
  if (dataRows.length === 0) {
    return { ok: false, message: "CSV has no data rows to import." };
  }

  const builderCache = new Map<string, string>();
  const subdivisionCache = new Map<string, string>();
  const projectCache = new Map<string, string>();
  const jobCacheByProject = new Map<string, Set<string>>();

  const summary: ImportSummary = {
    dryRun,
    rowsRead: dataRows.length,
    buildersCreated: 0,
    subdivisionsCreated: 0,
    projectsCreated: 0,
    jobsCreated: 0,
    jobsSkippedDuplicate: 0,
    rowsSkippedInvalid: 0,
    rowErrors: [],
  };

  async function resolveBuilderId(rawName: string): Promise<string> {
    const name = toTitleCase(rawName || defaultBuilder);
    if (!name) {
      throw new Error(
        "Builder is missing. Add a builder column or set a default builder.",
      );
    }

    const cacheKey = name.toLowerCase();
    const cached = builderCache.get(cacheKey);
    if (cached) return cached;

    const { data: existing, error: selectError } = await supabase
      .from("builders")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", name)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (selectError) throw new Error(selectError.message);

    if (existing?.id) {
      builderCache.set(cacheKey, existing.id);
      return existing.id;
    }

    if (dryRun) {
      const dryId = `dry-builder-${cacheKey}`;
      builderCache.set(cacheKey, dryId);
      summary.buildersCreated += 1;
      return dryId;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("builders")
      .insert({ user_id: userId, name })
      .select("id")
      .single();
    if (insertError || !inserted?.id) {
      throw new Error(insertError?.message ?? "Failed to create builder.");
    }

    builderCache.set(cacheKey, inserted.id);
    summary.buildersCreated += 1;
    return inserted.id;
  }

  async function resolveSubdivisionId(rawName: string): Promise<string> {
    const name = toTitleCase(rawName || defaultSubdivision);
    if (!name) {
      throw new Error(
        "Subdivision is missing. Add a subdivision column or set a default subdivision.",
      );
    }

    const cacheKey = name.toLowerCase();
    const cached = subdivisionCache.get(cacheKey);
    if (cached) return cached;

    const { data: existing, error: selectError } = await supabase
      .from("subdivisions")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", name)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (selectError) throw new Error(selectError.message);

    if (existing?.id) {
      subdivisionCache.set(cacheKey, existing.id);
      return existing.id;
    }

    if (dryRun) {
      const dryId = `dry-subdivision-${cacheKey}`;
      subdivisionCache.set(cacheKey, dryId);
      summary.subdivisionsCreated += 1;
      return dryId;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("subdivisions")
      .insert({ user_id: userId, name })
      .select("id")
      .single();
    if (insertError || !inserted?.id) {
      throw new Error(insertError?.message ?? "Failed to create subdivision.");
    }

    subdivisionCache.set(cacheKey, inserted.id);
    summary.subdivisionsCreated += 1;
    return inserted.id;
  }

  async function resolveProjectId(input: {
    projectAddress: string;
    builderId: string;
    subdivisionId: string;
    builderName: string;
    subdivisionName: string;
  }) {
    const projectAddress = normalizeProjectAddress(input.projectAddress);
    if (!projectAddress) throw new Error("Project address is required.");

    const cacheKey = [
      input.builderId,
      input.subdivisionId,
      projectAddress.toLowerCase(),
    ].join("|");
    const cached = projectCache.get(cacheKey);
    if (cached) return cached;

    const { data: existing, error: selectError } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .eq("builder_id", input.builderId)
      .eq("subdivision_id", input.subdivisionId)
      .ilike("project_address", projectAddress)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (selectError) throw new Error(selectError.message);

    if (existing?.id) {
      projectCache.set(cacheKey, existing.id);
      return existing.id;
    }

    if (dryRun) {
      const dryId = `dry-project-${cacheKey.replace(/[^a-z0-9-]/gi, "-")}`;
      projectCache.set(cacheKey, dryId);
      summary.projectsCreated += 1;
      return dryId;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        company_id: companyId,
        project_address: projectAddress,
        builder_id: input.builderId,
        subdivision_id: input.subdivisionId,
        builder_name: input.builderName,
        subdivision: input.subdivisionName,
      })
      .select("id")
      .single();
    if (insertError || !inserted?.id) {
      throw new Error(insertError?.message ?? "Failed to create project.");
    }

    projectCache.set(cacheKey, inserted.id);
    summary.projectsCreated += 1;
    return inserted.id;
  }

  async function getProjectJobCache(projectId: string) {
    const cached = jobCacheByProject.get(projectId);
    if (cached) return cached;

    if (dryRun && projectId.startsWith("dry-project-")) {
      const drySet = new Set<string>();
      jobCacheByProject.set(projectId, drySet);
      return drySet;
    }

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("title, price_cents, scheduled_completion, superintendent")
      .eq("project_id", projectId)
      .is("deleted_at", null);
    if (error) throw new Error(error.message);

    const keys = new Set(
      (jobs ?? []).map((job) =>
        normalizeJobKey({
          title: job.title ?? "",
          priceCents: job.price_cents ?? 0,
          scheduled: job.scheduled_completion ?? "",
          superintendent: job.superintendent ?? "",
        }),
      ),
    );
    jobCacheByProject.set(projectId, keys);
    return keys;
  }

  for (let i = 0; i < dataRows.length; i += 1) {
    const lineNumber = i + 2;
    const row = buildRowObject(headers, dataRows[i] ?? []);

    const compositeSource = Object.values(row).find((value) =>
      normalizeWhitespace(value).includes("---->"),
    );
    const composite = compositeSource ? parseCompositeCell(compositeSource) : null;

    const projectAddressRaw = getRowValue(row, IMPORT_HEADER_ALIASES.projectAddress);
    const houseNumberRaw = getRowValue(row, IMPORT_HEADER_ALIASES.houseNumber);
    const streetAddressRaw = getRowValue(row, IMPORT_HEADER_ALIASES.streetAddress);
    const splitAddress = normalizeWhitespace(
      [houseNumberRaw, streetAddressRaw].filter(Boolean).join(" "),
    );
    const projectAddress =
      projectAddressRaw ||
      splitAddress ||
      normalizeWhitespace(composite?.projectAddress ?? "");
    const jobTitleRaw =
      getRowValue(row, IMPORT_HEADER_ALIASES.jobTitle) ||
      normalizeWhitespace(composite?.jobTitle ?? "");
    const priceRaw =
      getRowValue(row, IMPORT_HEADER_ALIASES.price) ||
      normalizeWhitespace(composite?.priceRaw ?? "");
    const builderNameRaw = getRowValue(row, IMPORT_HEADER_ALIASES.builderName);
    const subdivisionNameRaw = getRowValue(
      row,
      IMPORT_HEADER_ALIASES.subdivisionName,
    );
    const superintendentRaw = getRowValue(
      row,
      IMPORT_HEADER_ALIASES.superintendent,
    );
    const scheduledRaw = getRowValue(row, IMPORT_HEADER_ALIASES.scheduledCompletion);

    const title = toTitleCase(jobTitleRaw);
    const priceCents = parsePriceToCents(priceRaw);
    const superintendent = toTitleCase(superintendentRaw) || null;
    const scheduledCompletion = parseScheduledDate(scheduledRaw);

    if (!projectAddress || !title || priceCents === null) {
      summary.rowsSkippedInvalid += 1;
      summary.rowErrors.push(
        `Line ${lineNumber}: missing/invalid required values (project_address, job_title, price).`,
      );
      continue;
    }

    try {
      const builderName = toTitleCase(builderNameRaw || defaultBuilder);
      const subdivisionName = toTitleCase(subdivisionNameRaw || defaultSubdivision);
      const builderId = await resolveBuilderId(builderNameRaw);
      const subdivisionId = await resolveSubdivisionId(subdivisionNameRaw);
      const projectId = await resolveProjectId({
        projectAddress,
        builderId,
        subdivisionId,
        builderName,
        subdivisionName,
      });

      const jobCache = await getProjectJobCache(projectId);
      const nextJobKey = normalizeJobKey({
        title,
        priceCents,
        scheduled: scheduledCompletion,
        superintendent,
      });

      if (jobCache.has(nextJobKey)) {
        summary.jobsSkippedDuplicate += 1;
        continue;
      }

      if (!dryRun) {
        const { error: insertJobError } = await supabase.from("jobs").insert({
          project_id: projectId,
          company_id: companyId,
          title,
          price_cents: priceCents,
          scheduled_completion: scheduledCompletion,
          superintendent,
        });
        if (insertJobError) throw new Error(insertJobError.message);
      }

      jobCache.add(nextJobKey);
      summary.jobsCreated += 1;
    } catch (error) {
      summary.rowsSkippedInvalid += 1;
      summary.rowErrors.push(
        `Line ${lineNumber}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  if (!dryRun) {
    revalidatePath("/projects");
    revalidatePath("/dashboard");
  }

  return { ok: true, summary: { ...summary, rowErrors: summary.rowErrors.slice(0, 200) } };
}
