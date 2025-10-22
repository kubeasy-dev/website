import { Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotLoggedInProps {
  slug: string;
}

export function NotLoggedIn({ slug }: NotLoggedInProps) {
  return (
    <div className="space-y-6">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-primary text-primary-foreground">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Terminal className="h-6 w-6" />
            <CardTitle className="text-2xl font-black">
              Ready to Start?
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base font-medium">
            Log in and use the Kubeasy CLI to start this challenge on your local
            Kubernetes cluster.
          </p>
          <div className="bg-black text-green-400 p-4 rounded-lg border-4 border-black font-mono text-sm">
            <span className="text-gray-500">$</span> kubeasy challenge start{" "}
            {slug}
          </div>
        </CardContent>
      </Card>

      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-secondary">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black">Need the CLI?</h3>
            <p className="text-base font-medium">
              Install Kubeasy CLI to start solving challenges locally.
            </p>
            <Button
              size="lg"
              className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all font-black text-lg px-8"
              asChild
            >
              <Link href="/login">Log In to Get Started</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
