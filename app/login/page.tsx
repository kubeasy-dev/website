import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginCard } from "@/components/login-card";
import { auth } from "@/lib/auth";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

function isValidCallbackUrl(url: string): boolean {
  // Only allow relative paths starting with / (but not //)
  return url.startsWith("/") && !url.startsWith("//");
}

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-4 justify-center">
            <div className="w-10 h-10 bg-foreground/10 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-foreground/10 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-64 bg-foreground/10 rounded mx-auto animate-pulse"></div>
          <div className="h-6 w-72 bg-foreground/10 rounded mx-auto animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-secondary border-4 border-border neo-shadow animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const callbackUrl = next && isValidCallbackUrl(next) ? next : "/dashboard";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect(callbackUrl);
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

        <LoginCard callbackUrl={callbackUrl} />
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
