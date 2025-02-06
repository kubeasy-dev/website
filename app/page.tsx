import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Award, Target, Terminal, GitFork, Github, MonitorPlay, Workflow, CheckCircle2, Code2, Computer } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import WordReveal from '@/components/ui/word-reveal';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/80 via-primary/50 to-secondary/30 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <Container className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <WordReveal text="Master Kubernetes Through Interactives Challenges" className="text-4xl font-bold tracking-tight sm:text-6xl"/>
            
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Learn Kubernetes by doing. Practical, hands-on challenges designed to help you master
              container orchestration in a local environment.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/challenges">
                  Browse Challenges <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/docs">Learn More</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-24 relative">
        <div className="absolute inset-x-0 top-1/2 -z-10 transform-gpu overflow-hidden blur-3xl">
          <div className="relative left-[calc(50%+11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-secondary/50 via-primary/30 to-primary/20 opacity-30 sm:left-[calc(50%+30rem)] sm:w-[72.1875rem]" />
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">Practical Learning</h3>
            <p className="mt-2 text-muted-foreground">
              Learn through hands-on challenges that simulate real-world scenarios and best practices.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-lg border p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">Track Achievement</h3>
            <p className="mt-2 text-muted-foreground">
              Monitor your progress, earn badges, and showcase your Kubernetes expertise.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-lg border p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Computer className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">Local Environment</h3>
            <p className="mt-2 text-muted-foreground">
              Your computer, your text editor, your terminal. Practice Kubernetes without leaving your machine.
            </p>
          </div>
          
        </div>
      </Container>

      {/* How It Works Section */}
      <Container className="py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Get started with Kubeasy in just a few simple steps
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center text-center p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <Terminal className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Install CLI</h3>
            <p className="text-muted-foreground mb-4">Install the Kubeasy CLI with a simple npm command</p>
            <code className="px-4 py-2 bg-muted rounded-md text-sm">npm install -g kubeasy-cli</code>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <Workflow className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Setup Cluster</h3>
            <p className="text-muted-foreground mb-4">Automatically spawn a local Kubernetes cluster</p>
            <code className="px-4 py-2 bg-muted rounded-md text-sm">kubeasy setup</code>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <MonitorPlay className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Challenge</h3>
            <p className="text-muted-foreground mb-4">Prepare your environment and start a new challenge</p>
            <code className="px-4 py-2 bg-muted rounded-md text-sm">kubeasy start <span className="text-primary">challenge-name</span></code>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Practice & Learn</h3>
            <p className="text-muted-foreground mb-4">Resolve the challenge and validate your solution</p>
            <code className="px-4 py-2 bg-muted rounded-md text-sm">kubeasy verify <span className="text-primary">challenge-name</span></code>
          </div>
        </div>
      </Container>

      {/* Open Source Section */}
      <Container className="py-24 border-t">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Open Source at Heart
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our platform thrives on community contributions. All challenges are open source and
              available on GitHub, making Kubernetes learning accessible for everyone.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Browse Challenges</h3>
                  <p className="text-muted-foreground">Explore our collection of community-created challenges</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <GitFork className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Contribute</h3>
                  <p className="text-muted-foreground">Add new scenarios or improve existing ones</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Github className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Join the Community</h3>
                  <p className="text-muted-foreground">Be part of our growing community of K8s enthusiasts</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Button asChild>
                <Link href="https://github.com/kubeasy-dev/challenges">
                  <Github className="mr-2 h-4 w-4" /> View on GitHub
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-2xl -z-10" />
            <div className="relative rounded-2xl border bg-background/50 backdrop-blur-sm p-8">
              <code className="block whitespace-pre rounded bg-muted p-4 text-sm mb-4">
                {`# Clone the repository
git clone https://github.com/kubeasy-dev/challenges

# Create a new challenge
make create NAME=new-challenge

# Test your challenge
make test NAME=new-challenge

# Submit a pull request
git push origin feature/new-challenge`}
              </code>
              <p className="text-sm text-muted-foreground">
                Contributing is easy! Follow our guide to create and submit new challenges.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Testimonials Section */}
      <Container className="py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of developers who have accelerated their Kubernetes journey with Kubeasy
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&auto=format&fit=crop&q=60" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Sarah Johnson</h3>
                <p className="text-sm text-muted-foreground">DevOps Engineer at Cloudify</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "Kubeasy's hands-on approach helped me transition from theory to practical Kubernetes
              skills in weeks. The real-world scenarios were exactly what I needed to build confidence."
            </p>
          </div>
          <div className="rounded-lg border bg-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&auto=format&fit=crop&q=60" />
                <AvatarFallback>MB</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Michael Brown</h3>
                <p className="text-sm text-muted-foreground">Senior SRE at TechCorp</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "The isolated environments for each challenge are brilliant. I can experiment freely
              without worrying about breaking anything. Perfect for learning complex K8s concepts."
            </p>
          </div>
          <div className="rounded-lg border bg-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&q=60" />
                <AvatarFallback>AP</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Alice Parker</h3>
                <p className="text-sm text-muted-foreground">Cloud Architect at DataFlow</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "Contributing to Kubeasy challenges has been rewarding. The community is supportive,
              and I've learned as much from creating challenges as solving them."
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}