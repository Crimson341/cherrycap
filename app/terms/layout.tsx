import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'

const ogImage = getOgImageUrl(pageMetadata.terms.title, pageMetadata.terms.description)

export const metadata: Metadata = {
  title: pageMetadata.terms.title,
  description: pageMetadata.terms.description,
  keywords: pageMetadata.terms.keywords,
  openGraph: {
    title: pageMetadata.terms.title,
    description: pageMetadata.terms.description,
    url: `${siteConfig.url}/terms`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.terms.title,
    description: pageMetadata.terms.description,
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
