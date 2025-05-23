import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";
import PostHogClient from "@/lib/posthog";
import { differenceInSeconds } from "date-fns";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

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
          distinctId: user.id,
          event: "user_signup",
          properties: {
            provider: user.app_metadata.provider,
            next: next,
          },
        });
      } else {
        posthog.capture({
          distinctId: user.id,
          event: "user_login",
          properties: {
            provider: user.app_metadata.provider,
            next: next,
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
