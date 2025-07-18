"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star } from "lucide-react";

interface ReviewProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
  rating: number;
}

const reviewList: ReviewProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "Alex Kim",
    userName: "Cloud Architect",
    comment: "The hands-on labs are incredibly practical and the feedback is instant. Highly recommend for anyone learning K8s!",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Priya Singh",
    userName: "Platform Engineer",
    comment: "I love how Kubeasy lets me practice with real-world Kubernetes scenarios on my own laptop. It’s the missing piece in my DevOps learning journey.",
    rating: 4.9,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Samuel Lee",
    userName: "Software Engineer",
    comment: "The challenge-based approach makes learning Kubernetes fun and effective. Kubeasy’s community is active and supportive, which helps a lot!",
    rating: 4.8,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Maria Garcia",
    userName: "SRE Lead",
    comment: "Our team adopted Kubeasy for onboarding new hires. Tracking progress and the practical labs have sped up our ramp time dramatically.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Jake Miller",
    userName: "DevOps Consultant",
    comment: "Finally, a platform that’s not just theoretical! Kubeasy’s local-first experience means I can experiment safely and really learn.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Linh Tran",
    userName: "Kubernetes Enthusiast",
    comment: "Kubeasy’s challenges helped me prepare for the CKA exam. The hands-on tasks and instant validation are game changers.",
    rating: 4.9,
  },
];

export function TestimonialsSection() {
  return (
    <section id='testimonials' className='container py-16'>
      <div className='text-center mb-8'>
        <h2 className='text-lg text-primary text-center mb-2 tracking-wider'>Testimonials</h2>

        <h2 className='text-3xl md:text-4xl text-center font-bold mb-4'>Hear What Our 1000+ Clients Say</h2>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className='relative w-[80%] sm:w-[90%] lg:max-w-screen-xl mx-auto'
      >
        <CarouselContent>
          {reviewList.map((review) => (
            <CarouselItem key={review.name} className='md:basis-1/2 lg:basis-1/3'>
              <Card className='bg-muted/50 dark:bg-card'>
                <CardContent className='pt-6 pb-0'>
                  <div className='flex gap-1 pb-6'>
                    <Star className='size-4 fill-primary text-primary' />
                    <Star className='size-4 fill-primary text-primary' />
                    <Star className='size-4 fill-primary text-primary' />
                    <Star className='size-4 fill-primary text-primary' />
                    <Star className='size-4 fill-primary text-primary' />
                  </div>
                  {`"${review.comment}"`}
                </CardContent>

                <CardHeader>
                  <div className='flex flex-row items-center gap-4'>
                    <Avatar>
                      <AvatarImage src='https://avatars.githubusercontent.com/u/75042455?v=4' alt='radix' />
                      <AvatarFallback>SV</AvatarFallback>
                    </Avatar>

                    <div className='flex flex-col'>
                      <CardTitle className='text-lg'>{review.name}</CardTitle>
                      <CardDescription>{review.userName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
