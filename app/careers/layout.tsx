import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'

const ogImage = getOgImageUrl(pageMetadata.careers.title, pageMetadata.careers.description)

export const metadata: Metadata = {
  title: pageMetadata.careers.title,
  description: pageMetadata.careers.description,
  keywords: pageMetadata.careers.keywords,
  openGraph: {
    title: pageMetadata.careers.title,
    description: pageMetadata.careers.description,
    url: `${siteConfig.url}/careers`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.careers.title,
    description: pageMetadata.careers.description,
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}/careers`,
  },
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children
}
