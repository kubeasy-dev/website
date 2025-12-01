"use client";

import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { useTRPC } from "@/trpc/client";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
}

export function ProfileHeader({
  firstName,
  lastName,
  email,
}: Readonly<ProfileHeaderProps>) {
  const trpc = useTRPC();

  // Fetch rank client-side with error handling
  const { data: xpData } = useQuery({
    ...trpc.userProgress.getXpAndRank.queryOptions(),
  });

  const rank = xpData?.rank ?? "Loading...";

  return (
    <div className="bg-secondary neo-border neo-shadow p-8 mb-6">
      <div className="flex items-center gap-8">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 rounded-full bg-primary neo-border neo-shadow-sm overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center">
              <User className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-accent text-white px-3 py-1 neo-border text-xs font-black">
            {rank.toLocaleUpperCase()}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-black mb-1">
            {firstName} {lastName}
          </h1>
          <p className="text-lg text-muted-foreground">{email}</p>
        </div>
      </div>
    </div>
  );
}
