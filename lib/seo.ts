import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
}

/**
 * Generate comprehensive metadata for SEO
 */
export function generateMetadata({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  url,
  noIndex = false,
  keywords = siteConfig.keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  section,
}: SEOProps = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} - ${siteConfig.tagline}`;

  const pageUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;

  const metadata: Metadata = {
    title: pageTitle,
    description,
    keywords,
    authors: authors
      ? authors.map((name) => ({ name }))
      : [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type,
      locale: "en_US",
      url: pageUrl,
      title: pageTitle,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [image],
      creator: siteConfig.links.twitter,
      site: siteConfig.links.twitter,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  // Add article-specific metadata
  if (type === "article" && publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article",
      publishedTime,
      modifiedTime,
      authors: authors?.map((name) => name),
      section,
    };
  }

  return metadata;
}

/**
 * Generate JSON-LD structured data for SoftwareApplication (CLI tool)
 */
export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Kubeasy CLI",
    description:
      "Command-line tool to set up local Kubernetes clusters and run hands-on challenges",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Linux, Windows",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    downloadUrl: "https://www.npmjs.com/package/@kubeasy-dev/kubeasy-cli",
    softwareVersion: "1.0.0",
    aggregateRating: undefined,
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [siteConfig.links.github, siteConfig.links.twitter],
  };
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/challenges?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate JSON-LD structured data for educational course
 */
export function generateCourseSchema({
  name,
  description,
  provider = siteConfig.name,
  url,
}: {
  name: string;
  description: string;
  provider?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider,
      url: siteConfig.url,
    },
    url,
    educationalLevel: "Beginner to Advanced",
    inLanguage: "en",
    isAccessibleForFree: true,
  };
}

/**
 * Generate JSON-LD structured data for learning resource (challenge)
 */
export function generateLearningResourceSchema({
  name,
  description,
  url,
  difficulty,
  estimatedTime,
  theme,
}: {
  name: string;
  description: string;
  url: string;
  difficulty: string;
  estimatedTime: number;
  theme: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name,
    description,
    url,
    educationalLevel: difficulty,
    timeRequired: `PT${estimatedTime}M`,
    learningResourceType: "Hands-on Exercise",
    about: {
      "@type": "Thing",
      name: theme,
    },
    isAccessibleForFree: true,
    inLanguage: "en",
  };
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * Safely stringify JSON-LD data for use in dangerouslySetInnerHTML
 * Escapes characters that could be used for XSS attacks in script tags
 * - Escapes <, >, & to prevent HTML injection
 * - Escapes U+2028 and U+2029 line/paragraph separators that can break JS contexts
 * - Neutralizes </ sequences that could prematurely close script tags
 */
export function stringifyJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
