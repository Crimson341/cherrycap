import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.careers.title,
  description: pageMetadata.careers.description,
  openGraph: {
    title: pageMetadata.careers.title,
    description: pageMetadata.careers.description,
    url: `${siteConfig.url}/careers`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.careers.title,
    description: pageMetadata.careers.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/careers`,
  },
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children
}
