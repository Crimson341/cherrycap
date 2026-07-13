import { portfolioConfig } from "@/lib/portfolioConfig";
import { publishedBlogPosts } from "@/lib/blogPosts";

const siteUrl = portfolioConfig.seo.url.replace(/\/$/, "");

const companyProjects = [
  {
    name: "Hill Top Soda Shoppe",
    place: "Benzonia, MI",
    url: "https://www.hilltopsodashoppe.com/",
  },
  {
    name: "Lynn & Perin",
    place: "Mercantile",
    url: "https://www.lynnandperin.com/",
  },
  {
    name: "Victoria's Floral Weddings",
    place: "Weddings",
    url: "https://www.victoriasfloralweddings.com/",
  },
  {
    name: "Petals & Perks",
    place: "Frankfort, MI",
    url: "https://www.petalsandperks.com/",
  },
] as const;

const companyServices = [
  {
    title: "Custom websites",
    body: "Built from scratch for how the business actually sells — not a template with a logo stuck on.",
  },
  {
    title: "Redesigns",
    body: "Slow, dated, or confusing sites rebuilt for phones and clear messaging.",
  },
  {
    title: "Local SEO",
    body: "Technical setup and content so nearby customers can find the business when they search.",
  },
  {
    title: "WordPress security",
    body: "Malware cleanup, hardening, updates, backups, and monitoring for existing WordPress sites. Details at /security.",
  },
] as const;

/** Typical project ranges — always stress that a real quote needs project details. */
const pricingGuidance = {
  typicalMin: 800,
  typicalMax: 4000,
  note:
    "Most small-business sites land roughly in the $800–$4,000+ range. Simpler brochure-style sites sit toward the lower end; more pages, custom features, e-commerce, or complex redesigns go higher — sometimes past $4,000. Exact pricing depends on scope. Always ask what the site needs to do, how many pages, and whether they have content/photos ready.",
} as const;

function getBlogCatalog() {
  return publishedBlogPosts.map((post) => ({
    title: post.title,
    slug: post.slug,
    url: `${siteUrl}/blog/${post.slug}`,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags,
    publishedAt: post.publishedAt,
    readTime: post.readTime,
  }));
}

export function searchBlogPosts(query: string, limit = 5) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  const catalog = getBlogCatalog();
  if (terms.length === 0) return catalog.slice(0, limit);

  const scored = catalog
    .map((post) => {
      const hay = [
        post.title,
        post.excerpt,
        post.category,
        ...post.tags,
      ]
        .join(" ")
        .toLowerCase();
      const score = terms.reduce(
        (acc, term) => acc + (hay.includes(term) ? 1 : 0),
        0,
      );
      return { post, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.post);

  return scored.length > 0 ? scored : catalog.slice(0, Math.min(limit, 3));
}

export function getCompanyInfoPacket() {
  const blogs = getBlogCatalog();
  return {
    business: portfolioConfig.name,
    tagline: portfolioConfig.description,
    location: portfolioConfig.location,
    email: portfolioConfig.email,
    website: siteUrl,
    areaServed: portfolioConfig.nap.areaServed,
    services: companyServices,
    pricing: pricingGuidance,
    projects: companyProjects,
    blogs,
    contactPage: `${siteUrl}/#contact`,
    blogIndex: `${siteUrl}/blog`,
  };
}

function buildCompanyKnowledgeText() {
  const blogs = getBlogCatalog();
  const faqs = portfolioConfig.faqs
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");

  return `
# ${portfolioConfig.name}
${portfolioConfig.description}

## Contact
- Email: ${portfolioConfig.email}
- Location: ${portfolioConfig.location}
- Website: ${siteUrl}
- Contact form: ${siteUrl}/#contact
- Areas served: ${portfolioConfig.nap.areaServed.join(", ")}

## Services
${companyServices.map((s) => `- ${s.title}: ${s.body}`).join("\n")}

## Pricing guidance
${pricingGuidance.note}

## Example work
${companyProjects.map((p) => `- ${p.name} (${p.place}): ${p.url}`).join("\n")}

## Process
- Work directly with the developer (no sales handoff).
- Learn the business, clean up the message, build a fast mobile-first site, hand it off so the client isn't locked in.
- Typical small-business timelines: a few weeks once messaging and content are clear.
- Stack: modern Next.js / React sites — not bloated WordPress template sites.

## FAQ
${faqs}

## Blog posts (link these when relevant)
${blogs
  .map(
    (b) =>
      `- ${b.title} — ${b.url}\n  ${b.excerpt} (tags: ${b.tags.join(", ")})`,
  )
  .join("\n")}

## Social
- Facebook: ${portfolioConfig.socialLinks.facebook}
- X/Twitter: ${portfolioConfig.socialLinks.twitter}
- LinkedIn: ${portfolioConfig.socialLinks.linkedin}
`.trim();
}

export function buildSystemPrompt() {
  return `You are the on-site assistant for Cherry Capital (cherrycapitalweb.com), a Beulah, Michigan web studio that builds custom websites for Northern Michigan businesses.

## Hard scope rules
- ONLY discuss Cherry Capital, its services, pricing ranges, process, portfolio, local web design / SEO topics, and helping the visitor start a project.
- If asked about unrelated topics (politics, personal advice, coding homework, other companies, general trivia, etc.), briefly decline and steer back to web projects or how Cherry Capital can help.
- Do not invent clients, prices, guarantees, or features that are not in the knowledge below.
- Do not claim to be Scott (the owner). You are a helpful assistant for the business.

## Sales / pricing behavior
- Pricing usually ranges about $${pricingGuidance.typicalMin}–$${pricingGuidance.typicalMax}+ depending on complexity (pages, redesign depth, e-commerce, custom features, content readiness).
- Never give a firm quote in chat. Always explain that a real estimate needs project details, and invite them to describe their website needs (current site URL if any, goals, pages, timeline).
- Encourage sharing a short project brief or using the contact form / email tools.

## Links & blogs
- When a blog post is relevant, call the search_blog_posts tool and include the full URLs in your reply.
- Prefer linking to site pages: home, work, about, blog, contact.

## Messages & email
- Visitors can leave a message for the studio or ask to receive company info by email.
- If they want to contact the studio or leave project details, collect name, email, and message, then call submit_lead.
- If they want company information emailed to them (or say "yes" after you offer), collect their email (and name if available), then call send_company_info_email.
- Confirm success or failure based on tool results. Never pretend an email sent if the tool failed.
- You may also point them to ${portfolioConfig.email} and ${siteUrl}/#contact.

## Tone
- Friendly, plainspoken, professional — matches a one-person Northern Michigan studio.
- Concise. Use short paragraphs and bullets when helpful.
- Ask one clarifying question at a time when scoping a project.

## Company knowledge
${buildCompanyKnowledgeText()}
`;
}
