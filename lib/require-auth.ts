import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Require authentication for a page.
 * The proxy.ts handles redirecting unauthenticated users to login with the correct `next` param.
 * This function validates the session and returns it.
 *
 * @returns The authenticated session
 * @throws Redirects to /login if session is invalid (fallback, proxy should handle this)
 *
 * @example
 * ```tsx
 * export default async function ProtectedPage() {
 *   const session = await requireAuth();
 *   // User is authenticated, session is available
 *   return <div>Hello {session.user.name}</div>;
 * }
 * ```
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    // Fallback redirect - the proxy should have already handled this
    redirect("/login");
  }

  return session;
}
