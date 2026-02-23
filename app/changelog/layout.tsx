import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'

const ogImage = getOgImageUrl(pageMetadata.changelog.title, pageMetadata.changelog.description)

export const metadata: Metadata = {
  title: pageMetadata.changelog.title,
  description: pageMetadata.changelog.description,
  keywords: pageMetadata.changelog.keywords,
  openGraph: {
    title: pageMetadata.changelog.title,
    description: pageMetadata.changelog.description,
    url: `${siteConfig.url}/changelog`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.changelog.title,
    description: pageMetadata.changelog.description,
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}/changelog`,
  },
}

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children
}
