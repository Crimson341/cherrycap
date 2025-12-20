import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo-config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.business.name,
    short_name: 'Cherry Capital',
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#dc2626',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
