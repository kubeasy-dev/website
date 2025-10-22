import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProfileApiTokens } from "@/components/profile-api-tokens";
import { ProfileDangerZone } from "@/components/profile-danger-zone";
import { ProfileEmailPreferences } from "@/components/profile-email-preferences";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileSettings } from "@/components/profile-settings";
import { auth } from "@/lib/auth";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export default async function ProfilePage() {
  // Get the authenticated session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  // Fetch data in parallel
  const queryClient = getQueryClient();
  const [emailCategories, xpData] = await Promise.all([
    queryClient.fetchQuery(trpc.emailPreference.listCategories.queryOptions()),
    queryClient.fetchQuery(trpc.userProgress.getXpAndRank.queryOptions()),
  ]);

  // Extract user information
  const user = session.user;
  const [firstName, lastName] = user.name?.split(" ") || ["", ""];

  return (
    <HydrateClient>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <ProfileHeader
              firstName={firstName || "User"}
              lastName={lastName || ""}
              email={user.email}
              rank={xpData.rank}
            />
          </div>

          <div className="grid gap-6">
            {/* Profile Settings */}
            <ProfileSettings
              initialFirstName={firstName || ""}
              initialLastName={lastName || ""}
            />

            {/* API Tokens */}
            <Suspense fallback={<div>Loading API Tokens...</div>}>
              <ProfileApiTokens />
            </Suspense>

            {/* Email Preferences */}
            <Suspense fallback={<div>Loading Email Preferences...</div>}>
              <ProfileEmailPreferences initialCategories={emailCategories} />
            </Suspense>

            {/* Danger Zone */}
            <ProfileDangerZone />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
