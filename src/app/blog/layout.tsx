import type { Metadata } from "next";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { defaultOgImage, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Cherry Capital Web Blog",
    template: `%s | Cherry Capital Blog`,
  },
  description:
    "Notes from modern web development, performance optimization, and local SEO practices for Northern Michigan businesses.",
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
    languages: {
      en: "/blog",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/blog",
    title: "Cherry Capital Web Blog",
    description:
      "Notes from modern web development, performance optimization, and local SEO practices for Northern Michigan businesses.",
    images: [defaultOgImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cherry Capital Web Blog",
    description:
      "Notes from modern web development, performance optimization, and local SEO practices for Northern Michigan businesses.",
    images: [defaultOgImage],
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
