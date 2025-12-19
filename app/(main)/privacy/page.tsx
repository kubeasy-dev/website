import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name}`,
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none space-y-8">
        <p className="text-muted-foreground font-medium">
          Last updated: December 2024
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Overview</h2>
          <p className="font-medium">
            {siteConfig.name} is committed to protecting your privacy. This
            policy explains how we handle your data when you use our platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Data We Collect</h2>
          <p className="font-medium">When you create an account, we collect:</p>
          <ul className="list-disc pl-6 space-y-2 font-medium">
            <li>Email address (for authentication)</li>
            <li>Username (for identification)</li>
            <li>Challenge progress and submissions</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Local-First Approach</h2>
          <p className="font-medium">
            {siteConfig.name} is designed with a local-first philosophy:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-medium">
            <li>
              All Kubernetes challenges run entirely on your local machine using
              Kind
            </li>
            <li>
              We never have access to your local cluster or the solutions you
              implement
            </li>
            <li>
              Only validation results (pass/fail) are sent to our servers when
              you submit a challenge
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-2 font-medium">
            <li>Track your learning progress across challenges</li>
            <li>Display your achievements and stats on your profile</li>
            <li>Improve the platform based on aggregate usage patterns</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Third-Party Services</h2>
          <p className="font-medium">We use the following services:</p>
          <ul className="list-disc pl-6 space-y-2 font-medium">
            <li>
              <strong>Authentication:</strong> Secure login via email or OAuth
              providers
            </li>
            <li>
              <strong>Analytics:</strong> Privacy-friendly analytics to
              understand usage (no personal tracking)
            </li>
            <li>
              <strong>Hosting:</strong> Vercel for website hosting
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Your Rights</h2>
          <p className="font-medium">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 font-medium">
            <li>Access your personal data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Contact</h2>
          <p className="font-medium">
            For privacy-related questions, please open an issue on our{" "}
            <Link
              href={siteConfig.links.github}
              target="_blank"
              className="text-primary hover:underline font-bold"
            >
              GitHub repository
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
