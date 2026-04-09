import Script from 'next/script';
import { portfolioConfig } from '@/lib/portfolioConfig';

export function StructuredData() {
  const baseUrl = portfolioConfig.seo.url;

  // Local Business Schema
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/#organization`,
    "name": portfolioConfig.name,
    "alternateName": "Cherry Capital",
    "description": portfolioConfig.description,
    "url": baseUrl,
    "logo": `${baseUrl}/myImage.png`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Beulah",
      "addressRegion": "MI",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "44.6344",
      "longitude": "-86.2422"
    },
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "44.6344",
        "longitude": "-86.2422"
      },
      "geoRadius": "50000"
    },
    "serviceType": "Web Development",
    "priceRange": "$$",
    "telephone": "Contact via website",
    "email": portfolioConfig.email,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Web Development Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom Website Development",
            "description": "Modern, responsive websites built with Next.js and React"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Full Stack Development",
            "description": "Complete web applications with frontend and backend solutions"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "WordPress Alternative Solutions",
            "description": "High-performance custom solutions that outperform WordPress"
          }
        }
      ]
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#company`,
    "name": portfolioConfig.name,
    "alternateName": "Cherry Capital",
    "description": portfolioConfig.description,
    "url": baseUrl,
    "logo": `${baseUrl}/myImage.png`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Beulah",
      "addressRegion": "Michigan",
      "addressCountry": "US"
    }
  };

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "url": baseUrl,
    "name": "Cherry Capital Portfolio",
    "description": "Professional portfolio showcasing modern web development expertise and Cherry Capital services",
    "publisher": {
      "@type": "Organization",
      "@id": `${baseUrl}/#company`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/?s={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
    <Script
      id="business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
} 
