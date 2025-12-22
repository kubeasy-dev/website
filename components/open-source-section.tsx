import { GitFork, Github, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OpenSourceSection() {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />

      <div className="max-w-7xl  px-4 mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 font-black text-sm uppercase tracking-wider">
            <Heart className="w-5 h-5" />
            Open Source
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Built by the community,
            <br />
            <span className="text-primary">for the community</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            Kubeasy is completely open-source. All challenges, CLI tools, and
            platform code are available on GitHub. Join us in making Kubernetes
            learning accessible to everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* GitHub Repository Card */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all">
            <div className="w-16 h-16 bg-black rounded-xl border-4 border-black flex items-center justify-center mb-6">
              <Github className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-3">Free Forever</h3>
            <p className="text-gray-700 font-medium mb-6">
              All challenges and tools are free to use. No hidden costs, no
              premium tiers. Just pure learning.
            </p>
            <Button className="w-full bg-black text-white border-4 border-black font-black text-lg py-6 hover:bg-gray-800">
              View on GitHub
            </Button>
          </div>

          {/* Community Contributions Card */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all">
            <div className="w-16 h-16 bg-secondary rounded-xl border-4 border-black flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-2xl font-black mb-3">Community Driven</h3>
            <p className="text-gray-700 font-medium mb-6">
              Challenges are created and reviewed by the community. Share your
              knowledge and help others learn.
            </p>
            <Button className="w-full bg-secondary text-secondary-foreground border-4 border-black font-black text-lg py-6 hover:bg-secondary/80">
              Contribute
            </Button>
          </div>

          {/* Fork & Customize Card */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all">
            <div className="w-16 h-16 bg-accent rounded-xl border-4 border-black flex items-center justify-center mb-6">
              <GitFork className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-2xl font-black mb-3">Fork & Customize</h3>
            <p className="text-gray-700 font-medium mb-6">
              Create your own challenges, customize the platform, or use it for
              your team&apos;s training needs.
            </p>
            <Button className="w-full bg-accent text-accent-foreground border-4 border-black font-black text-lg py-6 hover:bg-accent/80">
              Fork Project
            </Button>
          </div>
        </div>

        {/* License Badge */}
        <div className="bg-primary border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="text-primary-foreground font-black text-lg">
            Released under the{" "}
            <span className="underline underline-offset-4">
              Apache 2.0 License
            </span>{" "}
            — use it however you want
          </p>
        </div>
      </div>
    </section>
  );
}
