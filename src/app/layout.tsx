import type { Metadata, Viewport } from "next";
import "./globals.css";

import {
  IBM_Plex_Mono as FontMono,
  IBM_Plex_Sans as FontSans,
} from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { Analytics } from "@vercel/analytics/react";
import { StructuredData } from "@/components/StructuredData";
import { SiteAnalyticsTracker } from "@/components/analytics/SiteAnalyticsTracker";
import { defaultOgImage, siteName, siteTitle } from "@/lib/seo";

 const fontSans = FontSans({
  weight: ["400", "500", "600"],
  display: "swap",
  subsets: ["latin"],
  variable: "--cd-font-sans",
});

 const fontMono = FontMono({
  weight: ["400", "500", "600"],
  display: "swap",
  subsets: ["latin"],
  variable: "--cd-font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(portfolioConfig.seo.url),
  title: {
    default: `${siteName} — Northern Michigan Web Design & SEO Studio`,
    template: `%s | ${siteTitle} | Northern Michigan`,
  },
  description:
    "Beulah, Michigan web studio building fast, SEO-friendly websites and AI chatbots for restaurants, contractors, and service businesses across Northern Michigan.",
  applicationName: siteName,
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
    languages: {
      en: "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: `${siteName} | Northern Michigan Web Studio`,
    description:
      "Fast, SEO-friendly website design and development for local businesses in Northern Michigan.",
    images: [defaultOgImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Northern Michigan Web Studio`,
    description:
      "Fast, SEO-friendly website design and development for local businesses in Northern Michigan.",
    images: [defaultOgImage],
    creator: portfolioConfig.seo.twitterHandle,
    site: portfolioConfig.seo.twitterHandle,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/myImage.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/favicon.png", color: "#000000" },
    ],
  },
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
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appContent = (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="relative z-10">
        {children}
      </div>
    </ThemeProvider>
  );

  return (
    <html lang="en" suppressHydrationWarning>
    <head>
        {/* DNS Prefetching for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.web3forms.com" />
        <link rel="dns-prefetch" href="//github.com" />
        <link rel="dns-prefetch" href="//linkedin.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/myImage.webp" as="image" type="image/webp" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} relative`}
        suppressHydrationWarning
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        {appContent}
        <StructuredData />
        <SiteAnalyticsTracker />
        <Analytics />
      </body>
    </html>
  );
}
