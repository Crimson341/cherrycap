import type { MetadataRoute } from "next";

import { publishedBlogPosts } from "@/lib/blogPosts";
import { portfolioConfig } from "@/lib/portfolioConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = portfolioConfig.seo.url;
  const homepageLastModified =
    publishedBlogPosts.length > 0
      ? publishedBlogPosts[0].updatedAt ?? publishedBlogPosts[0].publishedAt
      : new Date().toISOString();

  return [
    {
      url: baseUrl,
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${baseUrl}/og-image.png`],
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      images: [`${baseUrl}/og-image.png`],
    },
    ...publishedBlogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.8 : 0.7,
      images: [`${baseUrl}/og-image.png`],
    })),
  ];
}
