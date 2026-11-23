import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component; middleware refreshes the session instead.
          }
        },
      },
    },
  );
}

export type CurrentUser = { id: string; email: string };

/**
 * The signed-in user, or null. Uses getClaims(), which verifies the session token locally
 * when the project uses asymmetric JWT signing keys (no network call to Supabase).
 * Wrapped in React cache() so the layout and the page share one lookup per request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  return { id: claims.sub, email: (claims.email as string | undefined) ?? "" };
});

/** Supabase client plus the signed-in user; redirects to /login if not signed in. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  return { supabase, user };
}
