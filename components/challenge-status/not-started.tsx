import { Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotStartedProps {
  slug: string;
}

export function NotStarted({ slug }: NotStartedProps) {
  return (
    <Card className="neo-border-thick neo-shadow-xl bg-primary text-primary-foreground">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Terminal className="h-6 w-6" />
          <CardTitle className="text-2xl font-black">Ready to Start?</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium">
          Use the Kubeasy CLI to start this challenge on your local Kubernetes
          cluster.
        </p>
        <div className="bg-black text-green-400 p-4 rounded-lg neo-border-thick font-mono text-sm">
          <span className="text-gray-500">$</span> kubeasy challenge start{" "}
          {slug}
        </div>
      </CardContent>
    </Card>
  );
}
