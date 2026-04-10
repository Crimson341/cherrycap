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
  featured: boolean;
  published: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "What Makes Next.js Special: Why Enterprise Companies Choose It Over Everything Else",
    slug: "what-makes-nextjs-special",
    excerpt: "Nike, Spotify, OpenAI, and Netflix all run on Next.js. Here's exactly why this framework dominates the modern web and what it means for your business website.",
    content: "Next.js Special Content", // This will be handled by the component
    publishedAt: "2025-01-18",
    updatedAt: "2025-01-18",
    readTime: "9 min read",
    category: "Technology",
    tags: ["Next.js", "Performance", "Enterprise", "Modern Web", "Framework"],
    featured: true,
    published: true,
  },
  {
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
