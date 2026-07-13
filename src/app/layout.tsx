import type { Metadata, Viewport } from "next";
import "./globals.css";

import {
  IBM_Plex_Mono as FontMono,
  IBM_Plex_Sans as FontSans,
} from "next/font/google";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { Analytics } from "@vercel/analytics/react";
import { StructuredData } from "@/components/StructuredData";
import { SiteAnalyticsTracker } from "@/components/analytics/SiteAnalyticsTracker";
import { AiChatWidget } from "@/components/chat/AiChatWidget";
import { defaultOgImage, siteDescription, siteName, siteTitle } from "@/lib/seo";

const fontSans = FontSans({
  weight: ["400", "500", "600"],
  display: "swap",
  subsets: ["latin"],
  variable: "--cd-font-sans",
  preload: true,
});

const fontMono = FontMono({
  weight: ["400", "500", "600"],
  display: "swap",
  subsets: ["latin"],
  variable: "--cd-font-mono",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(portfolioConfig.seo.url),
  title: {
    default: `${siteName} | Custom Websites for Northern Michigan Businesses`,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: portfolioConfig.seo.keywords,
  authors: portfolioConfig.seo.authors,
  creator: siteName,
  publisher: siteName,
  category: "technology",
  classification: "Professional Services",
  formatDetection: {
    address: false,
    date: false,
    email: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    types: {
      "text/plain": [
        {
          url: "/llms.txt",
          title: "llms.txt",
        },
      ],
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: `${siteName} | Custom Websites for Northern Michigan Businesses`,
    description: siteDescription,
    images: [defaultOgImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Custom Websites for Northern Michigan Businesses`,
    description: siteDescription,
    images: [defaultOgImage.url],
    creator: portfolioConfig.seo.twitterHandle,
    site: portfolioConfig.seo.twitterHandle,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/favicon-32.png",
        color: "#000000",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "US-MI",
    "geo.placename": "Beulah",
    "geo.position": `${portfolioConfig.nap.geo.latitude};${portfolioConfig.nap.geo.longitude}`,
    ICBM: `${portfolioConfig.nap.geo.latitude}, ${portfolioConfig.nap.geo.longitude}`,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `(function(){try{var k='theme';var t=localStorage.getItem(k);var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='dark'||(t!=='light'&&d);var e=document.documentElement;e.classList.toggle('dark',r);e.style.colorScheme=r?'dark':'light';}catch(e){}})();`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          rel="preload"
          href="/avatar.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <link rel="dns-prefetch" href="//api.web3forms.com" />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} relative`}
        suppressHydrationWarning
      >
        <div className="relative z-10">{children}</div>
        <AiChatWidget />
        <StructuredData />
        <SiteAnalyticsTracker />
        <Analytics />
      </body>
    </html>
  );
}
