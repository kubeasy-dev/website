import { notFound } from 'next/navigation'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Params } from 'next/dist/server/request/params'
import { Challenge } from '@/lib/types'

// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.
export const revalidate = 60
 
// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true // or false, to 404 on unknown paths
 
export async function generateStaticParams() {
  // Using the static client that doesn't use cookies
  const supabase = createStaticClient()
  const { data: challenges } = await supabase.from("challenges").select()
  const challengesData: Challenge[] = challenges || []
  return challengesData.map((challenge) => ({
    slug: String(challenge.slug),
  }))
}

export default async function ChallengePage({ params }: Readonly<{ params: Promise<Params> }>) {
  const { slug } = await params
  const supabase = await createClient()

  if (typeof slug != 'string') {
    throw new Error("Invalid slug")
  }

  const { data: challenge, error } = await supabase.from("challenges").select("*").eq("slug", slug).single()

  if (error) {
    throw error
  }

  if (!challenge) {
    notFound()
  }

  return (
    <section className="container mx-auto py-12 md:py-24 lg:py-32">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <div className="items-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
            {challenge.title}
          </h1>
          <div className="flex flex-row gap-4">
            {challenge.difficulty} . {challenge.estimated_time}
          </div>
        </div>
        <div className="text-left border-2 rounded-lg p-4 prose prose-p:text-base prose-ol:list-disc">
          <Markdown remarkPlugins={[remarkGfm]}>{challenge.content}</Markdown>
        </div>
      </div>

    </section>
  )

}