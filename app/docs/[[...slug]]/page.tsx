import { source } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { GitHubLink } from "@/components/github-link";
import { getGithubLastEdit } from "fumadocs-core/server";
export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();
  const MDX = page.data.body;
  const path = `/content/docs/${page.file.path}`;
  const time = await getGithubLastEdit({
    owner: "kubeasy-dev",
    repo: "website",
    path: `content/docs/${page.file.path}`,
  });
  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className='flex flex-row gap-2 items-center mb-8 border-b pb-6'>
        <span className='text-sm text-muted-foreground'>Last updated: {time ? new Date(time).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown"}</span>
        <GitHubLink url={`https://github.com/kubeasy-dev/website/blob/main/${path}`} />
      </div>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}
export async function generateStaticParams() {
  return source.generateParams();
}
export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  const { slug = [] } = params;
  if (!page) notFound();
  const image = ["/docs-og", ...slug, "image.png"].join("/");
  return {
    title: `${page.data.title} | Kubeasy Documentation`,
    description: page.data.description,
    openGraph: {
      images: image,
    },
    twitter: {
      card: "summary_large_image",
      images: image,
    },
  };
}
