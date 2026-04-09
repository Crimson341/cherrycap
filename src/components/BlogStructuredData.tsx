import { portfolioConfig } from "@/lib/portfolioConfig";

export function BlogStructuredData({ post }: { post?: { slug: string; title: string; excerpt: string; publishedAt: string } }) {
  if (!post) return null;
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${portfolioConfig.seo.url}/blog/${post.slug}`
    },
    "headline": post.title,
    "description": post.excerpt,
    "image": `${portfolioConfig.seo.url}/og-image.png`,
    "author": {
      "@type": "Organization",
      "name": portfolioConfig.name,
      "url": portfolioConfig.seo.url
    },
    "publisher": {
      "@type": "Organization",
      "name": portfolioConfig.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${portfolioConfig.seo.url}/myImage.png`
      }
    },
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": portfolioConfig.seo.url
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${portfolioConfig.seo.url}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `${portfolioConfig.seo.url}/blog/${post.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
    </>
  );
} 
