"use server";

// Onboarding: full-page search persistence helpers. Header suggestions are
// served by `app/api/search/suggest/route.ts`; recent items render through
// `components/search/recent-searches.tsx`.
import { createClient } from "@/lib/supabase/server";
import { getActiveCompanyId } from "@/lib/active-company";

const MAX_RECENT = 10;

export async function recordRecentSearch(query: string) {
  const q = query.trim();
  if (!q) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const companyId = await getActiveCompanyId();
  if (!companyId) return;

  await supabase
    .from("recent_searches")
    .delete()
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .ilike("query", q);

  await supabase.from("recent_searches").insert({
    user_id: user.id,
    company_id: companyId,
    query: q,
  });

  const { data: extras } = await supabase
    .from("recent_searches")
    .select("id")
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .range(MAX_RECENT, MAX_RECENT + 50);

  const idsToDelete = (extras ?? []).map((r) => r.id as string);
  if (idsToDelete.length > 0) {
    await supabase.from("recent_searches").delete().in("id", idsToDelete);
  }
}

export async function getRecentSearches(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  const { data } = await supabase
    .from("recent_searches")
    .select("query")
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(MAX_RECENT);

  return (data ?? []).map((r) => r.query as string);
}

export async function deleteRecentSearch(query: string) {
  const q = query.trim();
  if (!q) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const companyId = await getActiveCompanyId();
  if (!companyId) return;

  await supabase
    .from("recent_searches")
    .delete()
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .ilike("query", q);
}

export async function clearRecentSearches() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const companyId = await getActiveCompanyId();
  if (!companyId) return;

  await supabase
    .from("recent_searches")
    .delete()
    .eq("user_id", user.id)
    .eq("company_id", companyId);
}
