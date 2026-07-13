import type { Metadata } from "next";
import { HomeShell } from "@/components/home/HomeShell";
import { HomeContact } from "@/components/home/HomeContact";
import { HomeFooter } from "@/components/home/HomeFooter";
import { SecurityHero } from "@/components/security/SecurityHero";
import { SecurityServices } from "@/components/security/SecurityServices";
import { SecurityWhy } from "@/components/security/SecurityWhy";
import { SecurityProcess } from "@/components/security/SecurityProcess";
import { SecurityPlans } from "@/components/security/SecurityPlans";
import { SecurityFaq } from "@/components/security/SecurityFaq";
import {
  absoluteUrl,
  defaultOgImage,
  safeJsonLd,
  siteName,
} from "@/lib/seo";
import { portfolioConfig } from "@/lib/portfolioConfig";

const title = "WordPress Security for Local Businesses";
const description =
  "WordPress security for Northern Michigan businesses — malware cleanup, hardening, updates, backups, and monitoring. Work directly with Cherry Capital in Beulah, MI.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/security",
  },
  keywords: [
    "wordpress security",
    "wordpress malware cleanup",
    "wordpress hardening",
    "website security northern michigan",
    "traverse city wordpress security",
    "hacked wordpress fix",
    "wordpress maintenance",
    "wordpress backups",
    "small business website security",
  ],
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: "/security",
    images: [defaultOgImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${siteName}`,
    description,
    images: [defaultOgImage.url],
  },
};

function SecurityStructuredData() {
  const serviceId = absoluteUrl("/security#service");
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": serviceId,
    name: "WordPress Security",
    description,
    url: absoluteUrl("/security"),
    provider: {
      "@type": "ProfessionalService",
      name: siteName,
      url: portfolioConfig.seo.url,
      email: portfolioConfig.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: portfolioConfig.nap.addressLocality,
        addressRegion: portfolioConfig.nap.addressRegion,
        postalCode: portfolioConfig.nap.postalCode,
        addressCountry: portfolioConfig.nap.addressCountry,
      },
      areaServed: portfolioConfig.nap.areaServed.map((name) => ({
        "@type": name.includes("Northern") ? "AdministrativeArea" : "City",
        name: name.replace(", MI", ""),
      })),
    },
    serviceType: [
      "WordPress security",
      "Malware removal",
      "Website hardening",
      "WordPress maintenance",
    ],
    areaServed: portfolioConfig.nap.areaServed,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you only secure sites you built?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. If it's WordPress and you can get me admin or hosting access, I can audit, clean, and harden it — even if someone else built it years ago.",
        },
      },
      {
        "@type": "Question",
        name: "Can you fix a site that's already hacked?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Cleanup is a core part of this service: remove malware, close the entry point, update what's outdated, and verify the site is clean before we call it done.",
        },
      },
      {
        "@type": "Question",
        name: "Is a security plugin enough?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Plugins help, but they don't replace updates, strong logins, good backups, and sane hosting. The right tools matter — a single plugin is not a silver bullet.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />
    </>
  );
}

export default function SecurityPage() {
  return (
    <>
      <SecurityStructuredData />
      <HomeShell ctaHref="#contact">
        <SecurityHero />
        <SecurityServices />
        <SecurityWhy />
        <SecurityProcess />
        <SecurityPlans />
        <SecurityFaq />
        <HomeContact
          eyebrow="Security contact"
          heading={
            <>
              Send the site URL
              <br />
              and what&apos;s going on.
            </>
          }
          subcopy="Hack warning, slow site, mystery admin user — whatever it is, include the WordPress URL if you have it."
          messagePlaceholder="Site URL + what’s happening (hack notice, can’t log in, redirects, etc.)"
          subjectPrefix="WordPress security"
        />
        <HomeFooter />
      </HomeShell>
    </>
  );
}
