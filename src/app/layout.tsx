import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata, Viewport } from "next";
import "./globals.css";

import {
  IBM_Plex_Mono as FontMono,
  IBM_Plex_Sans as FontSans,
} from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { Analytics } from "@vercel/analytics/react";
import { StructuredData } from "@/components/StructuredData";
import { SiteAnalyticsTracker } from "@/components/analytics/SiteAnalyticsTracker";
import { defaultOgImage, siteDescription, siteName, siteTitle } from "@/lib/seo";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

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
    default: siteName,
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
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: siteName,
    description: siteDescription,
    images: [defaultOgImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [defaultOgImage.url],
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
        <link rel="preload" href="/myImage.png" as="image" type="image/png" />
        <link rel="preload" href="/og-image.png" as="image" type="image/png" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} relative`}
        suppressHydrationWarning
      >
        {convexUrl ? (
          <ConvexAuthNextjsServerProvider>
            <ConvexClientProvider>{appContent}</ConvexClientProvider>
          </ConvexAuthNextjsServerProvider>
        ) : (
          appContent
        )}
        <StructuredData />
        <SiteAnalyticsTracker />
        <Analytics />
      </body>
    </html>
  );
}
