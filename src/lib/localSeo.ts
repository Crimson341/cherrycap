import { absoluteUrl } from "@/lib/seo";

export const localServiceAreas = [
  {
    slug: "web-design-frankfort-mi",
    city: "Frankfort",
    region: "MI",
    county: "Benzie County",
    title: "Web Designer in Frankfort, MI",
    h1: "Web design for Frankfort, MI businesses",
    description:
      "Cherry Capital builds fast custom websites, local SEO foundations, and lead-focused web systems for Frankfort, Michigan businesses.",
    intro:
      "Frankfort businesses compete with Traverse City agencies, regional directories, and older websites that have been online for years. Cherry Capital gives local service businesses, shops, restaurants, and professional firms a fast website that is easier for customers and search engines to understand.",
    proof:
      "The work is local, direct, and practical: clean Next.js builds, technical SEO, conversion-focused pages, and no handoff chain between the person selling the site and the person building it.",
    nearby: ["Elberta", "Benzonia", "Beulah", "Honor", "Arcadia"],
    priority: 0.9,
  },
  {
    slug: "web-design-traverse-city-mi",
    city: "Traverse City",
    region: "MI",
    county: "Grand Traverse County",
    title: "Web Design in Traverse City, MI",
    h1: "Traverse City web design without the agency drag",
    description:
      "Custom websites, SEO audits, and web development for Traverse City businesses that need a faster, cleaner, more useful web presence.",
    intro:
      "Traverse City search results are crowded with long-running agencies and directory listings. Cherry Capital competes by building lean, high-performance websites with clear local intent, strong technical SEO, and pages that move visitors toward a real inquiry.",
    proof:
      "You work directly with the builder. Strategy, design, development, analytics, launch cleanup, and post-launch fixes stay in one accountable workflow.",
    nearby: ["Interlochen", "Williamsburg", "Suttons Bay", "Grawn", "Kingsley"],
    priority: 0.88,
  },
  {
    slug: "web-design-benzie-county-mi",
    city: "Benzie County",
    region: "MI",
    county: "Benzie County",
    title: "Benzie County Web Design",
    h1: "Web design and SEO for Benzie County businesses",
    description:
      "Beulah-based website design and development for Benzie County businesses that need stronger local search visibility and a better customer experience.",
    intro:
      "Cherry Capital is based in Beulah and serves businesses across Benzie County. If your customers are searching for a website designer, web developer, or local SEO help near Frankfort, Beulah, Benzonia, Honor, or Lake Ann, your site needs clear local relevance before it can earn trust.",
    proof:
      "The goal is not a generic brochure site. The goal is a fast local business website with service pages, structured data, crawlable content, and a conversion path that makes it easy for customers to contact you.",
    nearby: ["Beulah", "Benzonia", "Frankfort", "Honor", "Lake Ann"],
    priority: 0.92,
  },
] as const;

export type LocalServiceArea = (typeof localServiceAreas)[number];

export function getLocalServiceArea(slug: string) {
  return localServiceAreas.find((area) => area.slug === slug);
}

export function localServiceAreaUrl(area: LocalServiceArea) {
  return absoluteUrl(`/${area.slug}`);
}

export const localSeoKeywords = [
  "website designer near me",
  "web developer near me",
  "web design Frankfort MI",
  "Frankfort MI website designer",
  "Traverse City web design",
  "Traverse City website designer",
  "Benzie County web design",
  "Beulah web developer",
  "Northern Michigan web design",
];
