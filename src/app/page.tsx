import ProfileSection from "@/components/sections/ProfileSection";

import SectionSeparator from "@/components/ui/SectionSeperator";
import BioSection from "@/components/sections/BioSection";

import AboutSection from "@/components/sections/AboutSection";
import TopSection from "@/components/sections/TopSection";
import TechStackSection from "@/components/sections/TechStackSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import ContactMeSection from "@/components/sections/ContactMeSection";
import FooterSection from "@/components/sections/FooterSection";
import LandingAnimationWrapper from "@/components/LandingAnimationWrapper";
import type { Metadata } from "next";
import { defaultOgImage, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Cherry Capital builds modern websites and conversion-focused web experiences for local businesses in Northern Michigan.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteName} | Northern Michigan Web Studio`,
    description:
      "Custom web design and SEO-focused development for small businesses in Michigan.",
    type: "website",
    locale: "en_US",
    url: "/",
    images: [defaultOgImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Northern Michigan Web Studio`,
    description:
      "Custom web design and SEO-focused development for small businesses in Michigan.",
    images: [defaultOgImage.url],
    creator: "@cherrycapweb",
    site: "@cherrycapweb",
  },
};

export default function Home() {
  return (
    <LandingAnimationWrapper>
      <TopSection />

      <ProfileSection />
      <SectionSeparator className="full-line-bottom" />

      <BioSection />
      <SectionSeparator className="full-line-bottom" />
      <AboutSection />
      <SectionSeparator className="full-line-bottom" />
      <TechStackSection />
      <SectionSeparator className="full-line-bottom" />
      <ProjectsSection />
      <SectionSeparator className="full-line-bottom" />
      <ExperienceSection />
      <SectionSeparator className="full-line-bottom" />
      <ContactMeSection />
      <SectionSeparator className="full-line-bottom" />
      <FooterSection />
      <SectionSeparator className="full-line-bottom" />
    </LandingAnimationWrapper>
  );
}
