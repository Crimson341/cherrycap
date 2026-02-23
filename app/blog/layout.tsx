import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'

const ogImage = getOgImageUrl(pageMetadata.blog.title, pageMetadata.blog.description)

export const metadata: Metadata = {
  title: pageMetadata.blog.title,
  description: pageMetadata.blog.description,
  keywords: pageMetadata.blog.keywords,
  openGraph: {
    title: pageMetadata.blog.title,
    description: pageMetadata.blog.description,
    url: `${siteConfig.url}/blog`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.blog.title,
    description: pageMetadata.blog.description,
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
