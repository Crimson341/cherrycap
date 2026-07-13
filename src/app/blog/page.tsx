import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  FolderOpenDot,
  Hash,
} from "lucide-react";

import { BlogStructuredData } from "@/components/BlogStructuredData";
import { SiteChrome } from "@/components/SiteChrome";
import FooterSection from "@/components/sections/FooterSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/ui/FlickingGridBG";
import { BlogPostArt } from "@/components/ui/BlogPostArt";
import SectionSeparator from "@/components/ui/SectionSeperator";
import { publishedBlogPosts } from "@/lib/blogPosts";

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
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );

  const latestPost = posts[0];
  const olderPosts = posts.slice(1);

  return (
    <>
      <BlogStructuredData />
      <SiteChrome>
        <div className="relative full-line-bottom">
          <div className="relative aspect-2/1 select-none border-x md:aspect-3/1">
            <FlickeringGrid
              className="absolute inset-0 z-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
              squareSize={4}
              gridGap={6}
              color="#999"
              maxOpacity={0.35}
              flickerChance={0.08}
              height={800}
              width={800}
            />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <h1 className="font-mono text-3xl font-semibold tracking-tight md:text-4xl">
                Blog
              </h1>
              <p className="max-w-sm font-mono text-sm leading-relaxed text-muted-foreground">
                Stuff I&apos;m figuring out while I build. Websites, tools, and
                the occasional rant about bad internet advice.
              </p>
            </div>
          </div>
        </div>

        <SectionSeparator className="full-line-bottom" />

        <section className="relative border-x px-4 full-line-bottom">
          <h2 className="relative full-line-bottom text-3xl font-semibold">
            What this is
          </h2>
          <div className="flex flex-col gap-4 py-4 font-mono text-sm">
            <p className="tracking-wide">
              I needed a place to write things down that didn&apos;t fit on a
              project page. Tips, mistakes, notes from real work. Nothing
              polished for LinkedIn.
            </p>
            <p className="tracking-wide">
              If you run a business around here and you&apos;re tired of
              websites and tech talk that feel fake, you&apos;re who I&apos;m
              writing for.
            </p>
          </div>
        </section>

        <SectionSeparator className="full-line-bottom" />

        <section className="relative border-x px-4 full-line-bottom">
          <h2 className="relative flex items-center gap-2 full-line-bottom text-3xl font-semibold">
            <BookOpen className="size-6 text-primary" aria-hidden="true" />
            Latest
          </h2>

          <div className="py-4">
            {latestPost ? (
              <Link href={`/blog/${latestPost.slug}`} className="group block">
                <article className="overflow-hidden border bg-muted/30 transition-colors hover:border-primary/50">
                  <div className="relative aspect-[16/9] select-none overflow-hidden border-b lining-tilt-background">
                    <BlogPostArt className="absolute inset-0" />
                    <Badge className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.22em]">
                      {latestPost.category}
                    </Badge>
                  </div>

                  <div className="space-y-4 p-6">
                    <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" aria-hidden="true" />
                        <time dateTime={latestPost.publishedAt}>
                          {formatDate(latestPost.publishedAt)}
                        </time>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" aria-hidden="true" />
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
                            <Hash className="mr-0.5 size-3" aria-hidden="true" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Button className="font-mono" asChild>
                        <span>
                          Read it
                          <ArrowRight className="size-4" />
                        </span>
                      </Button>
                    </div>
                  </div>
                </article>
              </Link>
            ) : (
              <div className="flex h-48 items-center justify-center border border-dashed font-mono text-sm text-muted-foreground">
                Nothing posted yet.
              </div>
            )}
          </div>
        </section>

        <SectionSeparator className="full-line-bottom" />

        {olderPosts.length > 0 && (
          <>
            <section className="relative border-x px-4 full-line-bottom">
              <h2 className="relative flex items-center gap-2 full-line-bottom text-3xl font-semibold">
                <FolderOpenDot className="size-6 text-primary" aria-hidden="true" />
                Older posts
              </h2>
              <div className="py-2">
                {olderPosts.map((post) => (
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
                      <time dateTime={post.publishedAt}>
                        {formatDate(post.publishedAt)}
                      </time>
                      <div className="size-1 rounded-full bg-border" />
                      <span>{post.readTime}</span>
                      <ChevronRight className="ml-auto size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            <SectionSeparator className="full-line-bottom" />
          </>
        )}

        <section className="relative border-x px-4 full-line-bottom">
          <div className="space-y-4 py-8 text-center">
            <h2 className="font-mono text-2xl font-semibold">
              Need a website?
            </h2>
            <p className="mx-auto max-w-md font-mono text-sm text-muted-foreground">
              I build them for local businesses up here. You work with me —
              not a sales team, then a designer, then someone else.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild className="font-mono">
                <Link href="/#contact">Email me</Link>
              </Button>
              <Button variant="outline" asChild className="font-mono">
                <Link href="/">Back to the site</Link>
              </Button>
            </div>
          </div>
        </section>

        <SectionSeparator className="full-line-bottom" />
        <FooterSection />
        <SectionSeparator className="full-line-bottom" />
      </SiteChrome>
    </>
  );
}
