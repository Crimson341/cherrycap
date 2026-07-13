import { portfolioConfig } from "@/lib/portfolioConfig";
import { absoluteUrl, safeJsonLd, siteDescription, siteName } from "@/lib/seo";

export function StructuredData() {
  const { nap } = portfolioConfig;
  const organizationId = absoluteUrl("/#organization");
  const localBusinessId = absoluteUrl("/#localbusiness");
  const websiteId = absoluteUrl("/#website");

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: siteName,
    alternateName: "Cherry Capital Web",
    description: siteDescription,
    url: portfolioConfig.seo.url,
    email: portfolioConfig.email,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/avatar.webp"),
      width: 320,
      height: 320,
    },
    image: {
      "@type": "ImageObject",
      url: absoluteUrl("/og-image.webp"),
      width: 1200,
      height: 630,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: nap.addressLocality,
      addressRegion: nap.addressRegion,
      postalCode: nap.postalCode,
      addressCountry: nap.addressCountry,
    },
    areaServed: nap.areaServed.map((name) => ({
      "@type": name.includes("Northern") ? "AdministrativeArea" : "City",
      name: name.replace(", MI", ""),
    })),
    knowsAbout: [
      "Custom website development",
      "Next.js",
      "Local SEO",
      "Website redesign",
      "WordPress security",
      "WordPress malware cleanup",
      "Northern Michigan small business websites",
    ],
    sameAs: Object.values(portfolioConfig.socialLinks).filter(Boolean),
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": localBusinessId,
    name: siteName,
    description: siteDescription,
    url: portfolioConfig.seo.url,
    email: portfolioConfig.email,
    image: absoluteUrl("/og-image.webp"),
    priceRange: nap.priceRange,
    parentOrganization: { "@id": organizationId },
    address: {
      "@type": "PostalAddress",
      addressLocality: nap.addressLocality,
      addressRegion: nap.addressRegion,
      postalCode: nap.postalCode,
      addressCountry: nap.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: nap.geo.latitude,
      longitude: nap.geo.longitude,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Beulah",
        containedInPlace: { "@type": "State", name: "Michigan" },
      },
      {
        "@type": "City",
        name: "Traverse City",
        containedInPlace: { "@type": "State", name: "Michigan" },
      },
      {
        "@type": "AdministrativeArea",
        name: "Northern Michigan",
      },
    ],
    serviceType: [
      "Custom website development",
      "Next.js development",
      "Website redesign",
      "Local SEO",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cherry Capital Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            "@id": absoluteUrl("/#service-custom-websites"),
            name: "Custom Website Development",
            description:
              "High-performance custom websites built for lead generation and local visibility.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            "@id": absoluteUrl("/#service-redesign"),
            name: "Website Redesign",
            description:
              "Conversion-focused redesigns for slow, outdated, or underperforming websites.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            "@id": absoluteUrl("/#service-local-seo"),
            name: "Local SEO",
            description:
              "Technical SEO and local search optimization for Northern Michigan businesses.",
          },
        },
      ],
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    url: portfolioConfig.seo.url,
    name: siteName,
    description: siteDescription,
    publisher: { "@id": organizationId },
    inLanguage: "en-US",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": absoluteUrl("/#faq"),
    mainEntity: portfolioConfig.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
      />
      <script
        id="localbusiness-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessSchema) }}
      />
      <script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
      />
      <script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />
    </>
  );
}
