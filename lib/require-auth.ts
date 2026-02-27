import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

/**
 * Require authentication for a page.
 * The proxy.ts handles redirecting unauthenticated users to login with the correct `next` param.
 * This function validates the session server-side and returns it.
 *
 * @returns The authenticated session
 * @throws Redirects to / if session is invalid (fallback, proxy should handle this)
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    return redirect("/");
  }
  return session;
}
