import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'

const ogImage = getOgImageUrl(pageMetadata.ai.title, pageMetadata.ai.description)

export const metadata: Metadata = {
  title: pageMetadata.ai.title,
  description: pageMetadata.ai.description,
  keywords: pageMetadata.ai.keywords,
  openGraph: {
    title: pageMetadata.ai.title,
    description: pageMetadata.ai.description,
    url: `${siteConfig.url}/ai`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.ai.title,
    description: pageMetadata.ai.description,
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}/ai`,
  },
}

export default function AILayout({ children }: { children: React.ReactNode }) {
  return children
}
