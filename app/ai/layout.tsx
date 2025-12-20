import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.ai.title,
  description: pageMetadata.ai.description,
  openGraph: {
    title: pageMetadata.ai.title,
    description: pageMetadata.ai.description,
    url: `${siteConfig.url}/ai`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.ai.title,
    description: pageMetadata.ai.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/ai`,
  },
}

export default function AILayout({ children }: { children: React.ReactNode }) {
  return children
}
