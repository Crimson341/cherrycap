import type { Metadata } from "next";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { defaultOgImage, siteName } from "@/lib/seo";

const blogTitle = "Blog";
const blogDescription =
  "Notes from building websites for Northern Michigan businesses. Real talk on the web, tools, and what actually helps.";

export const metadata: Metadata = {
  title: {
    default: blogTitle,
    template: `%s | Cherry Capital`,
  },
  description: blogDescription,
  keywords: [
    "Cherry Capital blog",
    "Northern Michigan web design",
    "Beulah web developer",
    "small business websites",
    "AI for small business",
  ],
  authors: portfolioConfig.seo.authors,
  creator: siteName,
  publisher: siteName,
  category: "technology",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/blog",
    title: blogTitle,
    description: blogDescription,
    images: [defaultOgImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: blogTitle,
    description: blogDescription,
    images: [defaultOgImage.url],
    creator: portfolioConfig.seo.twitterHandle,
    site: portfolioConfig.seo.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
