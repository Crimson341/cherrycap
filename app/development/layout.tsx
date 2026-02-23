import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'

const ogImage = getOgImageUrl(pageMetadata.development.title, pageMetadata.development.description)

export const metadata: Metadata = {
  title: pageMetadata.development.title,
  description: pageMetadata.development.description,
  keywords: pageMetadata.development.keywords,
  openGraph: {
    title: pageMetadata.development.title,
    description: pageMetadata.development.description,
    url: `${siteConfig.url}/development`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.development.title,
    description: pageMetadata.development.description,
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}/development`,
  },
}

export default function DevelopmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
