import { createStaticClient } from "@/lib/supabase/server";
import { Params } from "next/dist/server/request/params";
import { queries } from "@/lib/queries";
import { notFound, redirect } from "next/navigation";

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
  const { data: themes } = await queries.challenges.listThemes(supabase);
  return themes.map((theme) => ({
    theme: String(theme.slug),
  }));
}

export default async function ThemePage({ params }: Readonly<{ params: Promise<Params> }>) {
  const awaitedParams = await params;
  const { theme } = awaitedParams as { theme: string };

  const supabase = createStaticClient();
  const { data: challenges, error } = await queries.challenges.listByTheme(supabase, { theme });

  if (error) {
    redirect("/error");
  }

  if (!challenges) {
    notFound();
  }

  return (
    <ul className='flex flex-col gap-4'>
      {challenges.map((challenge) => (
        <li key={challenge.id} className='p-4 border rounded-md'>
          <h2 className='text-xl font-bold'>{challenge.title}</h2>
          <p className='text-sm text-muted-foreground'>{challenge.description}</p>
          <a href={`/challenge/${challenge.slug}`} className='mt-2 text-blue-500 hover:underline'>
            Start Challenge
          </a>
        </li>
      ))}
    </ul>
  );
}
