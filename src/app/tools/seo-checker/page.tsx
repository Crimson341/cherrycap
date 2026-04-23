import type { Metadata } from "next";
import SeoCheckerClient from "@/components/SeoCheckerClient";
import { defaultOgImage, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Free SEO Checker",
  description:
    "Run a free, professional SEO audit on any URL. Meta tags, structured data, social, security, crawlability, and performance — in seconds.",
  alternates: { canonical: "/tools/seo-checker" },
  openGraph: {
    type: "website",
    url: "/tools/seo-checker",
    title: "Free SEO Checker | Cherry Capital",
    description:
      "Run a free, professional SEO audit on any URL. 50+ checks across meta, content, social, schema, security, and performance.",
    images: [defaultOgImage],
    siteName,
  },
};

export default function SeoCheckerPage() {
  return <SeoCheckerClient />;
}
