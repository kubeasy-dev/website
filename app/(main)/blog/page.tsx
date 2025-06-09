import Link from "next/link";
import { blog, BlogPage } from "@/lib/source";
import { Badge } from "@/components/ui/badge";

function getPostDate(post: BlogPage): Date | null {
  const { date } = post.data;
  if (date instanceof Date && !isNaN(date.getTime())) return date;
  if (typeof date === "string") {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) ? parsed : null;
  }
  return null;
}

export default function Page(): React.ReactElement {
  const posts = [...blog.getPages()]
    .map((post) => ({ ...post, _parsedDate: getPostDate(post) }))
    .filter((post) => post._parsedDate !== null)
    .sort((a, b) => b._parsedDate!.getTime() - a._parsedDate!.getTime());

  return (
    <section className='bg-background text-foreground'>
      <div className=''>
        {/* Hero Section */}
        <div className='p-12 text-center mb-16'>
          <h1 className='text-5xl font-bold mb-4'>Kubeasy Blog</h1>
          <p className='text-lg opacity-90'>Explore captivating articles on Kubernetes, DevOps, and Cloud Native.</p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>No blog posts available yet.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' role='feed' aria-label='Blog posts'>
            {posts.map((post) => (
              <div key={post.url} className='h-full flex'>
                <Link
                  href={post.url}
                  className='flex-1 flex flex-col group rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-primary/50 outline-none'
                >
                  <div className='flex flex-row justify-between items-center gap-2 mb-4'>
                    <time className='text-sm text-muted-foreground' dateTime={post._parsedDate!.toISOString()}>
                      {post._parsedDate!.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                    </time>
                    <Badge>{post.data.category.toUpperCase()}</Badge>
                  </div>
                  <h2 className='text-xl font-bold mb-2 group-hover:text-primary transition-colors'>{post.data.title}</h2>
                  <p className='mb-4 text-base text-muted-foreground line-clamp-3'>{post.data.description}</p>
                  <span className='mt-auto text-primary font-medium text-sm group-hover:underline'>Read more →</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
