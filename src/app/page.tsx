import type { Metadata } from "next";
import { HomeShell } from "@/components/home/HomeShell";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeWork } from "@/components/home/HomeWork";
import { HomeAbout } from "@/components/home/HomeAbout";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeContact } from "@/components/home/HomeContact";
import { HomeFooter } from "@/components/home/HomeFooter";
import { defaultOgImage, siteDescription, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: `${siteName} | Custom Websites for Northern Michigan Businesses`,
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteName} | Custom Websites for Northern Michigan Businesses`,
    description: siteDescription,
    url: "/",
    images: [defaultOgImage],
  },
};

export default function Home() {
  return (
    <HomeShell>
      <HomeHero />
      <HomeWork />
      <HomeAbout />
      <HomeFaq />
      <HomeContact />
      <HomeFooter />
    </HomeShell>
  );
}
