"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Container } from "@/components/ui/container";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Login() {
  return (
    <Container className='flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-bold tracking-tight'>Sign in to Kubeasy</h2>
          <p className='mt-2 text-sm text-muted-foreground'>Choose your preferred method to sign in and start mastering Kubernetes</p>
        </div>
        <Suspense fallback={<Skeleton className='h-12 w-full' />}>
          <LoginForm />
        </Suspense>
        <div className='mt-8 text-center'>
          <p className='text-sm text-muted-foreground'>
            By signing in, you agree to our{" "}
            <Link href='/terms' className='font-medium text-primary hover:underline'>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href='/privacy' className='font-medium text-primary hover:underline'>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </Container>
  );
}
