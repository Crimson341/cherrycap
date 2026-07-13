import type { MetadataRoute } from "next";

import { publishedBlogPosts } from "@/lib/blogPosts";
import { portfolioConfig } from "@/lib/portfolioConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = portfolioConfig.seo.url;
  const latestPost = publishedBlogPosts[0];
  const homepageLastModified = latestPost
    ? latestPost.updatedAt ?? latestPost.publishedAt
    : new Date().toISOString();

  const ogImage = `${baseUrl}/og-image.webp`;

  return [
    {
      url: baseUrl,
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [ogImage],
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      images: [ogImage],
    },
    {
      url: `${baseUrl}/security`,
      lastModified: homepageLastModified,
      changeFrequency: "monthly",
      priority: 0.85,
      images: [ogImage],
    },
    ...publishedBlogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.8 : 0.7,
      images: [ogImage],
    })),
  ];
}
