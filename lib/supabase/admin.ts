import "server-only";

import { createClient } from "@supabase/supabase-js";

// Onboarding: service-role Supabase client for trusted server-only jobs such as
// cron exports and company membership cleanup. Never import this into client
// components; normal user-scoped work should use `lib/supabase/server.ts`.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
