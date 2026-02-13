"use server";

import { createClient } from "@/lib/supabase/server";

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
  const { data, error } = await (
    await supabase
  )
    .from("projects")
    .insert({
      user_id: user.id,
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
