import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  FolderOpenDot,
  Hash,
  Search,
  Sparkles,
} from "lucide-react";

import { BlogStructuredData } from "@/components/BlogStructuredData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { publishedBlogPosts } from "@/lib/blogPosts";

const topicCloud = [
  "UX Design",
  "React",
  "Serverless",
  "Local SEO",
  "Optimization",
  "Branding",
];

const footerLinks = [
  { label: "Work", href: "/#projects" },
  { label: "Services", href: "/#about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export default function BlogPage() {
  const posts = [...publishedBlogPosts].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );

  const latestPost = posts[0];
  const archivedPosts = posts.slice(1);
  const categories = [...new Set(posts.map((post) => post.category))];

  const welcomePanels = [
    {
      number: "01",
      title: "Field notes, not filler.",
      description:
        "Posts here feel useful, sharp, and honest instead of padded for SEO.",
    },
    {
      number: "02",
      title: "Built for real business.",
      description:
        "Covering launches, growth, and the work behind modern web projects.",
    },
    {
      number: "03",
      title: "Archive focus.",
      description:
        "A growing library of technical insights and creative breakthroughs.",
    },
  ];

  return (
    <>
      <BlogStructuredData />
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
        <nav className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="size-4" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold tracking-tight">
                  Cherry Capital Web
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.26em] text-muted-foreground">
                  Blog
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                asChild
                className="text-muted-foreground hover:text-foreground"
              >
                <Link href="/">
                  <ArrowLeft className="size-4" />
                  Back
                </Link>
              </Button>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <Button
                variant="outline"
                asChild
                className="rounded-full border-border/70 bg-card/80"
              >
                <Link href="/#contact">Subscribe</Link>
              </Button>
            </div>
          </div>
        </nav>

        <header className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-secondary)_34%,transparent),transparent_62%)] py-16 md:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(color-mix(in_srgb,var(--color-border)_72%,transparent)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-primary)_20%,transparent),transparent_60%)]" />

          <div className="mx-auto max-w-6xl px-4 text-center">
            <Badge
              variant="secondary"
              className="mb-6 rounded-full border border-primary/15 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.3em]"
            >
              Journal &amp; Insights
            </Badge>

            <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Refining the digital craft,
              <br />
              <span className="font-mono italic text-primary">one pixel</span> at a time.
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Welcome to the Cherry Capital Web Blog. A notebook of field notes on
              design, local growth, and high-performance web engineering.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="h-11 rounded-full border-border/70 bg-background/70 pl-10 pr-4 shadow-sm backdrop-blur-sm"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="cursor-default rounded-full border-border/70 bg-card/75 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] hover:bg-secondary"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="border-b border-border/70 py-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {welcomePanels.map((panel) => (
                <div
                  key={panel.number}
                  className="group relative rounded-2xl border border-border/70 bg-card/82 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-secondary/45 hover:shadow-[0_18px_50px_-40px_color-mix(in_srgb,var(--color-foreground)_55%,transparent)]"
                >
                  <span className="mb-2 block font-mono text-xs font-bold tracking-[0.24em] text-primary/55">
                    {panel.number}
                  </span>
                  <h3 className="mb-2 text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {panel.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {panel.description}
                  </p>
                  <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowUpRight className="size-4 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                  <BookOpen className="size-5 text-primary" />
                  Latest Release
                </h2>
                <div className="mx-4 h-px flex-1 bg-border" />
              </div>

              {latestPost ? (
                <Link href={`/blog/${latestPost.slug}`} className="group block">
                  <article>
                    <Card className="overflow-hidden border-0 bg-transparent py-0 shadow-none">
                      <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl border border-border/70 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-secondary)_38%,transparent),color-mix(in_srgb,var(--color-card)_92%,transparent))]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--color-primary)_16%,transparent),transparent_34%)]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText className="size-16 text-foreground/15" />
                        </div>
                        <Badge className="absolute left-4 top-4 rounded-full font-mono text-[10px] uppercase tracking-[0.22em]">
                          Featured
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="size-3" />
                            {new Date(latestPost.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="size-3" />
                            {latestPost.readTime}
                          </span>
                        </div>

                        <h3 className="text-3xl font-semibold tracking-[-0.04em] transition-colors group-hover:text-primary md:text-4xl">
                          {latestPost.title}
                        </h3>

                        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
                          {latestPost.excerpt}
                        </p>

                        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap gap-x-3 gap-y-2">
                            {latestPost.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center text-xs font-mono text-muted-foreground"
                              >
                                <Hash className="mr-0.5 size-3" />
                                {tag}
                              </span>
                            ))}
                          </div>

                          <Button className="rounded-full font-mono" asChild>
                            <span>
                              Read Story
                              <ArrowRight className="size-4" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </article>
                </Link>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                  No posts found. Starting the engine...
                </div>
              )}
            </div>

            <aside className="space-y-12 lg:col-span-4">
              <div>
                <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                  <FolderOpenDot className="size-5 text-primary" />
                  Archive
                </h2>

                <div className="space-y-6">
                  {archivedPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col gap-2 border-b border-border/70 pb-6 last:border-0"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.26em] text-primary">
                        {post.category}
                      </div>
                      <h4 className="text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <div className="size-1 rounded-full bg-border" />
                        <span>{post.readTime}</span>
                        <ChevronRight className="ml-auto size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <Card className="group relative overflow-hidden rounded-2xl border-0 bg-primary p-6 text-primary-foreground shadow-[0_24px_60px_-38px_color-mix(in_srgb,var(--color-primary)_80%,transparent)]">
                <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                  <Sparkles className="size-24" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Need a high-performance site?
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-primary-foreground/80">
                  We build fast, secure, and beautiful digital experiences for local
                  brands.
                </p>
                <Button
                  variant="secondary"
                  asChild
                  className="w-full rounded-full font-mono"
                >
                  <Link href="/#contact">Get a Quote</Link>
                </Button>
              </Card>

              <div>
                <h3 className="mb-4 text-sm font-mono font-bold uppercase tracking-[0.3em]">
                  Popular Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topicCloud.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="cursor-default rounded-full border-border/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] hover:border-primary/50"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="border-t border-border/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-secondary)_28%,transparent),transparent)] py-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
              <div>
                <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                  <Sparkles className="size-4 text-primary" />
                  <span className="font-semibold">Cherry Capital Web</span>
                </div>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Modern web studio specializing in speed, design, and regional
                  growth.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex gap-4">
                <Button variant="outline" asChild className="h-9 px-3">
                  <Link href="/">
                    <ArrowLeft className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-9 px-3">
                  <Link href={latestPost ? `/blog/${latestPost.slug}` : "/blog"}>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-12 border-t border-border/70 pt-8 text-center text-xs font-mono text-muted-foreground">
              &copy; {new Date().getFullYear()} Cherry Capital Web. Traverse City, MI.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
