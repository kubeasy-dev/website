"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, ArrowRight, CheckCircle } from "lucide-react"
import { addMinutes, intervalToDuration } from "date-fns"
import Link from "next/link"
import useGetChallenges, { ChallengesFilters } from "@/hooks/use-getChallenges"
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/hooks/use-debounce"
import { ChallengeExtended } from "@/lib/types"
import Loading from "@/components/loading"
import CtaCreateChallenge from "@/components/cta-create-challenge"

export default function ChallengesWrapper({ initialChallenges }: Readonly<{ initialChallenges: ChallengeExtended[] }>) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAchieved, setShowAchieved] = useState<boolean>(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { ref, inView } = useInView();

  const filters: ChallengesFilters = {
    searchTerm: debouncedSearchTerm,
    showAchieved: showAchieved
  };

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
    useGetChallenges(initialChallenges, filters);

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  // Refetch data when filters change
  useEffect(() => {
    refetch();
  }, [debouncedSearchTerm, showAchieved, refetch]);

  return (
    <section className="container mx-auto py-12 md:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
      >
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
          Kubernetes Challenges
        </h1>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Sharpen your Kubernetes skills with our interactive challenges. Learn by doing and track your progress.
        </p>
      </motion.div>
      <div className="mx-auto py-8 max-w-2xl">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <Switch id="show-achieved" checked={showAchieved} onCheckedChange={setShowAchieved} />
          <Label htmlFor="show-achieved">Show achieved challenges</Label>
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 py-6">
        {data?.pages.map((challenges, idx) => (
          <React.Fragment key={idx}>
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {challenge.title}
                      {challenge.achieved && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{challenge.difficulty}</Badge>
                      <span className="text-sm text-muted-foreground">{challenge.estimated_time} min.</span>
                    </div>
                    <Button className="w-full mt-4" asChild>
                      <Link href={`/challenges/${challenge.id}`}>
                        {challenge.achieved ? "Review Challenge" : "Start Challenge"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </React.Fragment>
        ))}
        </div>
        {isFetchingNextPage ? (
          <Loading />
        ) : (
          hasNextPage ? <div ref={ref} /> : <CtaCreateChallenge />
        )}
      </div>

    </section>
  )
}