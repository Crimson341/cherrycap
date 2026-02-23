import type { Metadata } from 'next'
import { pageMetadata, siteConfig, getOgImageUrl } from '@/lib/seo-config'
import { JsonLd } from '@/components/seo/json-ld'
import HomeClient from '@/components/pages/home-client'

export const metadata: Metadata = {
  title: pageMetadata.home.title,
  description: pageMetadata.home.description,
  keywords: pageMetadata.home.keywords,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: pageMetadata.home.title,
    description: pageMetadata.home.description,
    url: siteConfig.url,
    type: 'website',
    images: [{ url: getOgImageUrl(pageMetadata.home.title, pageMetadata.home.description), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.home.title,
    description: pageMetadata.home.description,
    images: [getOgImageUrl(pageMetadata.home.title, pageMetadata.home.description)],
  },
}

const homepageFaqs = [
  {
    question: 'How does a professional website help my Northern Michigan business get found?',
    answer: 'When someone searches for what you do, showing up on Google is everything. We build SEO-optimized websites that rank for local searches in Traverse City and Northern Michigan, so customers find you before your competition.',
  },
  {
    question: 'Will my website actually generate leads and calls?',
    answer: "A website that looks nice but doesn't get you calls is just expensive decoration. Every site we build has one job: get people to pick up the phone, fill out the form, or walk through your door.",
  },
  {
    question: 'How important is modern web design for my business?',
    answer: "People judge your business by your website. If it looks like it's from 2010, they'll assume your business is too. We make you look modern, trustworthy, and worth their money.",
  },
  {
    question: 'Will my website work on mobile phones?',
    answer: "More than half your customers are browsing on their phones. If your site is a pain to use on mobile, they'll just go to someone else. Our sites work perfectly on every device.",
  },
  {
    question: 'What kind of support do you provide after launch?',
    answer: "Need something changed? Call us. Text us. We'll handle it. No tickets, no waiting, no runaround. We actually pick up the phone, even on weekends.",
  },
]

export default function Home() {
  return (
    <>
      <JsonLd type="WebSite" />
      <JsonLd type="LocalBusiness" />
      <JsonLd type="Organization" />
      <JsonLd type="FAQPage" faqs={homepageFaqs} />
      <HomeClient />
    </>
  )
}
