import { redirect } from "next/navigation";

/**
 * Redirect /get-started to /try
 * The /try page now handles both demo mode (unauthenticated) and full onboarding (authenticated)
 */
export default function GetStartedPage() {
  redirect("/try");
}
