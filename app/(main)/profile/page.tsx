import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import ProfileProgressCard from "../../../components/profile/progress-card";
import SignOutButton from "@/components/signout-button";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type UserMetadata = {
  avatar_url?: string;
  full_name: string;
};

const ProfileHeader = ({ avatarUrl, fullName, email }: { avatarUrl?: string; fullName: string; email: string }) => (
  <div className='mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center'>
    <Image
      src={avatarUrl ?? "/placeholder.svg"}
      alt={fullName || "Profile"}
      width={100}
      height={100}
      className='rounded-full'
      priority // Important pour LCP (Largest Contentful Paint)
    />
    <div className='flex flex-row gap-4 items-baseline'>
      <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]'>{fullName}</h1>
      <SignOutButton />
    </div>
    <p className='text-muted-foreground'>{email}</p>
  </div>
);

export default async function Profile() {
  const supabase = await createClient();
  const {
    error,
    data: { user },
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Authentication error:", error);
    redirect("/login");
  }

  const metadata = user.user_metadata as UserMetadata;
  const avatarUrl = metadata?.avatar_url;
  const fullName = metadata?.full_name || "Anonymous User";

  return (
    <section className='container mx-auto py-12 md:py-24 lg:py-32'>
      <ProfileHeader avatarUrl={avatarUrl} fullName={fullName} email={user.email || ""} />
      <div className='mx-auto mt-12 max-w-4xl'>
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>Your Kubernetes learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className='h-6 w-full mt-4' />
              </CardContent>
            </Card>
          }
        >
          <ProfileProgressCard />
        </Suspense>
      </div>
    </section>
  );
}
