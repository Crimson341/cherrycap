import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.privacy.title,
  description: pageMetadata.privacy.description,
  openGraph: {
    title: pageMetadata.privacy.title,
    description: pageMetadata.privacy.description,
    url: `${siteConfig.url}/privacy`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.privacy.title,
    description: pageMetadata.privacy.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
