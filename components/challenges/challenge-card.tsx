"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button" 
import Link from "next/link"
import useSupabase from "@/hooks/use-supabase"
import { Challenge } from "@/lib/types"
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query'
import { queries } from "@/lib/queries"
import { useInView } from "react-intersection-observer"
import { useMemo } from "react"

export default function ChallengeCard({ challenge }: Readonly<{ challenge: Challenge }>) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const supabase = useSupabase()
  const { data: progress } = useQuery(
    queries.userProgress.get(supabase, {challengeId: challenge.id}), 
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      enabled: inView,
    }
  )
  const isCompleted = useMemo(() => progress?.status == "completed", [progress])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
      ref={ref}
    >
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{challenge.title}</span>
            {isCompleted && <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {challenge.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col mt-auto">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="secondary">{challenge.difficulty}</Badge>
            <span className="text-sm text-muted-foreground">{challenge.estimated_time} min.</span>
          </div>
          <Button className="w-full" asChild>
            <Link href={`/challenges/${challenge.slug}`}>
              {isCompleted ? "Review Challenge" : "Start Challenge"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}