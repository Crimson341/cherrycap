import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.customSolutions.title,
  description: pageMetadata.customSolutions.description,
  openGraph: {
    title: pageMetadata.customSolutions.title,
    description: pageMetadata.customSolutions.description,
    url: `${siteConfig.url}/custom-solutions`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.customSolutions.title,
    description: pageMetadata.customSolutions.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/custom-solutions`,
  },
}

export default function CustomSolutionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
