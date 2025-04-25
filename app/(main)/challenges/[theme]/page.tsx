import { createStaticClient } from "@/lib/supabase/server";
import { Params } from "next/dist/server/request/params";
import { queries } from "@/lib/queries";
import { notFound, redirect } from "next/navigation";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { Container } from "@/components/ui/container";
import { Challenge } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({ params }: Readonly<{ params: Promise<Params> }>) {
  const awaitedParams = await params;
  const { theme } = awaitedParams as { theme: string };
  return {
    title: `${theme.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} - Kubeasy Challenges`,
  };
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: themes } = await queries.theme.list(supabase);
  return themes.map((theme) => ({
    theme: String(theme.slug),
  }));
}

export default async function ThemePage({ params }: Readonly<{ params: Promise<Params> }>) {
  const awaitedParams = await params;
  const { theme } = awaitedParams as { theme: string };

  const supabase = createStaticClient();

  const [{ data: themeData, error: themeError }, { data: challenges, error }] = await Promise.all([queries.theme.get(supabase, { slug: theme }), queries.challenge.listByTheme(supabase, { theme })]);

  if (error || themeError) {
    redirect("/error");
  }

  if (!challenges || !themeData) {
    notFound();
  }

  return (
    <Container className='py-12 md:py-24 lg:py-32'>
      <div className='mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center'>
        <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]'>{themeData.title}</h1>
        <p className='max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7'>{themeData.description}</p>
      </div>
      <div className='flex flex-row justify-start py-6'>
        <Button variant='secondary' asChild>
          <ChevronLeft />
          <Link href='/challenges'>Back to Challenges</Link>
        </Button>
      </div>
      {challenges.length === 0 ? (
        <div className='text-muted-foreground text-center mb-2'>No challenges available for this theme</div>
      ) : (
        <div className='py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {challenges
            .map((c: Omit<Challenge, "content">) => ({ ...c, theme: themeData.title }))
            .map((challenge) => (
              <div key={challenge.id} className='h-full'>
                <ChallengeCard challenge={challenge} />
              </div>
            ))}
        </div>
      )}
    </Container>
  );
}
