import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.blog.title,
  description: pageMetadata.blog.description,
  openGraph: {
    title: pageMetadata.blog.title,
    description: pageMetadata.blog.description,
    url: `${siteConfig.url}/blog`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.blog.title,
    description: pageMetadata.blog.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
