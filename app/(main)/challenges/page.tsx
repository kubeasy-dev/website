import { createStaticClient } from "@/lib/supabase/server";
import { queries } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart2 } from "lucide-react";
import Loading from "@/components/loading";

export async function generateMetadata() {
  return {
    title: "Kubernetes Challenges - Kubeasy",
  };
}

export default async function ChallengesPage() {
  const supabase = createStaticClient();
  const { data: themes } = await queries.theme.list(supabase);

  if (!themes) {
    return <Loading />;
  }

  return (
    <section>
      <div className='mx-auto flex max-w-232 flex-col items-center justify-center gap-4 text-center'>
        <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]'>Kubernetes Challenges</h1>
        <p className='max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7'>
          Sharpen your Kubernetes skills with our interactive challenges. Learn by doing and track your progress.
        </p>
      </div>

      <div className='flex flex-row justify-end py-12'>
        <Button variant='secondary' asChild>
          <Link href='/learning-path'>
            <BarChart2 className='mr-2 h-4 w-4w' />
            My Kubernetes Journey
          </Link>
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12'>
        {themes.map((theme) => (
          <Link href={`/challenges/${theme.slug}`} key={theme.slug} className='block'>
            <Card key={theme.slug} className='bg-muted hover:border-primary cursor-pointer transition duration-200'>
              <CardHeader>
                <CardTitle className='text-lg font-bold'>{theme.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>{theme.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
