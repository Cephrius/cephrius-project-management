#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function printUsage() {
  console.log(`Usage:
  node scripts/import-project-jobs.mjs --file ./data/projects.csv --user-id <uuid> [options]

Required:
  --file <path>                 Path to CSV file
  --user-id <uuid>              Target user id for inserted data

Optional:
  --default-builder <name>      Fallback builder when row has no builder column
  --default-subdivision <name>  Fallback subdivision when row has no subdivision column
  --dry-run                     Validate and show what would be created without inserts
  --help                        Show this help

Supported CSV headers (case-insensitive):
  project_address | address | project
  house_number | street_number | street no
  street_address | street | street_name | street name
  job_title | job | title
  price | amount | job_price | job_cost
  builder_name | builder
  subdivision | subdivision_name
  superintendent | gc | crew
  scheduled_completion | scheduled | date

Also supports a single composite column like:
  1204 Main St ----> Job: Rough Grade -----> Price: 120
`);
}

function parseArgs(argv) {
  const args = {
    file: "",
    userId: "",
    defaultBuilder: "",
    defaultSubdivision: "",
    dryRun: false,
    help: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (token === "--file") {
      args.file = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--user-id") {
      args.userId = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--default-builder") {
      args.defaultBuilder = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--default-subdivision") {
      args.defaultSubdivision = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

function normalizeWhitespace(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function toTitleCase(value) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";

  return normalized.replace(/[A-Za-z]+/g, (segment) => {
    return segment[0].toUpperCase() + segment.slice(1).toLowerCase();
  });
}

function normalizeHeader(value) {
  return normalizeWhitespace(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parsePriceToCents(input) {
  const cleaned = String(input ?? "").replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100);
}

function parseScheduledDate(value) {
  const raw = normalizeWhitespace(value);
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // Also accept M/D/YYYY and MM/DD/YYYY from common CSV exports.
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

function parseCompositeCell(value) {
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

function parseCsv(content) {
  const rows = [];
  let currentField = "";
  let currentRow = [];
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

function loadEnvFromFile(filePath) {
  return fs
    .readFile(filePath, "utf8")
    .then((raw) => {
      const lines = raw.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        let value = trimmed.slice(idx + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!(key in process.env)) {
          process.env[key] = value;
        }
      }
    })
    .catch(() => {
      // ignore missing env file
    });
}

function buildRowObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = normalizeWhitespace(row[index] ?? "");
  });
  return obj;
}

function getRowValue(row, aliases) {
  for (const alias of aliases) {
    const key = normalizeHeader(alias);
    if (row[key]) return row[key];
  }
  return "";
}

function normalizeJobKey(parts) {
  return [
    normalizeWhitespace(parts.title).toLowerCase(),
    String(parts.priceCents),
    normalizeWhitespace(parts.scheduled ?? "").toLowerCase(),
    normalizeWhitespace(parts.superintendent ?? "").toLowerCase(),
  ].join("|");
}

const HEADER_ALIASES = {
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
};

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printUsage();
    return;
  }

  if (!args.file || !args.userId) {
    printUsage();
    throw new Error("Missing required args: --file and --user-id.");
  }

  await loadEnvFromFile(path.resolve(process.cwd(), ".env.local"));
  await loadEnvFromFile(path.resolve(process.cwd(), ".env"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const csvPath = path.resolve(process.cwd(), args.file);
  const csvRaw = await fs.readFile(csvPath, "utf8");
  const rows = parseCsv(csvRaw.replace(/^\uFEFF/, ""));

  if (rows.length < 2) throw new Error("CSV must include a header row and data rows.");

  const headers = rows[0].map((header) => normalizeHeader(header));
  const dataRows = rows.slice(1).filter((row) =>
    row.some((cell) => normalizeWhitespace(cell).length > 0),
  );

  const builderCache = new Map();
  const subdivisionCache = new Map();
  const projectCache = new Map();
  const jobCacheByProject = new Map();

  const stats = {
    rowsRead: dataRows.length,
    buildersCreated: 0,
    subdivisionsCreated: 0,
    projectsCreated: 0,
    jobsCreated: 0,
    jobsSkippedDuplicate: 0,
    rowsSkippedInvalid: 0,
  };
  const rowErrors = [];

  async function resolveBuilderId(rawName) {
    const name = toTitleCase(rawName || args.defaultBuilder);
    if (!name) {
      throw new Error(
        "Builder is missing. Add a builder column or pass --default-builder.",
      );
    }
    const cacheKey = name.toLowerCase();
    if (builderCache.has(cacheKey)) return builderCache.get(cacheKey);

    const { data: existing, error: selectError } = await supabase
      .from("builders")
      .select("id, name")
      .eq("user_id", args.userId)
      .ilike("name", name)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existing?.id) {
      builderCache.set(cacheKey, existing.id);
      return existing.id;
    }

    if (args.dryRun) {
      const dryId = `dry-builder-${cacheKey}`;
      builderCache.set(cacheKey, dryId);
      stats.buildersCreated += 1;
      return dryId;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("builders")
      .insert({ user_id: args.userId, name })
      .select("id")
      .single();

    if (insertError) throw insertError;
    builderCache.set(cacheKey, inserted.id);
    stats.buildersCreated += 1;
    return inserted.id;
  }

  async function resolveSubdivisionId(rawName) {
    const name = toTitleCase(rawName || args.defaultSubdivision);
    if (!name) {
      throw new Error(
        "Subdivision is missing. Add a subdivision column or pass --default-subdivision.",
      );
    }
    const cacheKey = name.toLowerCase();
    if (subdivisionCache.has(cacheKey)) return subdivisionCache.get(cacheKey);

    const { data: existing, error: selectError } = await supabase
      .from("subdivisions")
      .select("id, name")
      .eq("user_id", args.userId)
      .ilike("name", name)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existing?.id) {
      subdivisionCache.set(cacheKey, existing.id);
      return existing.id;
    }

    if (args.dryRun) {
      const dryId = `dry-subdivision-${cacheKey}`;
      subdivisionCache.set(cacheKey, dryId);
      stats.subdivisionsCreated += 1;
      return dryId;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("subdivisions")
      .insert({ user_id: args.userId, name })
      .select("id")
      .single();

    if (insertError) throw insertError;
    subdivisionCache.set(cacheKey, inserted.id);
    stats.subdivisionsCreated += 1;
    return inserted.id;
  }

  async function resolveProjectId(input) {
    const projectAddress = toTitleCase(input.projectAddress);
    if (!projectAddress) throw new Error("Project address is required.");
    const cacheKey = [
      input.builderId,
      input.subdivisionId,
      projectAddress.toLowerCase(),
    ].join("|");
    if (projectCache.has(cacheKey)) return projectCache.get(cacheKey);

    const { data: existing, error: selectError } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", args.userId)
      .eq("builder_id", input.builderId)
      .eq("subdivision_id", input.subdivisionId)
      .ilike("project_address", projectAddress)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existing?.id) {
      projectCache.set(cacheKey, existing.id);
      return existing.id;
    }

    if (args.dryRun) {
      const dryId = `dry-project-${projectAddress.toLowerCase().replace(/\s+/g, "-")}`;
      projectCache.set(cacheKey, dryId);
      stats.projectsCreated += 1;
      return dryId;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("projects")
      .insert({
        user_id: args.userId,
        project_address: projectAddress,
        builder_id: input.builderId,
        subdivision_id: input.subdivisionId,
        builder_name: input.builderName,
        subdivision: input.subdivisionName,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;
    projectCache.set(cacheKey, inserted.id);
    stats.projectsCreated += 1;
    return inserted.id;
  }

  async function getProjectJobCache(projectId) {
    if (jobCacheByProject.has(projectId)) return jobCacheByProject.get(projectId);

    if (args.dryRun && String(projectId).startsWith("dry-project-")) {
      const drySet = new Set();
      jobCacheByProject.set(projectId, drySet);
      return drySet;
    }

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("title, price_cents, scheduled_completion, superintendent")
      .eq("project_id", projectId)
      .is("deleted_at", null);

    if (error) throw error;

    const set = new Set(
      (jobs ?? []).map((job) =>
        normalizeJobKey({
          title: job.title ?? "",
          priceCents: job.price_cents ?? 0,
          scheduled: job.scheduled_completion ?? "",
          superintendent: job.superintendent ?? "",
        }),
      ),
    );
    jobCacheByProject.set(projectId, set);
    return set;
  }

  for (let i = 0; i < dataRows.length; i += 1) {
    const lineNumber = i + 2;
    const row = buildRowObject(headers, dataRows[i]);

    const compositeSource = Object.values(row).find((value) =>
      normalizeWhitespace(value).includes("---->"),
    );
    const composite = compositeSource ? parseCompositeCell(compositeSource) : null;

    const projectAddressRaw = getRowValue(row, HEADER_ALIASES.projectAddress);
    const houseNumberRaw = getRowValue(row, HEADER_ALIASES.houseNumber);
    const streetAddressRaw = getRowValue(row, HEADER_ALIASES.streetAddress);
    const splitAddress = normalizeWhitespace(
      [houseNumberRaw, streetAddressRaw].filter(Boolean).join(" "),
    );
    const projectAddress =
      projectAddressRaw || splitAddress || normalizeWhitespace(composite?.projectAddress);
    const jobTitleRaw =
      getRowValue(row, HEADER_ALIASES.jobTitle) ||
      normalizeWhitespace(composite?.jobTitle);
    const priceRaw =
      getRowValue(row, HEADER_ALIASES.price) ||
      normalizeWhitespace(composite?.priceRaw);
    const builderName = getRowValue(row, HEADER_ALIASES.builderName);
    const subdivisionName = getRowValue(row, HEADER_ALIASES.subdivisionName);
    const superintendentRaw = getRowValue(row, HEADER_ALIASES.superintendent);
    const scheduledRaw = getRowValue(row, HEADER_ALIASES.scheduledCompletion);

    const title = toTitleCase(jobTitleRaw);
    const priceCents = parsePriceToCents(priceRaw);
    const superintendent = toTitleCase(superintendentRaw) || null;
    const scheduledCompletion = parseScheduledDate(scheduledRaw);

    if (!projectAddress || !title || priceCents === null) {
      stats.rowsSkippedInvalid += 1;
      rowErrors.push(
        `Line ${lineNumber}: missing/invalid required values (project_address, job_title, price).`,
      );
      continue;
    }

    try {
      const resolvedBuilderName = toTitleCase(builderName || args.defaultBuilder);
      const resolvedSubdivisionName = toTitleCase(
        subdivisionName || args.defaultSubdivision,
      );

      const builderId = await resolveBuilderId(builderName);
      const subdivisionId = await resolveSubdivisionId(subdivisionName);
      const projectId = await resolveProjectId({
        projectAddress,
        builderId,
        subdivisionId,
        builderName: resolvedBuilderName,
        subdivisionName: resolvedSubdivisionName,
      });

      const jobCache = await getProjectJobCache(projectId);
      const jobKey = normalizeJobKey({
        title,
        priceCents,
        scheduled: scheduledCompletion ?? "",
        superintendent: superintendent ?? "",
      });

      if (jobCache.has(jobKey)) {
        stats.jobsSkippedDuplicate += 1;
        continue;
      }

      if (!args.dryRun) {
        const { error: insertJobError } = await supabase.from("jobs").insert({
          project_id: projectId,
          title,
          price_cents: priceCents,
          scheduled_completion: scheduledCompletion,
          superintendent,
        });
        if (insertJobError) throw insertJobError;
      }

      jobCache.add(jobKey);
      stats.jobsCreated += 1;
    } catch (error) {
      stats.rowsSkippedInvalid += 1;
      rowErrors.push(
        `Line ${lineNumber}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  console.log("");
  console.log(args.dryRun ? "Dry run summary" : "Import summary");
  console.log("----------------");
  console.log(`Rows read: ${stats.rowsRead}`);
  console.log(`Builders created: ${stats.buildersCreated}`);
  console.log(`Subdivisions created: ${stats.subdivisionsCreated}`);
  console.log(`Projects created: ${stats.projectsCreated}`);
  console.log(`Jobs created: ${stats.jobsCreated}`);
  console.log(`Jobs skipped (duplicate): ${stats.jobsSkippedDuplicate}`);
  console.log(`Rows skipped (invalid/error): ${stats.rowsSkippedInvalid}`);

  if (rowErrors.length > 0) {
    console.log("");
    console.log("Row errors:");
    for (const message of rowErrors.slice(0, 50)) {
      console.log(`- ${message}`);
    }
    if (rowErrors.length > 50) {
      console.log(`- ...and ${rowErrors.length - 50} more`);
    }
  }
}

main().catch((error) => {
  console.error("");
  console.error("Import failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
