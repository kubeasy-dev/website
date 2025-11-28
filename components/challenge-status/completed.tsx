"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompletedProps {
  slug: string;
}

export function Completed({ slug }: CompletedProps) {
  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-primary text-primary-foreground">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6" />
          <CardTitle className="text-2xl font-black">
            Challenge Completed!
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-base font-medium">
          Congratulations! You've successfully completed this challenge. You can
          clean up the resources with:
        </p>
        <div className="bg-black text-green-400 p-4 rounded-lg border-4 border-black font-mono text-sm">
          <span className="text-gray-500">$</span> kubeasy challenge clean{" "}
          {slug}
        </div>
      </CardContent>
    </Card>
  );
}
