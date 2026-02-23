import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'

const ogImage = getOgImageUrl(pageMetadata.customSolutions.title, pageMetadata.customSolutions.description)

export const metadata: Metadata = {
  title: pageMetadata.customSolutions.title,
  description: pageMetadata.customSolutions.description,
  keywords: pageMetadata.customSolutions.keywords,
  openGraph: {
    title: pageMetadata.customSolutions.title,
    description: pageMetadata.customSolutions.description,
    url: `${siteConfig.url}/custom-solutions`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.customSolutions.title,
    description: pageMetadata.customSolutions.description,
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}/custom-solutions`,
  },
}

export default function CustomSolutionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
