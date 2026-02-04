"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function parsePriceToCents(input: string) {
  // accepts "1200"  "1200.50" "$1,200.50"  " $ 1,200 "
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100);
}

export async function createJob(projectId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await (await supabase).auth.getUser();

  if (userError || !user) redirect("/login");

  const title = String(formData.get("title") || "").trim();
  const priceRaw = String(formData.get("price") || "").trim();
  const scheduled_completion = String(
    formData.get("scheduled_completion") || "",
  ).trim();

  if (!title) return { ok: false, message: "Job title is required." };
  if (!scheduled_completion)
    return { ok: false, message: "Scheduled completion date is required." };

  const price_cents = parsePriceToCents(priceRaw);
  if (price_cents === null)
    return { ok: false, message: "Enter a valid price." };

  const { error } = await (await supabase).from("jobs").insert({
    project_id: projectId,
    title,
    price_cents,
    scheduled_completion,
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function toggleJobComplete(jobId: string, nextCompleted: boolean) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await (await supabase).auth.getUser();

  if (userError || !user) redirect("/login");

  const { error } = await (
    await supabase
  )
    .from("jobs")
    .update({
      is_completed: nextCompleted,
      completed_at: nextCompleted ? new Date().toISOString() : null,
    })
    .eq("id", jobId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function deleteJob(jobId: string) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await (await supabase).auth.getUser();

  if (userError || !user) redirect("/login");

  const { error } = await (await supabase)
    .from("jobs")
    .delete()
    .eq("id", jobId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
