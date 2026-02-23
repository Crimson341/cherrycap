import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'

const ogImage = getOgImageUrl(pageMetadata.privacy.title, pageMetadata.privacy.description)

export const metadata: Metadata = {
  title: pageMetadata.privacy.title,
  description: pageMetadata.privacy.description,
  keywords: pageMetadata.privacy.keywords,
  openGraph: {
    title: pageMetadata.privacy.title,
    description: pageMetadata.privacy.description,
    url: `${siteConfig.url}/privacy`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.privacy.title,
    description: pageMetadata.privacy.description,
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
