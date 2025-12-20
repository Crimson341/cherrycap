import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.terms.title,
  description: pageMetadata.terms.description,
  openGraph: {
    title: pageMetadata.terms.title,
    description: pageMetadata.terms.description,
    url: `${siteConfig.url}/terms`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.terms.title,
    description: pageMetadata.terms.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
