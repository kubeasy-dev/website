"use client";

import { Code, Trophy, Laptop, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Feature = {
  name: string;
  description: string;
  icon: React.ElementType;
};

const featuresLists: Feature[] = [
  {
    name: "Practical Learning",
    description: "Learn through hands-on challenges that simulate real-world scenarios and best practices.",
    icon: Code,
  },
  {
    name: "Track Progress",
    description: "Monitor your learning journey and see your improvements over time.",
    icon: Trophy,
  },
  {
    name: "Local Environment",
    description: "Your computer, your text editor, your terminal. Practice Kubernetes without leaving your machine.",
    icon: Laptop,
  },
  {
    name: "Community Driven",
    description: "Join a vibrant community. Learn, share, and grow together with open source challenges.",
    icon: Users,
  },
];

export const FeaturesSection = () => {
  return (
    <section id='features' className='container py-24 sm:py-32'>
      <div className='grid lg:grid-cols-2 place-items-center lg:gap-24'>
        <div>
          <h2 className='text-lg text-primary mb-2 tracking-wider'>Features</h2>

          <h2 className='text-3xl md:text-4xl font-bold mb-4'>Everything You Need to master Kubernetes</h2>
          <p className='text-xl text-muted-foreground mb-8'>
            Kubeasy gives the complete toolkit: hands-on challenges, a CLI tool, and a community-driven approach to mastering Kubernetes. And it&apos;s free !
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-4 w-full'>
          {featuresLists.map((feature) => (
            <Card key={feature.name} className='bg-white dark:bg-card hover:bg-white/20 dark:hover:bg-card/60 cursor-pointer transition-all delay-75 group/number'>
              <CardHeader>
                <div className='flex justify-between'>
                  <feature.icon />
                </div>

                <CardTitle>{feature.name}</CardTitle>
              </CardHeader>

              <CardContent className='text-muted-foreground'>{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
