import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./config";

// Runs before every /admin request: refreshes the auth cookie and sends
// signed-out visitors to the login page. The admin page re-checks the user
// itself, so this is a fast first gate, not the only one.
export async function updateSession(request: NextRequest) {
  // Without Supabase there is no session to check; the pages explain what's missing.
  if (!isSupabaseConfigured) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // getClaims() refreshes an expired session and verifies the token's signature
  // locally against the project's public key, so it doesn't call Supabase Auth
  // on every request the way getUser() does.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const isLoginPage = request.nextUrl.pathname.startsWith("/admin/login");

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}
