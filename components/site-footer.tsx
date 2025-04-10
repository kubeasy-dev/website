import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export function SiteFooter() {
  const number = performance.now();
  const date = new Date(number);

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col gap-10 py-16">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Product</h3>
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              How It Works
            </Link>
            <Link href="#open-source" className="text-sm text-muted-foreground hover:text-foreground">
              Open Source
            </Link>
            <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">
              Testimonials
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Documentation
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Challenges
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Blog
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Community
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">© {date.getFullYear()} Kubeasy. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              GitHub
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Twitter
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

