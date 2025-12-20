"use client";

import Link from "next/link";
import { LazyImage } from "./lazy-image";
import { blogPosts, type BlogPost } from "./blog-section";
import { Button } from "./button";
import { ArrowRight } from "lucide-react";

function getCategoryStyle(category: BlogPost["category"]) {
  switch (category) {
    case "tech":
      return "bg-neutral-500/10 text-neutral-300";
    case "business":
      return "bg-slate-500/10 text-slate-300";
    case "releases":
      return "bg-emerald-500/10 text-emerald-400";
    case "premium":
      return "bg-neutral-400/10 text-neutral-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getCategoryLabel(category: BlogPost["category"]) {
  switch (category) {
    case "tech":
      return "Tech";
    case "business":
      return "Business";
    case "releases":
      return "New Release";
    case "premium":
      return "Premium";
    default:
      return "";
  }
}

export function BlogPreview() {
  // Get the 3 most recent blog posts
  const previewPosts = blogPosts.slice(0, 3);

  return (
    <section className="relative py-20 px-4 bg-background">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700/50 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-neutral-300 font-medium">From Our Blog</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Latest{" "}
            <span className="bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              Insights & Updates
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay informed with the latest in tech, business strategies, and exclusive updates for our community.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className={`grid gap-6 mb-10 ${previewPosts.length === 1 ? 'max-w-lg mx-auto' : previewPosts.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {previewPosts.map((post) => (
            <Link
              href={post.slug}
              key={post.title}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:shadow-neutral-500/10 hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative overflow-hidden">
                <LazyImage
                  src={post.image}
                  fallback="https://placehold.co/640x360?text=CherryCap+Blog"
                  inView={true}
                  alt={post.title}
                  ratio={16 / 9}
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                {post.category && (
                  <span
                    className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${getCategoryStyle(post.category)}`}
                  >
                    {getCategoryLabel(post.category)}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={post.createdAt}>{post.createdAt}</time>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <span>{post.readTime}</span>
                </div>

                <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-neutral-100 transition-colors">
                  {post.title}
                </h3>

                <p className="text-muted-foreground text-sm line-clamp-2">
                  {post.description}
                </p>

                <div className="flex items-center text-sm font-medium text-neutral-400 group-hover:text-neutral-200 pt-2">
                  Read more
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/blog">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
