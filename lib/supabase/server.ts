import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Onboarding: use this Supabase client in server components and server actions
// that should respect the contractor's Supabase Auth session. Admin/service-role
// access belongs in `lib/supabase/admin.ts`.
export async function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(async ({ name, value, options }) =>
              (await cookieStore).set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies; middleware will handle refresh.
          }
        },
      },
    }
  );
}
