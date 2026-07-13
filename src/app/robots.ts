import type { MetadataRoute } from "next";

import { portfolioConfig } from "@/lib/portfolioConfig";

const privatePaths = [
  "/api/",
  "/dashboard",
  "/dashboard/",
  "/signin",
  "/signin/",
  "/giveaway-rules",
  "/giveaway-rules/",
];

const publicAllows = ["/", "/blog", "/blog/", "/llms.txt"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/.well-known/security.txt"],
        disallow: privatePaths,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "anthropic-ai",
          "ClaudeBot",
          "PerplexityBot",
          "Bytespider",
          "CCBot",
        ],
        allow: publicAllows,
        disallow: privatePaths,
      },
    ],
    sitemap: `${portfolioConfig.seo.url}/sitemap.xml`,
    host: portfolioConfig.seo.url,
  };
}
