import type { MetadataRoute } from "next";

import { portfolioConfig } from "@/lib/portfolioConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${portfolioConfig.seo.url}/sitemap.xml`,
    host: portfolioConfig.seo.url,
  };
}
