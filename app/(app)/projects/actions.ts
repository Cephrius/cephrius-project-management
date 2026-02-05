"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type IdName = { id: string; name: string };

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
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

  const project_address = String(formData.get("project_address") || "").trim();

  // We will accept either selected IDs or typed names.
  const builder_id = String(formData.get("builder_id") || "").trim() || null;
  const builder_name_raw = String(formData.get("builder_name") || "").trim();

  const subdivision_id =
    String(formData.get("subdivision_id") || "").trim() || null;
  const subdivision_name_raw = String(
    formData.get("subdivision_name") || "",
  ).trim();

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
