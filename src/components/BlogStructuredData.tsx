import { publishedBlogPosts, type BlogPost } from "@/lib/blogPosts";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { absoluteUrl, safeJsonLd } from "@/lib/seo";

interface BlogStructuredDataProps {
  post?: BlogPost;
}

export function BlogStructuredData({ post }: BlogStructuredDataProps) {
  if (!post) {
    const blogSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": absoluteUrl("/blog#blog"),
      url: absoluteUrl("/blog"),
      name: "Cherry Capital Blog",
      description:
        "Notes from building websites for Northern Michigan businesses.",
      inLanguage: "en-US",
      publisher: {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: portfolioConfig.name,
      },
      blogPost: publishedBlogPosts.map((entry) => ({
        "@type": "BlogPosting",
        "@id": absoluteUrl(`/blog/${entry.slug}#article`),
        headline: entry.title,
        url: absoluteUrl(`/blog/${entry.slug}`),
        datePublished: entry.publishedAt,
        dateModified: entry.updatedAt ?? entry.publishedAt,
        description: entry.excerpt,
        articleSection: entry.category,
        keywords: entry.tags.join(", "),
        inLanguage: "en-US",
        isAccessibleForFree: true,
      })),
    };

    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: portfolioConfig.seo.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: absoluteUrl("/blog"),
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(blogSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(breadcrumbData),
          }}
        />
      </>
    );
  }

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": absoluteUrl(`/blog/${post.slug}#article`),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(`/blog/${post.slug}`),
    image: [
      {
        "@type": "ImageObject",
        url: absoluteUrl("/og-image.webp"),
        width: 1200,
        height: 630,
        caption: post.title,
      },
    ],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    inLanguage: "en-US",
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: portfolioConfig.name,
      url: portfolioConfig.seo.url,
    },
    publisher: {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: portfolioConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/avatar.webp"),
        width: 320,
        height: 320,
      },
    },
    isPartOf: {
      "@type": "Blog",
      "@id": absoluteUrl("/blog#blog"),
      name: "Cherry Capital Blog",
    },
    about: [
      { "@type": "Thing", name: "Web development" },
      { "@type": "Thing", name: post.category },
      { "@type": "Place", name: "Northern Michigan" },
      ...post.tags.slice(0, 4).map((tag) => ({
        "@type": "Thing" as const,
        name: tag,
      })),
    ],
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article h1", "article p"],
    },
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: portfolioConfig.seo.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: absoluteUrl("/blog"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: absoluteUrl(`/blog/${post.slug}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(articleStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(breadcrumbData),
        }}
      />
    </>
  );
}
