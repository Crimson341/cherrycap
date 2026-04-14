import type { MetadataRoute } from "next";

import { publishedBlogPosts } from "@/lib/blogPosts";
import { portfolioConfig } from "@/lib/portfolioConfig";

const baseUrl = portfolioConfig.seo.url.replace(/\/$/, "");
const toAbsolute = (path: string) => `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapPosts = [...publishedBlogPosts].sort(
    (left, right) =>
      new Date(right.updatedAt ?? right.publishedAt).getTime() -
      new Date(left.updatedAt ?? left.publishedAt).getTime()
  );
  const homepageLastModified = new Date(
    sitemapPosts.length > 0
      ? sitemapPosts[0].updatedAt ?? sitemapPosts[0].publishedAt
      : new Date()
  ).toISOString();

  return [
    {
      url: toAbsolute("/"),
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: { en: toAbsolute("/") },
      },
      images: [toAbsolute("/og-image.png")],
    },
    {
      url: toAbsolute("/blog"),
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: { en: toAbsolute("/blog") },
      },
      images: [toAbsolute("/og-image.png")],
    },
    ...sitemapPosts.map((post) => ({
      url: toAbsolute(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt ?? post.publishedAt).toISOString(),
      changeFrequency: "monthly",
      priority: post.featured ? 0.8 : 0.7,
      alternates: {
        languages: { en: toAbsolute(`/blog/${post.slug}`) },
      },
      images: [toAbsolute("/og-image.png")],
    })),
  ];
}
