import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'
import { JsonLd } from '@/components/seo/json-ld'
import HomeClient from '@/components/pages/home-client'

export const metadata: Metadata = {
  title: pageMetadata.home.title,
  description: pageMetadata.home.description,
  keywords: pageMetadata.home.keywords,
  alternates: {
    canonical: siteConfig.url,
  },
}

export default function Home() {
  return (
    <>
      <JsonLd type="LocalBusiness" />
      <JsonLd type="Organization" />
      <HomeClient />
    </>
  )
}
