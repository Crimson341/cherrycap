import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'

const ogImage = getOgImageUrl(pageMetadata.work.title, pageMetadata.work.description)

export const metadata: Metadata = {
  title: pageMetadata.work.title,
  description: pageMetadata.work.description,
  keywords: pageMetadata.work.keywords,
  openGraph: {
    title: pageMetadata.work.title,
    description: pageMetadata.work.description,
    url: `${siteConfig.url}/work`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.work.title,
    description: pageMetadata.work.description,
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}/work`,
  },
}

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children
}
