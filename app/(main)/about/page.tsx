import {
  ArrowRight,
  BookOpen,
  Code2,
  Github,
  Heart,
  Shield,
  Target,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Kubeasy | Making Kubernetes Less Mysterious",
  description:
    "Learn Kubernetes through realistic challenges that run locally. Practice debugging real-world issues in isolated environments without cloud costs or vendor lock-in.",
  openGraph: {
    title: "About Kubeasy | Making Kubernetes Less Mysterious",
    description:
      "Learn Kubernetes through realistic challenges that run locally. Practice debugging real-world issues in isolated environments.",
    type: "website",
  },
};

const sections = [
  { id: "problem", label: "The Problem" },
  { id: "devs-ops", label: "Devs & Ops" },
  { id: "docs", label: "Beyond Docs" },
  { id: "solution", label: "What is Kubeasy" },
  { id: "local", label: "Local First" },
  { id: "philosophy", label: "Philosophy" },
  { id: "experience", label: "Built from Experience" },
  { id: "open-source", label: "Open Source" },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-16 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <BookOpen className="w-5 h-5" />
          <span>About Kubeasy</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-balance leading-tight">
          Making Kubernetes
          <br />
          Less Mysterious
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto font-medium">
          A local-first learning platform that puts developers in front of
          realistic Kubernetes problems
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
        {/* Table of Contents - Sticky */}
        <aside className="hidden lg:block lg:order-2">
          <nav className="sticky top-24 space-y-1">
            <h2 className="text-sm font-black uppercase text-foreground/60 mb-4">
              On This Page
            </h2>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block text-sm py-2 px-3 rounded hover:bg-secondary transition-colors font-medium text-foreground/70 hover:text-foreground border-l-2 border-transparent hover:border-primary"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <article className="lg:order-1 max-w-4xl">
          {/* TL;DR Section */}
          <div className="bg-primary/10 border-4 border-primary neo-shadow p-8 mb-16">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <Target className="w-6 h-6" />
              TL;DR
            </h2>
            <ul className="space-y-3 text-lg font-medium">
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span>
                  Kubernetes is everywhere, but most devs don't feel comfortable
                  with it
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span>
                  Reading docs isn't enough — you need hands-on practice with
                  real problems
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span>
                  Kubeasy provides realistic debugging challenges that run 100%
                  locally
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span>
                  No cloud costs, no vendor lock-in, fully open source
                </span>
              </li>
            </ul>
          </div>

          {/* Introduction */}
          <section id="problem" className="mb-16 scroll-mt-24">
            <p className="text-2xl md:text-3xl font-bold leading-relaxed text-foreground mb-6">
              Kubernetes is everywhere. And yet, for many developers, it still
              feels like a black box.
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-foreground/90 mb-4">
              While it has become the backbone of modern infrastructure —
              powering microservices, jobs, APIs, and real-time applications
              across the globe — most developers never really get comfortable
              with it. They use it indirectly, through CI pipelines or
              deployment platforms, but don't always understand what happens
              after the code is pushed.
            </p>
            <p className="text-lg md:text-xl font-bold leading-relaxed text-foreground">
              For a technology this central, that's a big problem.
            </p>
          </section>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            <div className="bg-secondary border-4 border-border neo-shadow p-6 text-center">
              <div className="text-4xl font-black mb-2">5.6M+</div>
              <div className="text-sm font-bold text-foreground/70">
                Kubernetes users worldwide
              </div>
            </div>
            <div className="bg-secondary border-4 border-border neo-shadow p-6 text-center">
              <div className="text-4xl font-black mb-2">94%</div>
              <div className="text-sm font-bold text-foreground/70">
                Organizations using K8s in production
              </div>
            </div>
            <div className="bg-secondary border-4 border-border neo-shadow p-6 text-center">
              <div className="text-4xl font-black mb-2">???</div>
              <div className="text-sm font-bold text-foreground/70">
                Devs who truly understand it
              </div>
            </div>
          </div>

          {/* Section: Kubernetes is meant for more than Ops */}
          <section id="devs-ops" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary border-4 border-border neo-shadow p-3">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black">
                Kubernetes is meant for more than Ops
              </h2>
            </div>
            <div className="space-y-4 text-foreground">
              <p className="text-lg leading-relaxed">
                Kubernetes was not designed to be exclusive to operations teams.
                From the beginning, it introduced concepts that clearly separate
                infrastructure concerns from application concerns — and exposes
                powerful abstractions that developers can safely use.
              </p>
              <p className="text-lg leading-relaxed">
                Objects like{" "}
                <code className="font-black bg-secondary px-2 py-1">
                  IngressClass
                </code>
                ,{" "}
                <code className="font-black bg-secondary px-2 py-1">
                  StorageClass
                </code>
                ,{" "}
                <code className="font-black bg-secondary px-2 py-1">
                  ConfigMap
                </code>
                , or{" "}
                <code className="font-black bg-secondary px-2 py-1">
                  Service
                </code>{" "}
                exist precisely so that devs don't have to know the full
                complexity of the underlying network or storage layer.
              </p>

              <div className="bg-primary/10 border-l-4 border-primary p-6 my-6">
                <p className="text-xl font-black italic">
                  But in practice, we've often gone the opposite way.
                </p>
              </div>

              <p className="text-lg leading-relaxed">
                Kubernetes has been handed over almost entirely to platform and
                ops teams, while developers are told to "just apply this YAML
                file" — without much explanation. If something breaks, they
                escalate. If something doesn't behave as expected, they wait.
              </p>
              <p className="text-lg leading-relaxed font-medium">
                This creates a deep disconnect. Developers write the code that
                runs in Kubernetes, but they rarely feel any ownership over how
                it behaves once deployed. That disconnect slows down teams,
                increases friction, and erodes confidence.
              </p>
            </div>
          </section>

          {/* CTA 1 */}
          <div className="bg-secondary border-4 border-border neo-shadow p-8 text-center my-16">
            <p className="text-lg font-bold mb-4">Sound familiar?</p>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 bg-primary border-4 border-border text-primary-foreground neo-shadow px-6 py-3 font-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Section: Documentation is not enough */}
          <section id="docs" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary border-4 border-border neo-shadow p-3">
                <Code2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black">
                Documentation is not enough
              </h2>
            </div>
            <div className="space-y-4 text-foreground">
              <p className="text-lg leading-relaxed">
                Don't get me wrong — Kubernetes has fantastic documentation.
                It's structured, complete, and deeply detailed.
              </p>
              <p className="text-lg leading-relaxed">
                But learning a complex system like Kubernetes requires more than
                good docs. It requires{" "}
                <strong className="font-black">practice</strong>. You have to
                break things. Fix them. Read logs. Check events. Try something,
                fail, and learn from it.
              </p>

              <div className="bg-secondary border-4 border-border neo-shadow p-6 my-6">
                <p className="text-lg font-black mb-3">
                  Most tutorials work perfectly... if you follow the steps.
                </p>
                <p className="text-foreground/80 text-base">
                  But they don't teach you what to do when a Pod is stuck in{" "}
                  <code className="font-mono bg-background px-2 py-1">
                    CrashLoopBackOff
                  </code>
                  , or when traffic doesn't reach your backend, or when your
                  RBAC rules silently block access.
                </p>
              </div>

              <p className="text-xl font-black leading-relaxed">
                That's where the idea for Kubeasy came from.
              </p>
            </div>
          </section>

          {/* Section: What is Kubeasy */}
          <section id="solution" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary border-4 border-border neo-shadow p-3">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black">
                What is Kubeasy?
              </h2>
            </div>
            <div className="space-y-4 text-foreground">
              <p className="text-lg leading-relaxed">
                Kubeasy is a learning platform that puts developers in front of{" "}
                <strong className="font-black">
                  realistic Kubernetes problems
                </strong>{" "}
                — and lets them figure it out.
              </p>
              <p className="text-lg leading-relaxed">
                Each challenge is designed like a miniature incident. You're
                dropped into a local cluster where something isn't working: a
                Job fails, a Deployment is misconfigured, a NetworkPolicy blocks
                traffic, a healthcheck crashes the app. You get a bit of context
                — just like in a real team — and then you're on your own to
                solve it.
              </p>

              <div className="bg-primary text-primary-foreground border-4 border-border neo-shadow p-8 my-6">
                <p className="text-xl md:text-2xl font-black mb-3">
                  There's no guided path. No script to follow.
                </p>
                <p className="text-lg font-bold">
                  Only a problem, the cluster, and your tools.
                </p>
              </div>

              <p className="text-lg leading-relaxed">
                You explore the situation with{" "}
                <code className="font-black bg-secondary px-2 py-1">
                  kubectl
                </code>
                , maybe look at logs, describe resources, test hypotheses, and
                try to fix the issue. Once you think you've got it, you run{" "}
                <code className="font-black bg-secondary px-2 py-1 font-mono">
                  kubeasy verify
                </code>
                , which uses a combination of static policies (Rego, Kyverno)
                and dynamic checks to confirm your solution.
              </p>
            </div>

            {/* Code example */}
            <div className="bg-background border-4 border-border neo-shadow p-6 my-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4 font-sans">
                <Terminal className="w-4 h-4" />
                <span className="font-black text-xs uppercase">
                  Example Workflow
                </span>
              </div>
              <div className="space-y-2 text-foreground/80">
                <div>
                  <span className="text-primary">$</span> kubeasy challenge
                  start networking-basics
                </div>
                <div className="text-foreground/60">✓ Cluster created</div>
                <div className="text-foreground/60">✓ Challenge deployed</div>
                <div className="text-foreground/60">✓ Ready to debug!</div>
                <div className="mt-4">
                  <span className="text-primary">$</span> kubectl get pods
                </div>
                <div className="text-foreground/60">NAME STATUS RESTARTS</div>
                <div className="text-foreground/60">
                  backend-XXX CrashLoopBackOff 5
                </div>
                <div className="mt-4">
                  <span className="text-primary">$</span> kubectl logs
                  backend-XXX
                </div>
                <div className="text-red-500">Error: Connection refused...</div>
                <div className="mt-4 text-foreground/60">
                  # ... investigate, fix, verify ...
                </div>
                <div className="mt-4">
                  <span className="text-primary">$</span> kubeasy verify
                </div>
                <div className="text-green-500">
                  ✓ Challenge completed! +50 XP
                </div>
              </div>
            </div>
          </section>

          {/* Section: Everything runs locally */}
          <section id="local" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary border-4 border-border neo-shadow p-3">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black">
                Everything runs locally
              </h2>
            </div>
            <div className="space-y-4 text-foreground">
              <p className="text-lg leading-relaxed">
                Kubeasy is 100% local. When you start a challenge, it
                automatically sets up a{" "}
                <a
                  href="https://kind.sigs.k8s.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-black underline hover:no-underline"
                >
                  Kind
                </a>{" "}
                cluster on your machine, prepares the resources, installs
                validation policies, and runs everything inside an isolated
                namespace.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-secondary border-4 border-border neo-shadow p-4">
                  <div className="text-3xl mb-2">💸</div>
                  <div className="font-black mb-1">No cloud billing</div>
                  <div className="text-sm text-foreground/70">
                    Everything runs on your machine
                  </div>
                </div>
                <div className="bg-secondary border-4 border-border neo-shadow p-4">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="font-black mb-1">Instant start</div>
                  <div className="text-sm text-foreground/70">
                    No waiting for cloud clusters
                  </div>
                </div>
                <div className="bg-secondary border-4 border-border neo-shadow p-4">
                  <div className="text-3xl mb-2">🔒</div>
                  <div className="font-black mb-1">Complete privacy</div>
                  <div className="text-sm text-foreground/70">
                    No data leaves your computer
                  </div>
                </div>
                <div className="bg-secondary border-4 border-border neo-shadow p-4">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="font-black mb-1">Isolated environments</div>
                  <div className="text-sm text-foreground/70">
                    Each challenge in its own namespace
                  </div>
                </div>
              </div>

              <p className="text-lg leading-relaxed">
                You have full access to the cluster — you can use{" "}
                <code className="bg-secondary px-2 py-1">kubectl</code>,
                dashboards like Lens, port-forwarding, anything. It's the
                closest you can get to production debugging — without breaking
                anything.
              </p>
            </div>
          </section>

          {/* CTA 2 */}
          <div className="bg-primary border-4 border-border neo-shadow p-8 text-center my-16">
            <p className="text-xl font-black text-primary-foreground mb-2">
              Ready to get hands-on?
            </p>
            <p className="text-primary-foreground/90 mb-6">
              Install the CLI and start your first challenge
            </p>
            <div className="bg-background border-4 border-border neo-shadow p-4 font-mono text-sm inline-block">
              <span className="text-foreground/60">$</span> npm install -g
              @kubeasy/cli
            </div>
          </div>

          {/* Section: Not about turning devs into SREs */}
          <section id="philosophy" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-black mb-6">
              It's not about turning devs into SREs
            </h2>
            <div className="space-y-4 text-foreground">
              <p className="text-lg leading-relaxed">
                The goal of Kubeasy isn't to replace your platform team. It's to
                make sure developers feel confident enough to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="flex items-start gap-3 bg-secondary/50 border-2 border-border p-4">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span className="font-medium">
                    Understand what's happening inside the cluster
                  </span>
                </div>
                <div className="flex items-start gap-3 bg-secondary/50 border-2 border-border p-4">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span className="font-medium">
                    Debug their own applications
                  </span>
                </div>
                <div className="flex items-start gap-3 bg-secondary/50 border-2 border-border p-4">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span className="font-medium">
                    Fix common misconfigurations
                  </span>
                </div>
                <div className="flex items-start gap-3 bg-secondary/50 border-2 border-border p-4">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span className="font-medium">
                    Handle basic runtime issues
                  </span>
                </div>
              </div>
              <p className="text-xl font-black leading-relaxed">
                In short, to operate Kubernetes at{" "}
                <span className="text-primary">level one</span>.
              </p>
              <p className="text-lg leading-relaxed">
                As more code gets written by AI, developers will be judged less
                by what they can write and more by what they can understand,
                debug, and ship with confidence. Owning what happens{" "}
                <strong className="font-black">after deploy</strong> is a huge
                part of that.
              </p>
            </div>
          </section>

          {/* Section: Built from experience */}
          <section id="experience" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-black mb-6">
              Built from experience
            </h2>
            <div className="space-y-4 text-foreground">
              <p className="text-lg leading-relaxed">
                Kubeasy isn't a weekend hack or a side project made in
                isolation. It's the result of real-world experience — years
                spent managing Kubernetes clusters in production, debugging
                issues at 2AM, onboarding dev teams who had never seen a Pod,
                and building internal tools to simplify life for both devs and
                ops.
              </p>
              <div className="bg-secondary/50 border-l-4 border-primary p-6 my-6">
                <p className="text-lg font-medium italic">
                  "What people needed wasn't more tooling. It was better
                  understanding. And that only comes with exposure and
                  repetition."
                </p>
              </div>
              <p className="text-lg leading-relaxed">
                So I built Kubeasy to create that kind of learning environment —
                safely, locally, and repeatably.
              </p>
            </div>
          </section>

          {/* Section: Open source */}
          <section id="open-source" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary border-4 border-border neo-shadow p-3">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black">
                Open source by design
              </h2>
            </div>
            <div className="space-y-4 text-foreground">
              <p className="text-lg leading-relaxed">
                Kubeasy is open source because it should be. Learning
                infrastructure shouldn't be a black box.
              </p>
              <p className="text-lg leading-relaxed">
                You should be able to inspect how a challenge works, how a
                verification is written, how policies are applied. You should be
                able to suggest new challenges based on real bugs you've seen,
                or adapt existing ones to match your stack.
              </p>

              <div className="bg-background border-4 border-border neo-shadow p-6 my-6">
                <h3 className="font-black mb-4 flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  Open Source Repositories
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    <a
                      href={`${siteConfig.links.github}/kubeasy-cli`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      kubeasy-cli
                    </a>
                    <span className="text-foreground/60">
                      - CLI tool (Go + Cobra)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    <a
                      href={`${siteConfig.links.github}/challenges`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      challenges
                    </a>
                    <span className="text-foreground/60">
                      - Challenge repository
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    <a
                      href={`${siteConfig.links.github}/challenge-operator`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      challenge-operator
                    </a>
                    <span className="text-foreground/60">
                      - Kubernetes operator
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-lg leading-relaxed">
                Open source also brings trust. You know there's no hidden logic,
                no data being collected, no dark patterns. Just a CLI and some
                YAML files designed to help people learn.
              </p>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="mb-16">
            <div className="bg-primary border-4 border-border neo-shadow p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-black text-primary-foreground mb-6">
                Ready to start learning?
              </h2>
              <p className="text-lg md:text-xl font-bold text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Whether you're a dev trying to learn Kubernetes, an SRE tired of
                answering the same questions, or a team lead looking to level up
                your engineers — we'd love for you to try Kubeasy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/challenges"
                  className="bg-secondary border-4 border-border neo-shadow px-8 py-4 font-black text-lg md:text-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
                >
                  Browse Challenges
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background border-4 border-border neo-shadow px-8 py-4 font-black text-lg md:text-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                </a>
              </div>
            </div>
          </section>

          {/* Final message */}
          <div className="text-center text-xl text-foreground font-bold italic mb-16">
            <p>
              Let's make Kubernetes less mysterious — one challenge at a time.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
