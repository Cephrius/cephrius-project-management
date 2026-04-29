import { createBrowserClient } from "@supabase/ssr";

// Onboarding: browser Supabase client for interactive client components. Server
// components and actions should use `lib/supabase/server.ts` instead.
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
