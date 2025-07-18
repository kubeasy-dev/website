import Link from "next/link";
import { DisplayDifficultyLevel } from "@/components/difficulty-level";
import { Badge } from "@/components/ui/badge";
import { ClockIcon } from "lucide-react";
import { Challenge } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ChallengeCard({
  challenge,
  showContent = true,
  className,
}: Readonly<{ challenge: Omit<Challenge, "objective" | "initial_situation" | "of_the_week">; showContent?: boolean; className?: string }>) {
  return (
    <Link href={`/challenge/${challenge.slug}`}>
      <Card className={cn(className, "flex flex-col justify-between h-full")}>
        <CardHeader>
          <CardTitle className='font-medium flex flex-row gap-1.5 items-baseline'>
            <DisplayDifficultyLevel level={challenge.difficulty} />
            {challenge.title}
          </CardTitle>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>
        {showContent && (
          <CardContent>
            <div className='flex items-center justify-between min-w-0'>
              <Badge variant='secondary' className='min-w-0 truncate'>
                {challenge.theme}
              </Badge>
              <div className='flex flex-row items-center gap-0.5 text-sm text-muted-foreground shrink-0'>
                <ClockIcon className='h-4 w-4' />
                <span>{challenge.estimated_time} min.</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
