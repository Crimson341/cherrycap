import { portfolioConfig } from "@/lib/portfolioConfig";
import { absoluteUrl, safeJsonLd, siteDescription, siteName } from "@/lib/seo";

const serviceCatalog = [
  {
    name: "Custom Website Development",
    description: "High-performance custom websites built for lead generation and local visibility.",
    url: "https://www.cherrycapitalweb.com/#contact",
  },
  {
    name: "Website Redesign",
    description: "Conversion-focused redesigns for slow, outdated, or underperforming websites.",
    url: "https://www.cherrycapitalweb.com/#contact",
  },
  {
    name: "Local SEO",
    description: "Technical SEO and local search optimization for Northern Michigan businesses.",
    url: "https://www.cherrycapitalweb.com/#contact",
  },
];

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    "name": siteName,
    "description": siteDescription,
    "url": portfolioConfig.seo.url,
    "logo": {
      "@type": "ImageObject",
      "url": absoluteUrl("/myImage.png"),
      "width": 720,
      "height": 733,
    },
    "image": absoluteUrl("/og-image.png"),
    "email": portfolioConfig.email,
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": portfolioConfig.email,
        "areaServed": "US",
        "availableLanguage": ["en"],
        "contactOption": "TollFree",
      },
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Beulah",
      "addressRegion": "MI",
      "addressCountry": "US"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Northern Michigan",
      "containedInPlace": {
        "@type": "Country",
        "name": "US",
      },
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
    "provider": {
      "@id": absoluteUrl("/#organization")
    },
    "logo": absoluteUrl("/myImage.png"),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Beulah",
      "addressRegion": "MI",
      "addressCountry": "US",
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Michigan"
    },
    "serviceType": serviceCatalog.map((service) => service.name),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Cherry Capital Services",
      "numberOfItems": serviceCatalog.length,
      "itemListElement": serviceCatalog.map((service) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.name,
          "description": service.description,
        },
        "url": service.url,
      })),
    },
    "sameAs": Object.values(portfolioConfig.socialLinks).filter(Boolean)
  };

  const serviceListingSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": absoluteUrl("/#service-list"),
    "name": "Cherry Capital Service Listings",
    "numberOfItems": serviceCatalog.length,
    "itemListElement": serviceCatalog.map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": service.name,
        "description": service.description,
        "url": service.url,
      },
    })),
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
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${portfolioConfig.seo.url}/blog?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    "inLanguage": "en-US",
    "about": {
      "@id": absoluteUrl("/#organization"),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": absoluteUrl("/#homepage-breadcrumb"),
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": portfolioConfig.seo.url,
      },
    ],
  };

  const schemaScripts = [
    organizationSchema,
    serviceSchema,
    serviceListingSchema,
    websiteSchema,
    breadcrumbSchema,
  ];

  const organizationSchemaDupFilter = schemaScripts.map((schema, index) => (
    <script
      key={`${schema["@type"]}-${schema["@id"]}-${index}`}
      id={`${String(schema["@type"]).toLowerCase()}-${index}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  ));

  return <>{organizationSchemaDupFilter}</>;
}
