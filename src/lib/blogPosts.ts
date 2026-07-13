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

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "AI for regular businesses — what it's actually good for",
    slug: "how-ai-actually-helps-companies",
    excerpt:
      "I ignored the hype for a while. Then I started using AI for boring work. Here's what helps, what doesn't, and how a small company can try it without getting scammed by the next shiny tool.",
    content: "AI Helps Companies Content",
    publishedAt: "2026-07-10",
    updatedAt: "2026-07-10",
    readTime: "7 min read",
    category: "Business",
    tags: ["AI", "Small Business", "Work"],
    featured: true,
    published: true,
  },
];

export const publishedBlogPosts = blogPosts.filter((post) => post.published);
