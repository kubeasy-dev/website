import Link from "next/link";
import { DisplayDifficultyLevel } from "@/components/difficulty-level";
import { Badge } from "@/components/ui/badge";
import { ClockIcon } from "lucide-react";
import { Challenge } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function ChallengeCard({ challenge }: Readonly<{ challenge: Omit<Challenge, "content"> }>) {
  return (
    <Link href={`/challenge/${challenge.slug}`}>
      <Card className='flex flex-col justify-between h-full'>
        <CardHeader>
          <CardTitle className='font-medium flex flex-row gap-1.5 items-baseline'>
            <DisplayDifficultyLevel level={challenge.difficulty} />
            {challenge.title}
          </CardTitle>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex justify-between items-center'>
            <Badge variant='secondary'>{challenge.theme}</Badge>
            <div className='flex flex-row space-x-0.5 items-center text-sm text-muted-foreground'>
              <ClockIcon className='h-4 w-4' />
              <span>{challenge.estimated_time} min.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
