"use client";

import { Code, Trophy, Laptop, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Feature = {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
};

const featuresLists: Feature[] = [
  {
    name: "Practical Learning",
    description: "Learn through hands-on challenges that simulate real-world scenarios and best practices.",
    icon: Code,
    color: "bg-primary/10 text-primary",
  },
  {
    name: "Track Progress",
    description: "Monitor your learning journey and see your improvements over time.",
    icon: Trophy,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  {
    name: "Local Environment",
    description: "Your computer, your text editor, your terminal. Practice Kubernetes without leaving your machine.",
    icon: Laptop,
    color: "bg-secondary/40 text-secondary-foreground dark:bg-secondary/60",
  },
  {
    name: "Community Driven",
    description: "Join a vibrant community. Learn, share, and grow together with open source challenges.",
    icon: Users,
    color: "bg-accent/40 text-accent-foreground dark:bg-accent/60",
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
            <Card key={feature.name} className='bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number'>
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
