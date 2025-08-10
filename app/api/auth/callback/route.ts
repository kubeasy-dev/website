import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";
import PostHogClient from "@/lib/posthog";
import { differenceInSeconds } from "date-fns";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  // get PostHog distinct ID from query
  const phDidFromQuery = searchParams.get("ph_did") ?? undefined;

  // get PostHog distinct ID from cookie
  const cookieName = "ph_" + process.env.NEXT_PUBLIC_POSTHOG_KEY + "_posthog";
  const cookieStore = await cookies();
  const rawCookieValue = cookieStore.get(cookieName)?.value;
  let cookieDistinctId: string | undefined;
  if (rawCookieValue) {
    const decoded = decodeURIComponent(rawCookieValue);
    const parsed = JSON.parse(decoded);
    cookieDistinctId = parsed?.distinct_id;
  }

  // Priority to client-provided distinct_id, then cookie
  const preAuthDistinctId = phDidFromQuery || cookieDistinctId;

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);
    if (user) {
      const posthog = PostHogClient();
      const isNew = differenceInSeconds(new Date(), new Date(user.created_at)) < 10;

      // Capture l'événement avec l'ID final (utilisateur)
      posthog.capture({
        distinctId: user.id,
        event: isNew ? "user_signup" : "user_login",
        properties: {
          provider: user.app_metadata.provider,
          next: next,
          merged_from_anon: Boolean(preAuthDistinctId),
          ph_did_source: phDidFromQuery ? "query" : cookieDistinctId ? "cookie" : "none",
        },
      });
      await posthog.shutdown();
    }
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
