import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.development.title,
  description: pageMetadata.development.description,
  openGraph: {
    title: pageMetadata.development.title,
    description: pageMetadata.development.description,
    url: `${siteConfig.url}/development`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.development.title,
    description: pageMetadata.development.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/development`,
  },
}

export default function DevelopmentLayout({ children }: { children: React.ReactNode }) {
  return children
}
