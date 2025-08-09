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

  const cookieName = "ph_" + process.env.NEXT_PUBLIC_POSTHOG_KEY + "_posthog";
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(cookieName)?.value;
  const distinctId = cookieValue ? JSON.parse(cookieValue).distinct_id : "placeholder";

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);
    if (user) {
      const posthog = PostHogClient();
      const isNew = differenceInSeconds(new Date(), new Date(user.created_at)) < 10;
      if (isNew) {
        posthog.capture({
          distinctId: distinctId,
          event: "user_signup",
          properties: {
            provider: user.app_metadata.provider,
            next: next,
            used_fallback_distinct_id: !distinctId,
          },
        });
      } else {
        posthog.capture({
          distinctId: distinctId,
          event: "user_login",
          properties: {
            provider: user.app_metadata.provider,
            next: next,
            used_fallback_distinct_id: !distinctId,
          },
        });
      }
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
