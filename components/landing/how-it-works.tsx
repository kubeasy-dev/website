import { ClientAnimatedSteps } from "./client-animated-steps";

export function HowItWorksSection() {
  return (
    <section className='py-16 px-4'>
      <div className='text-center'>
        <h2 className='text-lg text-primary mb-2 tracking-wider'>How It Works</h2>
        <h2 className='text-3xl md:text-4xl font-bold mb-4'>Resolve your first challenge in 5 minutes</h2>
        <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
          Follow the steps below to start your first Kubernetes challenge with Kubeasy. In less than five minutes, you&apos;ll be ready to solve your first scenario and explore the world of Kubernetes
          on your own.
        </p>
      </div>
      <div className='w-full flex justify-center my-6'>
        <div className='h-1 w-24 bg-primary/20 rounded-full' />
      </div>
      <ClientAnimatedSteps />
    </section>
  );
}
