import Link from "next/link";
import { DisplayDifficultyLevel } from "../difficulty-level";
import { Badge } from "../ui/badge";
import { ClockIcon } from "lucide-react";
import { Challenge } from "@/lib/types";

export function ChallengeCard({ challenge }: Readonly<{ challenge: Omit<Challenge, "content"> }>) {
  return (
    <Link href={`/challenge/${challenge.slug}`}>
      <div className='flex flex-col justify-between bg-card dark:bg rounded-lg shadow p-3 border h-full'>
        <div>
          <div className='font-medium flex flex-row gap-1.5 items-baseline'>
            <DisplayDifficultyLevel level={challenge.difficulty} />
            {challenge.title}
          </div>
          <div className='text-sm text-muted-foreground mt-1'>{challenge.description}</div>
        </div>
        <div className='flex justify-between items-center mt-2'>
          <Badge variant='secondary'>{challenge.theme}</Badge>
          <div className='flex flex-row space-x-0.5 items-center text-sm text-muted-foreground'>
            <ClockIcon className='h-4 w-4' />
            <span>{challenge.estimated_time} min.</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
