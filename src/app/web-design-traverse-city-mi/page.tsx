import type { Metadata } from "next";

import { LocalLandingPage } from "@/components/LocalLandingPage";
import { getLocalServiceArea } from "@/lib/localSeo";
import { defaultOgImage, siteName } from "@/lib/seo";

const area = getLocalServiceArea("web-design-traverse-city-mi")!;

export const metadata: Metadata = {
  title: "Web Design Traverse City MI",
  description: area.description,
  alternates: { canonical: `/${area.slug}` },
  openGraph: {
    type: "website",
    url: `/${area.slug}`,
    title: `${area.title} | ${siteName}`,
    description: area.description,
    images: [defaultOgImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${area.title} | ${siteName}`,
    description: area.description,
    images: [defaultOgImage.url],
  },
};

export default function TraverseCityWebDesignPage() {
  return <LocalLandingPage area={area} />;
}
