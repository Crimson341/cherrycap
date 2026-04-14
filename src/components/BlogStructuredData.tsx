import { publishedBlogPosts, type BlogPost } from "@/lib/blogPosts";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { absoluteUrl, defaultOgImage, safeJsonLd } from "@/lib/seo";

interface BlogStructuredDataProps {
  post?: BlogPost;
}

export function BlogStructuredData({ post }: BlogStructuredDataProps) {
  if (!post) {
    const listingItems = publishedBlogPosts.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "BlogPosting",
        "@id": absoluteUrl(`/blog/${entry.slug}#article`),
        "headline": entry.title,
        "url": absoluteUrl(`/blog/${entry.slug}`),
        "datePublished": entry.publishedAt,
        "dateModified": entry.updatedAt ?? entry.publishedAt,
        "description": entry.excerpt,
        "image": {
          "@type": "ImageObject",
          "url": absoluteUrl("/og-image.png"),
          "width": defaultOgImage.width,
          "height": defaultOgImage.height,
          "caption": entry.title,
        },
        "publisher": {
          "@type": "Organization",
          "@id": absoluteUrl("/#organization"),
          "name": portfolioConfig.name,
        },
      },
    }));

    const blogSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": absoluteUrl("/blog#blog"),
      "url": absoluteUrl("/blog"),
      "name": "Cherry Capital Blog",
      "description": "Insights on modern web development, performance, and local SEO for local businesses.",
      "publisher": {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization")
      },
      "blogPost": listingItems.map((listing) => listing.item),
      "hasPart": {
        "@type": "ItemList",
        "itemListOrder": "Ascending",
        "numberOfItems": listingItems.length,
        "itemListElement": listingItems,
      },
    };

    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": absoluteUrl("/blog#breadcrumb"),
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
          "item": absoluteUrl("/blog")
        }
      ]
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
    "url": absoluteUrl(`/blog/${post.slug}`),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`)
    },
    "headline": post.title,
    "description": post.excerpt,
    "image": {
      "@type": "ImageObject",
      "url": absoluteUrl("/og-image.png"),
      "width": defaultOgImage.width,
      "height": defaultOgImage.height,
      "caption": post.title,
      "encodingFormat": "image/png",
    },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt ?? post.publishedAt,
    "articleSection": post.category,
    "inLanguage": "en-US",
    "keywords": post.tags.join(", "),
    "wordCount": post.content.split(/\s+/).filter(Boolean).length,
    "author": {
      "@type": "Organization",
      "name": portfolioConfig.name,
      "url": portfolioConfig.seo.url,
      "sameAs": Object.values(portfolioConfig.socialLinks).filter(Boolean),
    },
    "publisher": {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      "name": portfolioConfig.name,
      "logo": {
        "@type": "ImageObject",
        "url": absoluteUrl("/myImage.png")
      }
    },
    "isPartOf": {
      "@type": "Blog",
      "@id": absoluteUrl("/blog#blog")
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": absoluteUrl(`/blog/${post.slug}#breadcrumb`),
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
        "item": absoluteUrl("/blog")
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": absoluteUrl(`/blog/${post.slug}`)
      }
    ]
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
