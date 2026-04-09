import type { Metadata } from "next";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { defaultOgImage, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Blog",
    template: `%s | Cherry Capital Blog`,
  },
  description: "Real talk about modern web development, local business growth, and why WordPress isn't always the answer. Published by Cherry Capital.",
  keywords: [
    "web development blog",
    "next.js tutorials",
    "local business websites",
    "wordpress alternatives",
    "michigan web developer",
    "modern web development",
    "seo tips",
    "web performance",
    "cherry capital blog",
  ],
  authors: portfolioConfig.seo.authors,
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/blog",
    title: "Cherry Capital Blog - Modern Web Development Insights",
    description: "Real talk about modern web development, local business growth, and why WordPress isn't always the answer. Published by Cherry Capital.",
    images: [defaultOgImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cherry Capital Blog - Modern Web Development Insights",
    description: "Real talk about modern web development, local business growth, and why WordPress isn't always the answer.",
    images: [defaultOgImage.url],
    creator: portfolioConfig.seo.twitterHandle,
    site: portfolioConfig.seo.twitterHandle,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
