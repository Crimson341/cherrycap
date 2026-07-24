import type { Metadata } from "next";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { defaultOgImage, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Cherry Capital Web Blog",
    template: `%s | Cherry Capital Blog`,
  },
  description: "Welcome to the Cherry Capital Web Blog. A home for web notes, launch stories, and practical ideas from Cherry Capital.",
  authors: portfolioConfig.seo.authors,
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/blog",
    title: "Cherry Capital Web Blog",
    description: "Welcome to the Cherry Capital Web Blog. A home for web notes, launch stories, and practical ideas from Cherry Capital.",
    images: [defaultOgImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cherry Capital Web Blog",
    description: "Welcome to the Cherry Capital Web Blog. A home for web notes, launch stories, and practical ideas from Cherry Capital.",
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
