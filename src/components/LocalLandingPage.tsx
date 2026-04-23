import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";

import BlogPageShell from "@/components/BlogPageShell";
import SectionSeparator from "@/components/ui/SectionSeperator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LocalServiceArea } from "@/lib/localSeo";
import { localServiceAreaUrl, localSeoKeywords } from "@/lib/localSeo";
import { absoluteUrl, safeJsonLd, siteName } from "@/lib/seo";

const deliverables = [
  "Custom website design and development",
  "Local SEO page structure and metadata",
  "Schema markup for web design and service-area searches",
  "Fast Core Web Vitals-minded Next.js builds",
  "Contact paths designed for quote requests and consultations",
];

const faqs = [
  {
    question: "Do you work with businesses that need a website designer near me?",
    answer:
      "Yes. Cherry Capital serves local Northern Michigan businesses and builds pages around the real towns, services, and customer intent they need to rank for.",
  },
  {
    question: "Can you help a business compete with older web design agencies?",
    answer:
      "Yes. The first step is usually stronger technical SEO, clearer service pages, better local schema, faster performance, and a site structure that answers local search intent directly.",
  },
  {
    question: "Do you only build new websites?",
    answer:
      "No. Cherry Capital can rebuild outdated websites, run SEO audits, clean up technical issues, and create local landing pages for businesses that already have a site.",
  },
];

function LocalJsonLd({ area }: { area: LocalServiceArea }) {
  const pageUrl = localServiceAreaUrl(area);
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    "name": area.title,
    "description": area.description,
    "serviceType": ["Website design", "Web development", "Local SEO"],
    "provider": {
      "@type": "ProfessionalService",
      "@id": absoluteUrl("/#service"),
      "name": siteName,
      "url": absoluteUrl("/"),
      "areaServed": [
        {
          "@type": "City",
          "name": area.city,
          "addressRegion": area.region,
        },
        ...area.nearby.map((name) => ({
          "@type": "City",
          "name": name,
          "addressRegion": area.region,
        })),
      ],
    },
    "areaServed": {
      "@type": area.city.includes("County") ? "AdministrativeArea" : "City",
      "name": area.city,
      "addressRegion": area.region,
    },
    "url": pageUrl,
    "keywords": localSeoKeywords.join(", "),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": area.title,
        "item": pageUrl,
      },
    ],
  };

  return (
    <>
      {[serviceSchema, faqSchema, breadcrumbSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      ))}
    </>
  );
}

export function LocalLandingPage({ area }: { area: LocalServiceArea }) {
  return (
    <BlogPageShell>
      <LocalJsonLd area={area} />
      <section className="relative border-x full-line-bottom px-4 py-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full font-mono text-[10px] uppercase tracking-[0.22em]">
            {area.county}
          </Badge>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <MapPin className="size-3" />
            {area.city}, {area.region}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {area.h1}
        </h1>
        <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed tracking-wide text-muted-foreground">
          {area.intro}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-full font-mono">
            <Link href="/#contact">
              Talk about your site
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full font-mono">
            <Link href="/tools/seo-checker">Run the free SEO checker</Link>
          </Button>
        </div>
      </section>
      <SectionSeparator className="full-line-bottom" />

      <section className="relative border-x full-line-bottom p-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Built for local search, not just a prettier homepage
        </h2>
        <p className="mt-3 font-mono text-sm leading-relaxed tracking-wide text-muted-foreground">
          {area.proof}
        </p>
        <ul className="mt-5 grid gap-2">
          {deliverables.map((item) => (
            <li key={item} className="flex items-start gap-2 font-mono text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
      <SectionSeparator className="full-line-bottom" />

      <section className="relative border-x full-line-bottom">
        <h2 className="relative full-line-bottom px-4 py-3 text-xl font-semibold tracking-tight">
          Nearby service areas
        </h2>
        <div className="flex flex-wrap gap-2 p-4">
          {area.nearby.map((place) => (
            <span
              key={place}
              className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground"
            >
              {place}
            </span>
          ))}
        </div>
      </section>
      <SectionSeparator className="full-line-bottom" />

      <section className="relative border-x full-line-bottom">
        <h2 className="relative full-line-bottom px-4 py-3 text-xl font-semibold tracking-tight">
          Common questions
        </h2>
        <div className="divide-y divide-border">
          {faqs.map((faq) => (
            <div key={faq.question} className="p-4">
              <h3 className="font-semibold tracking-tight">{faq.question}</h3>
              <p className="mt-2 font-mono text-sm leading-relaxed tracking-wide text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
      <SectionSeparator className="full-line-bottom" />

      <footer className="relative h-fit border-x full-line-bottom p-4">
        <p className="text-center font-mono text-sm text-balance text-muted-foreground">
          Local web design by{" "}
          <Link className="font-semibold underline" href="/">
            Cherry Capital
          </Link>
          .
        </p>
      </footer>
      <SectionSeparator className="full-line-bottom" />
    </BlogPageShell>
  );
}
