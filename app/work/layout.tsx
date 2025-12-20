import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.work.title,
  description: pageMetadata.work.description,
  openGraph: {
    title: pageMetadata.work.title,
    description: pageMetadata.work.description,
    url: `${siteConfig.url}/work`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.work.title,
    description: pageMetadata.work.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/work`,
  },
}

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children
}
