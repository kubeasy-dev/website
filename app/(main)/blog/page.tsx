import Link from "next/link";
import { blog, BlogPage } from "@/lib/source";

function isValidDateValue(dateValue: unknown): boolean {
  if (!dateValue) return false;
  if (dateValue instanceof Date) return !isNaN(dateValue.getTime());
  if (typeof dateValue === "string") {
    const d = new Date(dateValue);
    return !isNaN(d.getTime());
  }
  return false;
}

function getPostDate(post: BlogPage): Date | null {
  const { date } = post.data;
  if (date instanceof Date && !isNaN(date.getTime())) return date;
  if (typeof date === "string" && isValidDateValue(date)) return new Date(date);
  return null;
}

export default function Page(): React.ReactElement {
  const posts = [...blog.getPages()]
    .map((post) => ({ ...post, _parsedDate: getPostDate(post) }))
    .filter((post) => post._parsedDate !== null)
    .sort((a, b) => (b._parsedDate as Date).getTime() - (a._parsedDate as Date).getTime());

  return (
    <section className='bg-background text-foreground'>
      <div className=''>
        {/* Hero Section */}
        <div className='p-12 text-center mb-16'>
          <h1 className='text-5xl font-bold mb-4'>Kubeasy Blog</h1>
          <p className='text-lg opacity-90'>Explore captivating articles on Kubernetes, DevOps, and Cloud Native.</p>
        </div>

        {/* Posts Timeline */}
        <div className='relative border-l border-border pl-8 space-y-12'>
          {posts.map((post) => (
            <div key={post.url} className='relative grid grid-cols-[auto_1fr] gap-x-12 items-start'>
              <div className='flex flex-col items-end space-y-1'>
                <time className='text-sm text-muted-foreground'>
                  {post._parsedDate ? post._parsedDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : <span className='italic text-gray-400'>Unknown date</span>}
                </time>
                {post.data.category && <span className='text-sm font-medium text-secondary-foreground'>{post.data.category}</span>}
              </div>
              <div className='relative'>
                <span className='absolute -left-4 top-2 w-3 h-3 bg-primary rounded-full border border-background'></span>
                <h3 className='text-xl font-semibold'>{post.data.title}</h3>
                <p className='my-2 text-base text-muted-foreground'>{post.data.description}</p>
                <Link href={post.url} className='text-primary font-medium'>
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
