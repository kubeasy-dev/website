import { LogIn, Zap } from "lucide-react";

interface DemoErrorStateProps {
  error: string | null;
}

export function DemoErrorState({ error }: DemoErrorStateProps) {
  return (
    <div className="container mx-auto px-4 max-w-2xl">
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 neo-border-thick bg-destructive/10 rounded-2xl mb-6">
          <Zap className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-black mb-4">Demo Unavailable</h1>
        <p className="text-lg text-muted-foreground font-bold mb-8 max-w-md mx-auto">
          {error || "Unable to create demo session. Please try again later."}
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black text-lg neo-border-thick neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <LogIn className="w-5 h-5" />
          Sign In Instead
        </a>
      </div>
    </div>
  );
}
