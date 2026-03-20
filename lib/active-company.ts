import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const COOKIE_KEY = "jobsyte:active-company-id";

/**
 * Read the active company ID from the cookie, with a fallback
 * to the first company the user belongs to.
 */
export async function getActiveCompanyId(): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE_KEY)?.value;
  if (fromCookie) return fromCookie;

  // Fallback: first company the user is a member of
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return membership?.company_id ?? null;
}
