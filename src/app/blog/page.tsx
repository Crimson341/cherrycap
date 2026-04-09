import React from "react";
import { Calendar, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlickeringGrid } from "@/components/ui/FlickingGridBG";
import { BlogStructuredData } from "@/components/BlogStructuredData";
import { publishedBlogPosts } from "@/lib/blogPosts";

export default function BlogPage() {
  const posts = [...publishedBlogPosts].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );
  const featuredPosts = posts.filter((post) => post.featured);
  const recentPosts = posts.filter((post) => !post.featured);

  return (
    <>
      <BlogStructuredData />
      <div className="min-h-screen bg-background">
        <main className="h-dvh max-w-full overflow-x-hidden sm:overflow-x-visible relative w-full mx-auto md:max-w-3xl pt-12 px-2 md:px-0">
          {/* Header Section with Grid Background */}
          <div className="relative full-line-bottom">
            <div className="aspect-[2/1] relative select-none md:aspect-[3/1] border-x">
              <FlickeringGrid
                className="relative inset-0 z-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
                squareSize={4}
                gridGap={6}
                color="#999"
                maxOpacity={0.3}
                flickerChance={0.1}
                height={800}
                width={800}
              />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold font-mono">
                    Cherry Capital <span className="text-primary">Blog</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
                    Real talk about modern web development, local business, and why WordPress isn&apos;t always the answer
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <section className="px-4 border-x full-line-bottom relative">
            <div className="py-4">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono">
                <ArrowLeft className="size-4" />
                Back to Portfolio
              </Link>
            </div>
          </section>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="border-x full-line-bottom relative">
              <h2 className="pl-4 text-3xl font-semibold relative full-line-bottom">
                Featured Posts
              </h2>
              <div className="p-4 space-y-4">
                {featuredPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                    <article className="p-6 border border-border/40 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-200 hover:border-primary/20">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge variant="default" className="text-xs">
                          Featured
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors font-mono">
                        {post.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-primary font-mono group-hover:translate-x-1 transition-transform">
                          Read more →
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {recentPosts.length > 0 && (
            <section className="border-x full-line-bottom relative">
              <h2 className="pl-4 text-3xl font-semibold relative full-line-bottom">
                Recent Posts
              </h2>
              <div className="p-4 space-y-4">
                {recentPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                    <article className="p-6 border border-border/40 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-200 hover:border-primary/20">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors font-mono">
                        {post.title}
                      </h3>

                      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-primary font-mono group-hover:translate-x-1 transition-transform">
                          Read more →
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Footer CTA Section */}
          <section className="px-4 border-x full-line-bottom relative">
            <div className="py-8 text-center space-y-4">
              <h2 className="text-2xl font-semibold font-mono">
                Ready to ditch WordPress?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto font-mono text-sm">
                Let&apos;s build your business a modern website that actually converts customers instead of losing them to slow loading times.
              </p>
              <Button asChild>
                <Link href="/#contact">
                  Let&apos;s Work Together
                </Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
} 
