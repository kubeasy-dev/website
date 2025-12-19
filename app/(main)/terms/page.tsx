import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${siteConfig.name}`,
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-black mb-8">Terms of Service</h1>

      <div className="prose prose-lg max-w-none space-y-8">
        <p className="text-muted-foreground font-medium">
          Last updated: December 2024
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Acceptance of Terms</h2>
          <p className="font-medium">
            By using {siteConfig.name}, you agree to these terms. If you
            disagree with any part, please do not use the platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Description of Service</h2>
          <p className="font-medium">
            {siteConfig.name} is an open-source platform for learning Kubernetes
            through hands-on challenges. The service includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-medium">
            <li>A CLI tool for running challenges locally</li>
            <li>
              A web interface for browsing challenges and tracking progress
            </li>
            <li>Challenge content and validation systems</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2 font-medium">
            <li>
              You are responsible for maintaining the security of your account
            </li>
            <li>
              You must provide accurate information when creating an account
            </li>
            <li>
              You may delete your account at any time from your profile settings
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Acceptable Use</h2>
          <p className="font-medium">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 font-medium">
            <li>
              Attempt to exploit or compromise the platform&apos;s security
            </li>
            <li>Submit false or manipulated challenge results</li>
            <li>Use the platform for any illegal purposes</li>
            <li>Harass or harm other users</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Open Source License</h2>
          <p className="font-medium">
            {siteConfig.name} is open-source software licensed under the{" "}
            <Link
              href={`${siteConfig.links.github}/website/blob/main/LICENSE`}
              target="_blank"
              className="text-primary hover:underline font-bold"
            >
              Apache License 2.0
            </Link>
            . You are free to use, modify, and distribute the code according to
            the license terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Disclaimer</h2>
          <p className="font-medium">
            The platform is provided &quot;as is&quot; without warranties of any
            kind. We do not guarantee:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-medium">
            <li>Uninterrupted availability of the service</li>
            <li>That challenges will work on all system configurations</li>
            <li>
              That completing challenges will result in any certification or
              credential
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Limitation of Liability</h2>
          <p className="font-medium">
            To the maximum extent permitted by law, {siteConfig.name} and its
            contributors shall not be liable for any indirect, incidental, or
            consequential damages arising from your use of the platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Changes to Terms</h2>
          <p className="font-medium">
            We may update these terms from time to time. Continued use of the
            platform after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Contact</h2>
          <p className="font-medium">
            For questions about these terms, please open an issue on our{" "}
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
