import { portfolioConfig } from "@/lib/portfolioConfig";

const siteUrl = portfolioConfig.seo.url;
export const siteName = portfolioConfig.name;
export const siteTitle = portfolioConfig.title;
export const siteDescription = portfolioConfig.description;
export const defaultOgImage = {
  url: "/og-image.webp",
  width: 1200,
  height: 630,
  alt: "Cherry Capital is a web studio building custom sites for local businesses.",
  type: "image/webp",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
