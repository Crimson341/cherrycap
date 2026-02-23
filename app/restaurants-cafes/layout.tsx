import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'

const ogImage = getOgImageUrl(pageMetadata.restaurantsCafes.title, pageMetadata.restaurantsCafes.description)

export const metadata: Metadata = {
  title: pageMetadata.restaurantsCafes.title,
  description: pageMetadata.restaurantsCafes.description,
  keywords: pageMetadata.restaurantsCafes.keywords,
  openGraph: {
    title: pageMetadata.restaurantsCafes.title,
    description: pageMetadata.restaurantsCafes.description,
    url: `${siteConfig.url}/restaurants-cafes`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.restaurantsCafes.title,
    description: pageMetadata.restaurantsCafes.description,
    images: [ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}/restaurants-cafes`,
  },
}

export default function RestaurantsCafesLayout({ children }: { children: React.ReactNode }) {
  return children
}
