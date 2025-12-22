import { Suspense } from "react";
import { ProfileApiTokens } from "@/components/profile-api-tokens";
import { ProfileDangerZone } from "@/components/profile-danger-zone";
import { ProfileEmailPreferences } from "@/components/profile-email-preferences";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileSettings } from "@/components/profile-settings";
import { requireAuth } from "@/lib/require-auth";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="h-16 w-64 bg-foreground/10 rounded animate-pulse mb-4"></div>
          <div className="h-6 w-96 bg-foreground/10 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-secondary border-4 border-border neo-shadow animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function ProfileContent() {
  const session = await requireAuth();

  // Prefetch data in parallel (prefetch won't throw on error, data will be hydrated to client)
  await Promise.all([
    prefetch(trpc.emailPreference.listCategories.queryOptions()),
    prefetch(trpc.userProgress.getXpAndRank.queryOptions()),
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
              <ProfileEmailPreferences />
            </Suspense>

            {/* Danger Zone */}
            <ProfileDangerZone />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
