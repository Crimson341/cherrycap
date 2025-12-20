import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.contact.title,
  description: pageMetadata.contact.description,
  openGraph: {
    title: pageMetadata.contact.title,
    description: pageMetadata.contact.description,
    url: `${siteConfig.url}/contact`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.contact.title,
    description: pageMetadata.contact.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
