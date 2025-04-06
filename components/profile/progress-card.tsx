import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";

type LevelInfo = {
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
};

function getLevelFromXP(totalXP: number): LevelInfo {
  let level = 1;
  let xpRequiredForLevelUp = 100;
  let xpRemaining = totalXP;

  while (xpRemaining >= xpRequiredForLevelUp) {
    xpRemaining -= xpRequiredForLevelUp;
    level += 1;
    xpRequiredForLevelUp = level * 100;
  }

  return {
    level,
    currentLevelXp: xpRemaining,
    xpToNextLevel: xpRequiredForLevelUp,
  };
}

export default async function ProfileProgressCard() {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single();

  if (!data) {
    return <div>No data available</div>;
  }
  const { level, currentLevelXp, xpToNextLevel } = getLevelFromXP(data.exp);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress</CardTitle>
        <CardDescription>Your Kubernetes learning journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Level {level}</span>
          <span className="text-sm text-muted-foreground">
            {currentLevelXp} / {xpToNextLevel} XP
          </span>
        </div>
        <Progress value={(currentLevelXp / xpToNextLevel) * 100} className="w-full" />
        <p className="mt-2 text-sm text-muted-foreground">Completed Challenges: {data.challenges_terminated}</p>
      </CardContent>
    </Card>
  )
}