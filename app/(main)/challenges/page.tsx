import { Container } from "@/components/ui/container";
import { createStaticClient } from "@/lib/supabase/server";

export default async function ChallengesPage() {
  const supabase = createStaticClient();
  const { data: challenges } = await supabase.from("challenges").select();

  if (!challenges) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <section className='py-12 md:py-24 lg:py-32'>
        <div className='mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center'>
          <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]'>Kubernetes Challenges</h1>
          <p className='max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7'>
            Sharpen your Kubernetes skills with our interactive challenges. Learn by doing and track your progress.
          </p>
        </div>

        <div className='mx-auto items-center container flex flex-col gap-20 py-12'>
          {challenges?.length ? (
            challenges.map((challenge) => (
              <div key={challenge.id} className='p-4 border rounded-md'>
                <h2 className='text-xl font-bold'>{challenge.title}</h2>
                <p>{challenge.description}</p>
              </div>
            ))
          ) : (
            <p>No challenges available at the moment.</p>
          )}
        </div>
      </section>
    </Container>
  );
}
