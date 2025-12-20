import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.about.title,
  description: pageMetadata.about.description,
  openGraph: {
    title: pageMetadata.about.title,
    description: pageMetadata.about.description,
    url: `${siteConfig.url}/about`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.about.title,
    description: pageMetadata.about.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
