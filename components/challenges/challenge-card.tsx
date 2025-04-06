"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChallengeExtended } from "@/lib/types"

/**
 * Component for displaying individual challenge cards with animation
 * Using flex and fixed heights to ensure consistent card sizing
 */
export default function ChallengeCard({ challenge }: Readonly<{ challenge: ChallengeExtended }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full" // Ensure the motion div takes full height
    >
      <Card className="flex flex-col h-full"> {/* Use flexbox for the card layout */}
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{challenge.title}</span> {/* Truncate long titles */}
            {challenge.achieved && <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />}
          </CardTitle>
          <CardDescription className="line-clamp-2"> {/* Limit description to 2 lines */}
            {challenge.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col mt-auto"> {/* Push content to the bottom with mt-auto */}
          <div className="flex justify-between items-center mb-4">
            <Badge variant="secondary">{challenge.difficulty}</Badge>
            <span className="text-sm text-muted-foreground">{challenge.estimated_time} min.</span>
          </div>
          <Button className="w-full" asChild>
            <Link href={`/challenges/${challenge.slug}`}>
              {challenge.achieved ? "Review Challenge" : "Start Challenge"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}