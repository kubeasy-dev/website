"use client";

import Image from "next/image";
import { User } from "@supabase/supabase-js";
import useSupabase from "@/hooks/use-supabase";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";

export function ProfileHeader({ user }: { user: User }) {
  const supabase = useSupabase();

  const { data: profile } = useQuery(queries.profile.get(supabase));

  if (!profile) {
    return null;
  }

  return (
    <div className='mx-auto flex flex-col items-center justify-center gap-4 text-center'>
      <Image src={profile.avatar_url ?? "/placeholder.svg"} alt={profile.id} width={100} height={100} className='rounded-full' priority />
      <div className='flex flex-row gap-4 items-baseline'>
        <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]'>
          {profile.first_name} {profile.last_name}
        </h1>
      </div>
      <p className='text-muted-foreground'>{user.email}</p>
    </div>
  );
}
