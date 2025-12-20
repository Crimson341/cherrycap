"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, X } from "lucide-react";
import { blogPosts, blogTags, type BlogPost, type BlogTag } from "@/components/ui/blog-section";
import { LazyImage } from "@/components/ui/lazy-image";
import { Footer } from "@/components/blocks/footer-section";

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

function BlogPageContent() {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag") as BlogTag | null;
  const [selectedTags, setSelectedTags] = useState<BlogTag[]>(
    initialTag ? [initialTag] : []
  );

  const filteredPosts =
    selectedTags.length === 0
      ? blogPosts
      : blogPosts.filter((post) =>
          selectedTags.some((tag) => post.tags?.includes(tag))
        );

  const toggleTag = (tag: BlogTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearTags = () => setSelectedTags([]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Link href="/" className="font-bold text-xl tracking-tight">
            Cherry<span className="text-neutral-400">Cap</span>
          </Link>

          <div className="w-[100px]" />
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <div className="border-b border-border/40">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              CherryCap Blog
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Insights on tech, business opportunities, and the latest releases
              for our premium members. Stay ahead of the curve.
            </p>
          </div>
        </div>

        {/* Tag Filter Section */}
        <div className="border-b border-border/40">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>Filter by tag:</span>
              </div>
              {blogTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-neutral-100 text-neutral-900"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={clearTags}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="mx-auto max-w-6xl px-4 py-8">
          {selectedTags.length > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} tagged with:{" "}
              {selectedTags.join(", ")}
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
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
                      className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${getCategoryStyle(
                        post.category
                      )}`}
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

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No posts found with the selected tags.
              </p>
              <button
                onClick={clearTags}
                className="mt-4 text-neutral-400 hover:text-neutral-200 text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  );
}
