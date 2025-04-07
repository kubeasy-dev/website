import { Skeleton } from '@/components/ui/skeleton'

export default function ChallengePageLoading() {
  return (
    <section className="container mx-auto py-12 md:py-24 lg:py-32">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <div className="flex flex-row gap-4 items-baseline">
          <Skeleton className="h-10 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="w-full mt-4">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    </section>
  )
}