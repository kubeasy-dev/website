
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Award, Target, LogOutIcon } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { MotionDiv } from "@/components/animate-div"

// Mock user data
const mock = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  avatar: "/placeholder.svg?height=100&width=100",
  level: 7,
  xp: 3500,
  nextLevelXp: 5000,
  completedChallenges: 15,
  achievements: [
    { id: 1, name: "Kubernetes Novice", description: "Complete your first challenge", icon: Trophy },
    { id: 2, name: "Deployment Master", description: "Successfully deploy 10 applications", icon: Star },
    { id: 3, name: "Scaling Guru", description: "Master the art of scaling in Kubernetes", icon: Award },
    { id: 4, name: "Security Sentinel", description: "Implement advanced security measures", icon: Target },
  ],
}

export default async function Profile() {
  const supabase = await createClient()
  const { error, data: { user } } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    return null
  }
  
  return (
    <section className="container mx-auto py-12 md:py-24 lg:py-32">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
      >
        <Image
          src={user.user_metadata.avatar_url || "/placeholder.svg"}
          alt={user.user_metadata.full_name}
          width={100}
          height={100}
          className="rounded-full"
        />
        <div className="flex flex-row gap-4 items-baseline">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
            {user.user_metadata.full_name}
          </h1>
          {/* <Button size="icon" variant="ghost" onClick={() => signOut()}><LogOutIcon /></Button> */}
        </div>
        <p className="text-muted-foreground">{user.email}</p>
      </MotionDiv>
      <div className="mx-auto mt-12 max-w-4xl">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} >
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>Your Kubernetes learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Level {mock.level}</span>
                <span className="text-sm text-muted-foreground">
                  {mock.xp} / {mock.nextLevelXp} XP
                </span>
              </div>
              <Progress value={(mock.xp / mock.nextLevelXp) * 100} className="w-full" />
              <p className="mt-2 text-sm text-muted-foreground">Completed Challenges: {mock.completedChallenges}</p>
            </CardContent>
          </Card>
        </MotionDiv>
        <h2 className="mt-12 text-2xl font-bold">Achievements</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {mock.achievements.map((achievement) => (
            <MotionDiv
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <achievement.icon className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>{achievement.name}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </MotionDiv>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg">View All Achievements</Button>
        </div>
      </div>
    </section>
  )
}

