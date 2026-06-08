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
  FolderOpenDot,
  Hash,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { BlogStructuredData } from "@/components/BlogStructuredData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/ui/FlickingGridBG";
import { BlogPostArt } from "@/components/ui/BlogPostArt";
import { publishedBlogPosts } from "@/lib/blogPosts";

const welcomePanels = [
  {
    number: "01",
    title: "Real projects, written down.",
    description:
      "Most of what I post comes straight from stuff I'm actually building — what worked, what broke, and what I'd do differently.",
  },
  {
    number: "02",
    title: "Not just websites.",
    description:
      "Websites, apps, tools — if it can be built, I'm probably interested in figuring it out and writing about it.",
  },
  {
    number: "03",
    title: "One person behind it.",
    description:
      "It's just me. So when you read something here, you're hearing it straight from the person who'd actually build your project.",
  },
];

const footerLinks = [
  { label: "Work", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPage() {
  const posts = [...publishedBlogPosts].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );

  const latestPost = posts[0];
  const archivedPosts = posts.slice(1);

  return (
    <>
      <BlogStructuredData />
      <div className="min-h-screen bg-background">
        <main className="relative mx-auto w-full max-w-full overflow-x-hidden px-2 pt-12 sm:overflow-x-visible md:max-w-3xl md:px-0">
          {/* Hero */}
          <div className="relative full-line-bottom">
            <div className="relative select-none border-x py-16 md:py-24">
              <FlickeringGrid
                className="absolute inset-0 z-0 [mask-image:radial-gradient(350px_circle_at_center,white,transparent)]"
                squareSize={4}
                gridGap={6}
                color="#999"
                maxOpacity={0.2}
                flickerChance={0.1}
                height={600}
                width={800}
              />
              <div className="relative z-10 mx-auto max-w-2xl space-y-6 px-8 text-center">
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] uppercase tracking-[0.3em]"
                >
                  Journal &amp; Insights
                </Badge>
                <h1 className="font-mono text-3xl font-bold leading-tight md:text-5xl">
                  Welcome to the Blog
                </h1>
                <p className="mx-auto max-w-xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
                  Field notes on design, local growth, and high-performance web
                  engineering — written the same way I build: small, sharp, and honest.
                </p>
              </div>
            </div>
          </div>

          {/* Welcome intro */}
          <section className="relative border-x px-4 full-line-bottom">
            <h2 className="relative full-line-bottom text-3xl font-semibold">
              Why this blog exists
            </h2>
            <div className="grid grid-cols-1 gap-px py-4 sm:grid-cols-3">
              {welcomePanels.map((panel) => (
                <div
                  key={panel.number}
                  className="group relative flex flex-col gap-2 rounded-md border bg-muted/30 p-5 transition-colors hover:border-primary/50"
                >
                  <span className="font-mono text-xs font-bold tracking-[0.24em] text-primary/60">
                    {panel.number}
                  </span>
                  <h3 className="font-mono text-base font-semibold transition-colors group-hover:text-primary">
                    {panel.title}
                  </h3>
                  <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                    {panel.description}
                  </p>
                  <ArrowUpRight className="absolute bottom-4 right-4 size-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </section>

          {/* Latest post */}
          <section className="relative border-x px-4 full-line-bottom">
            <h2 className="relative flex items-center gap-2 full-line-bottom text-3xl font-semibold">
              <BookOpen className="size-6 text-primary" />
              Latest
            </h2>

            <div className="py-4">
              {latestPost ? (
                <Link href={`/blog/${latestPost.slug}`} className="group block">
                  <article className="overflow-hidden rounded-lg border bg-muted/30 transition-colors hover:border-primary/50">
                    <div className="relative aspect-[16/9] select-none overflow-hidden border-b lining-tilt-background">
                      <BlogPostArt className="absolute inset-0" />
                      <Badge className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.22em]">
                        {latestPost.featured ? "Featured" : latestPost.category}
                      </Badge>
                    </div>

                    <div className="space-y-4 p-6">
                      <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDate(latestPost.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {latestPost.readTime}
                        </span>
                      </div>

                      <h3 className="font-mono text-2xl font-semibold leading-tight transition-colors group-hover:text-primary md:text-3xl">
                        {latestPost.title}
                      </h3>

                      <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                        {latestPost.excerpt}
                      </p>

                      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-x-3 gap-y-2">
                          {latestPost.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center font-mono text-xs text-muted-foreground"
                            >
                              <Hash className="mr-0.5 size-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button className="font-mono" asChild>
                          <span>
                            Read Story
                            <ArrowRight className="size-4" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  </article>
                </Link>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg border border-dashed font-mono text-sm text-muted-foreground">
                  No posts yet. Starting the engine...
                </div>
              )}
            </div>
          </section>

          {/* Archive */}
          {archivedPosts.length > 0 && (
            <section className="relative border-x px-4 full-line-bottom">
              <h2 className="relative flex items-center gap-2 full-line-bottom text-3xl font-semibold">
                <FolderOpenDot className="size-6 text-primary" />
                Archive
              </h2>
              <div className="py-4">
                {archivedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-2 border-b py-5 last:border-0"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-primary">
                      {post.category}
                    </span>
                    <h3 className="font-mono text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                      <span>{formatDate(post.publishedAt)}</span>
                      <div className="size-1 rounded-full bg-border" />
                      <span>{post.readTime}</span>
                      <ChevronRight className="ml-auto size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="relative border-x px-4 full-line-bottom">
            <div className="space-y-4 py-8 text-center">
              <h2 className="font-mono text-2xl font-semibold">
                Need a high-performance site?
              </h2>
              <p className="mx-auto max-w-md font-mono text-sm text-muted-foreground">
                I build fast, secure, and genuinely personal websites for local brands
                in Northern Michigan. No agency chain — just me.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link href="/#contact">Get a Quote</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">View Portfolio</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="relative h-fit border-x p-4 full-line-bottom">
            <div
              className={cn(
                "absolute top-0 left-0 flex h-full w-8 border-r border-edge",
                "before:absolute before:inset-0 before:-z-1",
                "before:bg-[repeating-linear-gradient(45deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]",
                "before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56"
              )}
            />
            <div
              className={cn(
                "absolute top-0 right-0 flex h-full w-8 border-l border-edge",
                "before:absolute before:inset-0 before:-z-1",
                "before:bg-[repeating-linear-gradient(45deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]",
                "before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56"
              )}
            />
            <div className="flex flex-col items-center gap-5 px-8">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-sm">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <p className="text-center font-mono text-sm text-balance text-muted-foreground">
                Built by{" "}
                <a
                  className="font-semibold underline"
                  href="https://cherrycapitalweb.com/"
                  target="_blank"
                  rel="noopener"
                >
                  Cherry Capital
                </a>
                . Traverse City, MI.
              </p>
              <Button
                variant="ghost"
                asChild
                className="font-mono text-muted-foreground hover:text-foreground"
              >
                <Link href="/">
                  <ArrowLeft className="size-4" />
                  Back to site
                </Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
