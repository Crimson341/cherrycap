export const siteConfig = {
  name: 'Cherry Capital Web',
  description: 'Traverse City web design studio building fast, modern websites and AI-powered business tools for Northern Michigan small businesses.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cherrycapitalweb.com',
  ogImage: '/api/og',
  twitterHandle: '@cherrycapweb',
  locale: 'en_US',

  business: {
    name: 'Cherry Capital Web',
    legalName: 'Cherry Capital Web LLC',
    email: 'hello@cherrycap.com',
    address: {
      streetAddress: '',
      addressLocality: 'Traverse City',
      addressRegion: 'MI',
      postalCode: '49684',
      addressCountry: 'US',
    },
    geo: {
      latitude: 44.7631,
      longitude: -85.6206,
    },
    areaServed: [
      'Traverse City',
      'Northern Michigan',
      'Grand Traverse County',
      'Leelanau County',
      'Benzie County',
      'Antrim County',
      'Kalkaska County',
    ],
  },

  keywords: [
    'web design traverse city',
    'northern michigan web development',
    'traverse city seo',
    'small business websites michigan',
    'cherry capital web',
    'ai business tools',
    'local business analytics',
    'traverse city web designer',
    'northern michigan marketing',
    'traverse city web development',
    'michigan web agency',
  ],
}

/**
 * Generate a dynamic OG image URL for a page
 */
export function getOgImageUrl(title: string, description: string, type: string = 'default'): string {
  return `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&type=${encodeURIComponent(type)}`
}

export type PageMetadata = {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
}

export const pageMetadata: Record<string, PageMetadata> = {
  home: {
    title: 'Cherry Capital Web - AI-Powered Business Tools for Northern Michigan',
    description:
      'Traverse City web design studio offering websites, SEO, and AI-powered business tools for Northern Michigan small businesses. Local expertise, modern technology.',
    keywords: [
      'web design traverse city',
      'northern michigan web development',
      'traverse city seo',
      'small business websites michigan',
      'ai business tools traverse city',
    ],
  },
  about: {
    title: 'About Cherry Capital Web - Local Web Team in Northern Michigan',
    description:
      'Meet Cherry Capital Web, a Traverse City-based web design studio. We build modern websites and tools for Northern Michigan businesses with honest pricing and real support.',
    keywords: [
      'traverse city web agency',
      'northern michigan web design company',
      'local web designers michigan',
      'cherry capital web team',
    ],
  },
  blog: {
    title: 'Blog - Web Design, SEO & Business Tips for Northern Michigan',
    description:
      'Actionable insights on web development, local SEO, AI tools, and growing your small business in Traverse City and Northern Michigan.',
    keywords: [
      'web design tips',
      'local seo blog',
      'northern michigan business tips',
      'traverse city marketing',
    ],
  },
  careers: {
    title: 'Careers at Cherry Capital Web - Join Our Traverse City Team',
    description:
      'Flexible job opportunities at Cherry Capital Web in Traverse City. AI training, social media, sales, and writing roles available for Northern Michigan talent.',
    keywords: [
      'traverse city jobs',
      'northern michigan tech jobs',
      'web design jobs michigan',
      'remote work traverse city',
    ],
  },
  privacy: {
    title: 'Privacy Policy - Cherry Capital Web',
    description: "How Cherry Capital Web handles your data. We respect your privacy and don't sell your information.",
    keywords: ['privacy policy', 'data protection'],
  },
  terms: {
    title: 'Terms of Service - Cherry Capital Web',
    description: 'Terms and conditions for using Cherry Capital Web services and tools.',
    keywords: ['terms of service', 'terms and conditions'],
  },
  work: {
    title: 'Our Work - Web Design Portfolio | Traverse City',
    description:
      "Portfolio of websites and web applications we've built for Northern Michigan businesses. Custom designs, fast performance, real results.",
    keywords: [
      'web design portfolio traverse city',
      'northern michigan website examples',
      'custom websites michigan',
    ],
  },
  contact: {
    title: 'Contact Cherry Capital Web - Get a Free Quote',
    description:
      'Get in touch with Cherry Capital Web in Traverse City. Free project consultations for Northern Michigan businesses. Response within 24 hours.',
    keywords: [
      'contact web designer traverse city',
      'web design quote michigan',
      'hire web developer northern michigan',
    ],
  },
  development: {
    title: 'WordPress & Shopify Development - Traverse City',
    description:
      'Custom WordPress plugins, Shopify apps, and web development for Northern Michigan businesses. Modern, fast, mobile-friendly websites built in Traverse City.',
    keywords: [
      'wordpress developer traverse city',
      'shopify developer michigan',
      'custom web development northern michigan',
      'wordpress plugin development',
    ],
  },
  customSolutions: {
    title: 'Custom Software Solutions - Northern Michigan',
    description:
      'Tailored software, web applications, and AI-powered tools for unique business needs in Traverse City and Northern Michigan. Custom integrations and automation.',
    keywords: [
      'custom software traverse city',
      'business automation michigan',
      'custom web applications northern michigan',
    ],
  },
  restaurantsCafes: {
    title: 'Restaurant & Cafe Websites - Traverse City Web Design',
    description:
      'Beautiful, mobile-friendly websites for restaurants, cafes, and food businesses in Traverse City and Northern Michigan. Online menus, ordering, and reservations.',
    keywords: [
      'restaurant website traverse city',
      'cafe website northern michigan',
      'online ordering website michigan',
      'restaurant web design',
    ],
  },
  ai: {
    title: 'AI-Powered Business Tools for Northern Michigan',
    description:
      'Leverage artificial intelligence for your Traverse City or Northern Michigan business. Smart analytics, content automation, and AI-powered insights.',
    keywords: [
      'ai business tools',
      'artificial intelligence traverse city',
      'small business ai michigan',
      'business automation',
    ],
  },
  changelog: {
    title: 'Changelog - What\'s New at Cherry Capital Web',
    description:
      'Latest updates, features, and improvements to Cherry Capital Web tools and services.',
    keywords: ['changelog', 'product updates', 'new features'],
  },
}
