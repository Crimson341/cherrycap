import type { MetadataRoute } from "next";

import { portfolioConfig } from "@/lib/portfolioConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/api", "/_next", "/signin", "/dashboard", "/giveaway-rules"],
      },
      {
        userAgent: "googlebot",
        allow: ["/", "/blog"],
        disallow: ["/api", "/_next", "/signin", "/dashboard", "/giveaway-rules"],
      },
    ],
    sitemap: `${portfolioConfig.seo.url}/sitemap.xml`,
    host: portfolioConfig.seo.url,
  };
}
