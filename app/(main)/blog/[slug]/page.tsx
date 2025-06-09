import { notFound } from "next/navigation";
import Link from "next/link";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { blog } from "@/lib/source";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CustomTOC } from "./page.client";
import { Badge } from "@/components/ui/badge";

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);
  if (!page) notFound();
  const Mdx = page.data.body;

  return (
    <>
      <header className='relative w-full bg-gradient-to-br from-background/90 to-secondary/70 px-0 py-14 md:py-20 border-b border-border overflow-hidden'>
        <div className='max-w-2xl mx-auto px-4 flex flex-col items-center text-center'>
          <span className='text-sm text-muted-foreground'>{new Date(page.data.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
          <h1 className='mt-1 mb-2 text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent'>{page.data.title}</h1>
          <span className='text-sm text-muted-foreground mb-4'>by {page.data.author}</span>
          <p className='mb-5 text-lg md:text-xl text-foreground/80'>{page.data.description}</p>
          <div className='flex flex-wrap gap-3 items-center justify-center mb-3'>
            <Badge>{page.data.category.toUpperCase()}</Badge>
          </div>
          <Link href='/blog' className='inline-flex items-center gap-1 text-foreground hover:underline text-sm font-medium mt-2' aria-label='Back to blog'>
            ← Back to Blog
          </Link>
        </div>
      </header>

      <div className='max-w-7xl mx-auto flex md:flex-row flex-col gap-6 md:gap-12 py-10 md:py-20 px-4'>
        <aside className='hidden md:block md:w-56 flex-shrink-0 sticky top-24 self-start h-fit bg-background/80 rounded-xl p-4'>
          <Card className='bg-transparent'>
            <CardHeader>
              <CardTitle className='text-xs uppercase font-semibold tracking-widest text-muted-foreground'>On this page</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomTOC items={page.data.toc} />
            </CardContent>
          </Card>
        </aside>

        {/* Article Content */}
        <article className='flex-1 w-full min-w-0 prose prose-lg prose-primary max-w-none'>
          <Mdx components={defaultMdxComponents} />

          <footer className='flex flex-col md:flex-row gap-4 md:gap-16 border-t border-border pt-7 mt-12'>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground uppercase font-semibold tracking-widest'>Written by</span>
              <span className='font-medium text-base'>{page.data.author}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground uppercase font-semibold tracking-widest'>Published</span>
              <span className='font-medium text-base'>{new Date(page.data.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground uppercase font-semibold tracking-widest'>Category</span>
              <span className='font-medium text-base'>{page.data.category}</span>
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}

export function generateStaticParams(): { slug: string }[] {
  return blog.getPages().flatMap((page) => page.slugs.map((slug) => ({ slug })));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);
  if (!page) notFound();
  return {
    title: `${page.data.title} | Kubeasy Blog`,
    description: page.data.description,
  };
}
