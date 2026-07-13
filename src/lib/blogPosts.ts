export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  category: string;
  tags: string[];
  heroImage?: string;
  heroAlt?: string;
  featured: boolean;
  published: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: 0,
    title: "Welcome to the Cherry Capital Blog",
    slug: "welcome-to-the-cherry-capital-blog",
    excerpt:
      "I build cool things and needed a place to put my thoughts down — so I made this. Here's what Cherry Capital is about, and why working with a solo developer means you talk straight to the person building your project.",
    content: "Welcome Content",
    publishedAt: "2026-06-08",
    updatedAt: "2026-06-08",
    readTime: "2 min read",
    category: "Welcome",
    tags: ["Welcome", "Cherry Capital", "Northern Michigan", "Web Studio"],
    featured: true,
    published: true,
  },
  {
    id: 1,
    title: "Why I Build with Next.js and Cloudflare Now",
    slug: "what-makes-nextjs-special",
    excerpt: "The framework is only half the story. Here is why I pair Next.js with Cloudflare—and what that combination actually changes for the businesses I build for.",
    content: "Next.js Special Content", // This will be handled by the component
    publishedAt: "2025-01-18",
    updatedAt: "2026-07-13",
    readTime: "6 min read",
    category: "Technology",
    tags: ["Next.js", "Cloudflare", "Performance", "Modern Web"],
    heroImage: "/blog/nextjs-cloudflare-edge.jpg",
    heroAlt: "A laptop in a Northern Michigan studio with subtle illuminated network paths stretching across the scene",
    featured: true,
    published: true,
  },
  {
    id: 2,
    title: "Why Choose Cherry Capital Web? A Clear-Eyed Local Comparison",
    slug: "why-choose-cherry-capital-web",
    excerpt: "Northern Michigan has plenty of website options. Here is an honest look at the field—and the kind of business that gets the most value from working directly with Cherry Capital.",
    content: "Why Cherry Capital Content",
    publishedAt: "2026-07-13",
    updatedAt: "2026-07-13",
    readTime: "7 min read",
    category: "Studio Notes",
    tags: ["Cherry Capital", "Northern Michigan", "Web Design", "Small Business"],
    heroImage: "/blog/why-cherry-capital-web.jpg",
    heroAlt: "A local business owner and independent designer reviewing website sketches together beside a Northern Michigan lake",
    featured: true,
    published: true,
  },
  {
    id: 3,
    title: "How I Build Modern Web Apps",
    slug: "how-i-build-modern-web-apps",
    excerpt: "A look into the modern web development process.",
    content: "Blog post content.",
    publishedAt: "2025-01-16",
    readTime: "7 min read",
    category: "Web Development",
    tags: ["Web Development", "Modern Web", "Next.js"],
    featured: false,
    published: false,
  },
  {
    id: 4,
    title: "WordPress Isn't Cutting It in 2025",
    slug: "wordpress-isnt-cutting-it-2025",
    excerpt: "Why WordPress is no longer the best option for modern websites.",
    content: "Blog post content.",
    publishedAt: "2025-01-15",
    readTime: "5 min read",
    category: "Web Development",
    tags: ["WordPress", "Modern Web", "Performance"],
    featured: false,
    published: false,
  },
  {
    id: 5,
    title: "Building PWAs for Michigan Tourism",
    slug: "building-pwas-michigan-tourism",
    excerpt: "How Progressive Web Apps can help the Michigan tourism industry.",
    content: "Blog post content.",
    publishedAt: "2024-12-10",
    readTime: "6 min read",
    category: "Web Development",
    tags: ["PWA", "Michigan", "Tourism"],
    featured: false,
    published: false,
  },
  {
    id: 6,
    title: "Local SEO Secrets for 2024",
    slug: "local-seo-secrets-2024",
    excerpt: "Tips and tricks for improving your local SEO.",
    content: "Blog post content.",
    publishedAt: "2024-12-05",
    readTime: "8 min read",
    category: "SEO",
    tags: ["SEO", "Local SEO", "Marketing"],
    featured: false,
    published: false,
  },
  {
    id: 7,
    title: "The Real Cost of DIY Website Builders",
    slug: "real-cost-diy-website-builders",
    excerpt: "Why DIY website builders might not be as cheap as you think.",
    content: "Blog post content.",
    publishedAt: "2024-11-28",
    readTime: "7 min read",
    category: "Web Development",
    tags: ["DIY", "Website Builders", "Cost"],
    featured: false,
    published: false,
  },
];

export const publishedBlogPosts = blogPosts.filter((post) => post.published);
