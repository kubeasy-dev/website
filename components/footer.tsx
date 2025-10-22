import { Github, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t-4 border-border py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Kubeasy"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-black">Kubeasy</span>
            </Link>
            <p className="text-sm font-medium">
              Learn Kubernetes through interactive CLI challenges. Free and open
              source.
            </p>
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
                <Link
                  href="https://github.com"
                  target="_blank"
                  className="hover:text-primary transition-colors"
                >
                  GitHub
                </Link>
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
                <Link href="#" className="hover:text-primary transition-colors">
                  License
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t-2 border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-bold">
            © 2025 Kubeasy. Open source under MIT License.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com"
              target="_blank"
              className="hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              className="hover:text-primary transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
