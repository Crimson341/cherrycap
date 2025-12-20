export const siteConfig = {
  name: 'Cherry Capital Web',
  description: 'AI-powered web design and business tools for Northern Michigan small businesses. Based in Traverse City.',
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
  ],
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
      'Web design, SEO, and AI-powered business tools for Traverse City and Northern Michigan small businesses. Local expertise, modern technology.',
    keywords: ['web design traverse city', 'northern michigan business', 'local seo'],
  },
  about: {
    title: 'About Us - Bringing Tech to Northern Michigan',
    description:
      'Cherry Capital Web is a tech studio based in Traverse City, Michigan. We build websites, web apps, and AI tools for local businesses.',
  },
  blog: {
    title: 'Blog - Tech & Business Insights',
    description:
      'Insights on web development, SEO, AI tools, and growing your business in Northern Michigan.',
  },
  careers: {
    title: 'Careers - Join Our Team',
    description:
      'Flexible opportunities to work with Cherry Capital Web. AI training, social media, sales, and writing roles available.',
  },
  privacy: {
    title: 'Privacy Policy',
    description: "How Cherry Capital Web handles your data. We don't sell your information.",
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms and conditions for using Cherry Capital Web services.',
  },
  work: {
    title: 'Our Work - Portfolio',
    description:
      "See examples of websites and projects we've built for Northern Michigan businesses.",
  },
  contact: {
    title: 'Contact Us',
    description:
      'Get in touch with Cherry Capital Web. Based in Traverse City, serving Northern Michigan.',
  },
  development: {
    title: 'Web Development Services - Traverse City',
    description:
      'Custom web development for Northern Michigan businesses. Modern, fast, and mobile-friendly websites built in Traverse City.',
  },
  customSolutions: {
    title: 'Custom Software Solutions - Northern Michigan',
    description:
      'Tailored software and web applications for your unique business needs. AI-powered tools and custom integrations.',
  },
  restaurantsCafes: {
    title: 'Restaurant & Cafe Websites - Traverse City',
    description:
      'Beautiful websites for restaurants, cafes, and food businesses in Northern Michigan. Online menus, ordering, and more.',
  },
  ai: {
    title: 'AI-Powered Business Tools',
    description:
      'Leverage artificial intelligence for your Northern Michigan business. Smart analytics, automation, and insights.',
  },
}
