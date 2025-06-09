import Link from "next/link";
import { blog, BlogPage } from "@/lib/source";

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

        {/* Posts Timeline */}
        {posts.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>No blog posts available yet.</p>
          </div>
        ) : (
          <div className='relative border-l border-border pl-8 space-y-12' role='feed' aria-label='Blog posts timeline'>
            {posts.map((post) => (
              <div key={post.url} className='relative grid grid-cols-[auto_1fr] gap-x-12 items-start'>
                <div className='flex flex-col items-end space-y-1'>
                  <time className='text-sm text-muted-foreground' dateTime={post._parsedDate!.toISOString()}>
                    {post._parsedDate!.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </time>
                  {post.data.category && <span className='text-sm font-medium text-secondary-foreground'>{post.data.category}</span>}
                </div>
                <div className='relative'>
                  <span className='absolute -left-4 top-2 w-3 h-3 bg-primary rounded-full border border-background'></span>
                  <h2 className='text-xl font-semibold'>{post.data.title}</h2>
                  <p className='my-2 text-base text-muted-foreground'>{post.data.description}</p>
                  <Link href={post.url} className='text-primary font-medium' aria-label={`Read more about ${post.data.title}`}>
                    Read more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
