import { Github, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TrackedOutboundLink } from "@/components/tracked-outbound-link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t-4 border-border py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt={siteConfig.name}
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-black">{siteConfig.name}</span>
            </Link>
            <p className="text-sm font-medium">{siteConfig.description}</p>
          </div>

          <div>
            <h3 className="font-black mb-4">Product</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link
                  href="/challenges"
                  className="hover:text-primary transition-colors"
                >
                  Challenges
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  CLI Tool
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-black mb-4">Community</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <TrackedOutboundLink
                  href={siteConfig.links.github}
                  target="_blank"
                  linkType="github"
                  location="footer_community"
                  className="hover:text-primary transition-colors"
                >
                  GitHub
                </TrackedOutboundLink>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Discord
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Contribute
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-black mb-4">Legal</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <TrackedOutboundLink
                  href={`${siteConfig.links.github}/${siteConfig.github.repo}/blob/main/LICENSE`}
                  target="_blank"
                  linkType="github"
                  location="footer_legal"
                  className="hover:text-primary transition-colors"
                >
                  License
                </TrackedOutboundLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t-2 border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-bold">
            © 2025 {siteConfig.name}. Open source under Apache License 2.0.
          </p>
          <div className="flex items-center gap-4">
            <TrackedOutboundLink
              href={siteConfig.links.github}
              target="_blank"
              linkType="github"
              location="footer_social"
              className="hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
            </TrackedOutboundLink>
            <TrackedOutboundLink
              href={siteConfig.links.twitter}
              target="_blank"
              linkType="twitter"
              location="footer_social"
              className="hover:text-primary transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </TrackedOutboundLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
