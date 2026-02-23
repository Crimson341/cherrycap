export const BUSINESS_INFO = {
  name: "CherryCap",
  tagline: "Northern Michigan's Web Partner",
  description: "We build websites that bring customers through your door. Local web design for Northern Michigan businesses since 2022.",
  copyright: `© ${new Date().getFullYear()} CherryCap. All rights reserved.`,
  email: "hello@cherrycap.com",
  address: "Beulah, MI",
  serviceArea: "Serving Traverse City, Leelanau, Benzie, Grand Traverse & beyond",
  socials: {
    twitter: "#",
    linkedin: "#",
    facebook: "#",
  },
};

export const NAVIGATION_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Our Work", href: "/work" },
  { label: "AI for Your Site", href: "/ai" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "#contact" },
];

export const HERO_STATS = [
  { value: "10+", label: "Local Businesses Served" },
  { value: "3 Years", label: "In Northern Michigan" },
  { value: "2-4 Weeks", label: "Average Launch Time" },
  { value: "100%", label: "Client Satisfaction" },
];

export const SERVICES = [
  {
    icon: "web-design",
    title: "Website Design",
    description: "Custom websites that make your business look professional and trustworthy. No templates—everything built specifically for you.",
    gradient: "from-rose-500 to-orange-500",
    features: ["Custom design", "Mobile-friendly", "Easy to update"],
    price: "From $1,500",
  },
  {
    icon: "seo",
    title: "Local SEO",
    description: "Get found on Google when locals search for what you do. We'll get you ranking for 'your service + Traverse City' searches.",
    gradient: "from-orange-500 to-amber-500",
    features: ["Google Business", "Local keywords", "Map rankings"],
    price: "From $300/mo",
  },
  {
    icon: "ecommerce",
    title: "Online Stores",
    description: "Sell products online with a store that's easy for you to manage. Take orders 24/7 while you sleep.",
    gradient: "from-emerald-500 to-teal-500",
    features: ["Product management", "Secure checkout", "Inventory sync"],
    price: "From $3,000",
  },
  {
    icon: "web-dev",
    title: "Website Maintenance",
    description: "We handle the updates, security, and backups so you don't have to. Call us anytime something's not right.",
    gradient: "from-cyan-500 to-blue-500",
    features: ["Monthly updates", "Security patches", "Same-day support"],
    price: "From $99/mo",
  },
  {
    icon: "performance",
    title: "ADA Compliance",
    description: "Make your website accessible to everyone and protect yourself from ADA lawsuits. We audit and fix accessibility issues.",
    gradient: "from-violet-500 to-purple-500",
    features: ["WCAG compliance", "Screen reader ready", "Legal protection"],
    price: "From $500",
  },
  {
    icon: "mobile",
    title: "Website Redesign",
    description: "Outdated website embarrassing you? We'll rebuild it modern, fast, and optimized to actually get you business.",
    gradient: "from-pink-500 to-rose-500",
    features: ["Fresh design", "Better conversion", "Keep your content"],
    price: "From $2,000",
  },
];

export const PROCESS_STEPS = [
  { step: "01", title: "Free Consultation", desc: "We'll meet (coffee's on us) to understand your business and what you actually need—no sales pitch." },
  { step: "02", title: "Custom Proposal", desc: "You get a clear quote with exactly what's included. No hidden fees, no surprises." },
  { step: "03", title: "We Build It", desc: "You review and approve designs before we code anything. We keep you in the loop the whole time." },
  { step: "04", title: "Launch & Support", desc: "Your site goes live and we stick around. Need a change at 2am? We've got you." },
];

export const FOOTER_LINKS = [
  { title: "Services", links: ["Website Design", "Local SEO", "Online Stores", "Website Maintenance"] },
  { title: "Company", links: ["About Us", "Our Work", "Blog", "Contact"] },
  { title: "Service Area", links: ["Traverse City", "Leelanau County", "Benzie County", "Grand Traverse"] },
];

export const TRUST_BADGES = [
  { label: "Free consultation", icon: "consultation" },
  { label: "2-4 week delivery", icon: "delivery" },
  { label: "No contracts required", icon: "contract" },
  { label: "Local support team", icon: "local" },
];

// Web Design Pricing Tiers (one-time costs for websites)
export const WEB_DESIGN_PRICING = [
  {
    name: "Starter",
    price: "$1,500",
    description: "Perfect for new businesses or simple online presence",
    features: [
      "5-page custom website",
      "Mobile responsive design",
      "Contact form & Google Maps",
      "Basic SEO setup",
      "2 rounds of revisions",
      "1 year of CherryCap Pro included ($948 value)",
    ],
    timeline: "2-3 weeks",
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$3,000",
    description: "For established businesses ready to grow online",
    features: [
      "Up to 10 pages",
      "Custom design & branding",
      "Blog or news section",
      "Advanced SEO optimization",
      "Content writing assistance",
      "1 year of CherryCap Pro included ($948 value)",
    ],
    timeline: "3-4 weeks",
    cta: "Most Popular",
    highlighted: true,
  },
  {
    name: "E-Commerce",
    price: "$5,000+",
    description: "Full online store with payment processing",
    features: [
      "Unlimited products",
      "Secure checkout",
      "Inventory management",
      "Shipping integration",
      "Payment gateway setup",
      "1 year of CherryCap Pro included ($948 value)",
    ],
    timeline: "4-6 weeks",
    cta: "Let's Talk",
    highlighted: false,
  },
];

// Monthly Maintenance/Ongoing Services
export const MONTHLY_SERVICES = [
  {
    name: "Hosting & Platform",
    price: "$99",
    period: "/month",
    features: [
      "Premium website hosting",
      "Security & weekly backups",
      "Uptime monitoring",
      "CherryCap Platform (Growth Tier)",
    ],
  },
  {
    name: "The 'Done for You'",
    price: "$299",
    period: "/month",
    features: [
      "Everything in Hosting",
      "CherryCap Platform (Pro Tier)",
      "AI leads & inbox automation",
      "2 hrs monthly content updates",
      "Monthly SEO tweaks",
    ],
  },
  {
    name: "Growth Partner",
    price: "$799+",
    period: "/month",
    features: [
      "Everything in 'Done for You'",
      "CherryCap Platform (Business Tier)",
      "Dedicated Local SEO campaigns",
      "Monthly blog writing",
      "Dedicated account manager",
    ],
  },
];

