import type { Metadata } from "next";
import "./globals.css";

import {
  IBM_Plex_Mono as FontMono,
  IBM_Plex_Sans as FontSans,
} from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { Analytics } from "@vercel/analytics/react";
import { StructuredData } from "@/components/StructuredData";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

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
    default: portfolioConfig.name,
    template: `%s - ${portfolioConfig.title}`,
  },
  description: portfolioConfig.description,

  // Enhanced SEO keywords
  keywords: portfolioConfig.seo.keywords,
  authors: portfolioConfig.seo.authors,
  creator: portfolioConfig.name,
  publisher: portfolioConfig.name,

  // Enhanced metadata for E-A-T signals
  other: {
    // Local SEO geo-tags for Beulah, Michigan
    "geo.position": "44.6344;-86.2422",
    "geo.placename": "Beulah, Michigan, United States", 
    "geo.region": "US-MI",
    "ICBM": "44.6344, -86.2422",
    
    // Business metadata
    "business-type": "Web Development Services",
    "price-range": "$$",
    "service-area": "Michigan, United States",
    
    // Technical metadata
    "format-detection": "telephone=no, date=no, address=no, email=no",
    "theme-color": "#000000",
    "color-scheme": "dark light",
    
    // Authority signals
    "author": portfolioConfig.name,
    "copyright": `© ${new Date().getFullYear()} ${portfolioConfig.name}`,
    "robots": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  },

  // Canonical URL
  alternates: {
    canonical: portfolioConfig.seo.url,
  },

  // Enhanced OpenGraph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: portfolioConfig.seo.url,
    title: portfolioConfig.name,
    description: portfolioConfig.description,
    images: [
      {
        url: `${portfolioConfig.seo.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Cherry Capital - Full Stack Developer & Web Development Studio",
      }
    ],
    siteName: "Cherry Capital Portfolio",
  },

  // Enhanced Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: portfolioConfig.name,
    description: portfolioConfig.description,
    images: [`${portfolioConfig.seo.url}/og-image.png`],
    creator: portfolioConfig.seo.twitterHandle,
    site: portfolioConfig.seo.twitterHandle,
  },

  // Enhanced icons
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

  // Robot configuration
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <StructuredData />
        <BreadcrumbSchema />
        <Analytics />
      </body>
    </html>
  );
}
