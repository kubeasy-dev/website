import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { LoginCard } from "@/components/login-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Kubeasy" width={40} height={40} />
              <span className="text-2xl font-black">Kubeasy</span>
            </Link>
            <h1 className="text-4xl font-black text-balance">
              You are already logged in
            </h1>
            <Button variant="default" size="lg" className="mt-4" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Image src="/logo.png" alt="Kubeasy" width={40} height={40} />
            <span className="text-2xl font-black">Kubeasy</span>
          </Link>
          <h1 className="text-4xl font-black text-balance">Welcome back</h1>
          <p className="text-foreground/70 text-lg">
            Sign in to continue your Kubernetes journey
          </p>
        </div>

        <LoginCard />
        <p className="text-xs text-center text-foreground/60">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary font-bold">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className=" text-primary font-bold">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
