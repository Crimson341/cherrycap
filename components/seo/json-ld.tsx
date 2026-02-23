import { siteConfig } from '@/lib/seo-config'

type BreadcrumbItem = {
  name: string
  url: string
}

type FAQItem = {
  question: string
  answer: string
}

type JsonLdProps = {
  type: 'LocalBusiness' | 'Organization' | 'BlogPosting' | 'WebPage' | 'Service' | 'WebSite' | 'FAQPage' | 'BreadcrumbList'
  data?: Record<string, unknown>
  breadcrumbs?: BreadcrumbItem[]
  faqs?: FAQItem[]
}

export function JsonLd({ type, data = {}, breadcrumbs, faqs }: JsonLdProps) {
  let schema: Record<string, unknown>

  switch (type) {
    case 'LocalBusiness':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        '@id': `${siteConfig.url}/#localbusiness`,
        name: siteConfig.business.name,
        legalName: siteConfig.business.legalName,
        description: siteConfig.description,
        url: siteConfig.url,
        email: siteConfig.business.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: siteConfig.business.address.addressLocality,
          addressRegion: siteConfig.business.address.addressRegion,
          postalCode: siteConfig.business.address.postalCode,
          addressCountry: siteConfig.business.address.addressCountry,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: siteConfig.business.geo.latitude,
          longitude: siteConfig.business.geo.longitude,
        },
        areaServed: siteConfig.business.areaServed.map((area) => ({
          '@type': 'City',
          name: area,
        })),
        priceRange: '$$',
        image: `${siteConfig.url}${siteConfig.ogImage}`,
        ...data,
      }
      break

    case 'Organization':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.business.name,
        legalName: siteConfig.business.legalName,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: siteConfig.business.email,
          areaServed: 'US',
          availableLanguage: 'English',
        },
        sameAs: [],
        ...data,
      }
      break

    case 'BlogPosting':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        publisher: {
          '@type': 'Organization',
          name: siteConfig.business.name,
          url: siteConfig.url,
          logo: {
            '@type': 'ImageObject',
            url: `${siteConfig.url}/logo.png`,
          },
        },
        ...data,
      }
      break

    case 'WebPage':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        isPartOf: {
          '@type': 'WebSite',
          name: siteConfig.name,
          url: siteConfig.url,
        },
        ...data,
      }
      break

    case 'Service':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        provider: {
          '@type': 'LocalBusiness',
          name: siteConfig.business.name,
          url: siteConfig.url,
        },
        areaServed: siteConfig.business.areaServed.map((area) => ({
          '@type': 'City',
          name: area,
        })),
        ...data,
      }
      break

    case 'WebSite':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        publisher: {
          '@type': 'Organization',
          '@id': `${siteConfig.url}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteConfig.url}/blog?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        ...data,
      }
      break

    case 'FAQPage':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: (faqs || []).map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
        ...data,
      }
      break

    case 'BreadcrumbList':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: (breadcrumbs || []).map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
        ...data,
      }
      break
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
