"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import kubeasyJourneyLight from "@/app/assets/kube-journey-light.png";
import kubeasyJourneyDark from "@/app/assets/kube-journey-dark.png";

export const HeroSection = () => {
  const { resolvedTheme: theme } = useTheme();
  return (
    <section className='container w-full'>
      <div className='grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-20 md:py-32'>
        <div className='text-center space-y-8'>
          <Badge variant='outline' className='text-sm py-2'>
            <span className='mr-2 text-primary'>
              <Badge>NEW</Badge>
            </span>
            <span>
              Kubeasy is live! 🚀{" "}
              <Link href='/blog/why-i-built-kubeasy' className='text-primary hover:underline'>
                Read more
              </Link>
            </span>
          </Badge>

          <div className='max-w-screen-lg mx-auto text-center text-4xl md:text-6xl font-bold'>
            <h1>
              Master Kubernetes through
              <span className='text-transparent px-2 bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text'>Interactive Challenges</span>
            </h1>
          </div>

          <p className='max-w-screen-sm mx-auto text-xl text-muted-foreground'>Master Kubernetes through interactive challenges. Learn by doing, with real-world scenarios and hands-on experience.</p>

          <div className='space-y-4 md:space-y-0 md:space-x-4'>
            <Button className='w-5/6 md:w-1/4 font-bold group/arrow'>
              Get Started
              <ArrowRight className='size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform' />
            </Button>

            <Button asChild variant='secondary' className='w-5/6 md:w-1/4 font-bold'>
              <Link href='/challenges'>View challenges</Link>
            </Button>
          </div>
        </div>

        <div className='relative group mt-14'>
          <div className='absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl'></div>
          <Image
            className='mx-auto rounded-lg relative rouded-lg leading-none flex items-center border border-t-2 border-secondary  border-t-primary/30'
            src={theme === "dark" ? kubeasyJourneyDark : kubeasyJourneyLight}
            alt='kubeasy-journey-dashboard'
          />

          <div className='absolute bottom-0 left-0 w-full h-20 md:h-28 bg-gradient-to-b from-background/0 via-background/50 to-background rounded-lg'></div>
        </div>
      </div>
    </section>
  );
};
