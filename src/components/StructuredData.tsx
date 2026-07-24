import { portfolioConfig } from "@/lib/portfolioConfig";
import { absoluteUrl, safeJsonLd, siteDescription, siteName } from "@/lib/seo";

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    "name": siteName,
    "description": siteDescription,
    "url": portfolioConfig.seo.url,
    "logo": absoluteUrl("/myImage.png"),
    "image": absoluteUrl("/og-image.png"),
    "email": portfolioConfig.email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Beulah",
      "addressRegion": "MI",
      "addressCountry": "US"
    },
    "sameAs": Object.values(portfolioConfig.socialLinks).filter(Boolean)
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": absoluteUrl("/#service"),
    "name": siteName,
    "description": siteDescription,
    "url": portfolioConfig.seo.url,
    "image": absoluteUrl("/og-image.png"),
    "email": portfolioConfig.email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Beulah",
      "addressRegion": "MI",
      "addressCountry": "US"
    },
    "provider": {
      "@id": absoluteUrl("/#organization")
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Michigan"
    },
    "serviceType": [
      "Custom website development",
      "Next.js development",
      "Website redesign",
      "Local SEO"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Cherry Capital Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom Website Development",
            "description": "High-performance custom websites built for lead generation and local visibility."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Website Redesign",
            "description": "Conversion-focused redesigns for slow, outdated, or underperforming websites."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Local SEO",
            "description": "Technical SEO and local search optimization for Northern Michigan businesses."
          }
        }
      ]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    "url": portfolioConfig.seo.url,
    "name": siteName,
    "description": siteDescription,
    "publisher": {
      "@id": absoluteUrl("/#organization")
    },
    "inLanguage": "en-US"
  };

  return (
    <>
      <script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
      />
      <script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(serviceSchema) }}
      />
      <script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
      />
    </>
  );
}
