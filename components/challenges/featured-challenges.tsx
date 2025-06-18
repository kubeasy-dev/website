"use client";

import useSupabase from "@/hooks/use-supabase";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import Link from "next/link";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { ChallengeCard } from "./challenge-card";

export function FeaturedChallenges() {
  const supabase = useSupabase();
  const { data: challengeOfTheWeek } = useQuery(queries.challenge.getChallengeOfTheWeek(supabase));
  const { data: latestChallenges } = useQuery(queries.challenge.getLatest(supabase));

  return (
    <aside className='w-full max-w-lg min-w-[600px]'>
      <div className='grid grid-cols-2 gap-2'>
        <div className='flex flex-col items-start gap-2'>
          <span className='text-xs font-semibold text-primary mb-1'>Challenge of the Week</span>
          {challengeOfTheWeek && (
            <div className='w-full'>
              <ChallengeCard challenge={challengeOfTheWeek} className='shadow-none' />
            </div>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <span className='text-primary text-xs font-semibold text-foreground mb-1'>Latest Challenges</span>
          <ul className='flex flex-col gap-1'>
            {latestChallenges?.map(({ title, description, slug }) => (
              <ListItem key={slug} title={title} href={`/challenge/${slug}`}>
                {description}
              </ListItem>
            ))}
          </ul>
          <Link href='/challenges' className='text-sm font-medium text-primary hover:underline mt-1 self-end'>
            See all
          </Link>
        </div>
      </div>
    </aside>
  );
}

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href} className='flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors group'>
          <div className='flex-1 min-w-0'>
            <div className='text-sm font-medium truncate group-hover:text-primary transition-colors'>{title}</div>
            <p className='text-muted-foreground text-xs line-clamp-2 leading-snug'>{children}</p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
