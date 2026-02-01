import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Always go back to login in the end
  const loginUrl = new URL("/login", url.origin);

  if (!code) {
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(loginUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Exchange the email verification "code" for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return response; // redirect to /login silently
  }

  const user = data.user;
  const companyName =
    (user.user_metadata?.company_name as string | undefined) ?? null;

  // Create contractor profile (upsert)
  // NOTE: Requires your contractor_profiles RLS policy to allow insert/update for auth.uid()
  await supabase.from("contractor_profiles").upsert(
    {
      user_id: user.id,
      company_name: companyName,
      is_verified: true, // if you added this column
    },
    { onConflict: "user_id" }
  );

  // Set a short-lived cookie so /login can show "Account verified"
  response.cookies.set("bf_verified", "1", {
    path: "/",
    httpOnly: false, // login page (client) reads it to show banner
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 120, // 2 minutes
  });

  // Sign them out so they land on login (as you requested)
  await supabase.auth.signOut();

  return response;
}
