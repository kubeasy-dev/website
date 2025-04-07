"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Component to display skeleton loaders for challenge cards
 */
export default function ChallengeSkeleton() {
  // Create an array of placeholder items for the skeleton
  const skeletonItems = Array.from({ length: 4 }, (_, index) => index)
  
  return (
    <>
      {skeletonItems.map((index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}