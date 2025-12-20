import type { Metadata } from 'next'
import { pageMetadata, siteConfig } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.restaurantsCafes.title,
  description: pageMetadata.restaurantsCafes.description,
  openGraph: {
    title: pageMetadata.restaurantsCafes.title,
    description: pageMetadata.restaurantsCafes.description,
    url: `${siteConfig.url}/restaurants-cafes`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.restaurantsCafes.title,
    description: pageMetadata.restaurantsCafes.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/restaurants-cafes`,
  },
}

export default function RestaurantsCafesLayout({ children }: { children: React.ReactNode }) {
  return children
}
