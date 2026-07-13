import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/ui/FlickingGridBG";
import { BlogPostArt } from "@/components/ui/BlogPostArt";
import { BlogStructuredData } from "@/components/BlogStructuredData";
import { SiteChrome } from "@/components/SiteChrome";
import FooterSection from "@/components/sections/FooterSection";
import SectionSeparator from "@/components/ui/SectionSeperator";
import { AiHelpsCompaniesPost } from "@/components/blog-posts/AiHelpsCompaniesPost";
import {
  publishedBlogPosts,
  type BlogPost,
} from "@/lib/blogPosts";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { defaultOgImage, siteName } from "@/lib/seo";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function getRelatedPosts(current: BlogPost, limit = 3): BlogPost[] {
  return publishedBlogPosts
    .filter((entry) => entry.slug !== current.slug)
    .map((entry) => {
      const sharedTags = entry.tags.filter((tag) =>
        current.tags.includes(tag),
      ).length;
      const sameCategory = entry.category === current.category ? 1 : 0;
      return {
        entry,
        score: sharedTags * 2 + sameCategory,
        publishedAt: new Date(entry.publishedAt).getTime(),
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.publishedAt - left.publishedAt;
    })
    .slice(0, limit)
    .map(({ entry }) => entry);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PostBody({ slug, content }: { slug: string; content: string }) {
  if (slug === "how-ai-actually-helps-companies") {
    return <AiHelpsCompaniesPost />;
  }
  return (
    <div className="prose prose-lg max-w-none font-mono leading-relaxed">
      <p className="mb-6 tracking-wide leading-relaxed text-foreground">
        {content}
      </p>
    </div>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = publishedBlogPosts.find((entry) => entry.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post, 3);

  return (
    <>
      <BlogStructuredData post={post} />
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
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] uppercase tracking-[0.22em]"
                >
                  {post.category}
                </Badge>
                {post.featured && (
                  <Badge className="font-mono text-[10px] uppercase tracking-[0.22em]">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="max-w-2xl font-mono text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" aria-hidden="true" />
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        <SectionSeparator className="full-line-bottom" />

        <section className="relative border-x px-4 full-line-bottom">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to blog
            </Link>
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-mono text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <SectionSeparator className="full-line-bottom" />

        <section className="relative border-x px-4 full-line-bottom">
          <p className="py-4 font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            {post.excerpt}
          </p>
        </section>

        <SectionSeparator className="full-line-bottom" />

        <section className="relative border-x px-4 full-line-bottom">
          <div className="py-4">
            <div className="relative aspect-[16/9] select-none overflow-hidden border lining-tilt-background">
              <BlogPostArt className="absolute inset-0" />
            </div>
          </div>
        </section>

        <SectionSeparator className="full-line-bottom" />

        <article className="relative border-x full-line-bottom">
          <div className="px-4 py-8">
            <PostBody slug={post.slug} content={post.content} />
          </div>
        </article>

        <SectionSeparator className="full-line-bottom" />

        <section className="relative border-x px-4 full-line-bottom">
          <h2 className="relative full-line-bottom text-3xl font-semibold">
            Who wrote this
          </h2>
          <div className="space-y-4 py-6 font-mono text-sm">
            <p className="leading-relaxed tracking-wide text-muted-foreground">
              I run Cherry Capital out of Beulah. I build websites for local
              businesses. If you hire me, you talk to me — not a sales chain.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild className="font-mono">
                <Link href="/">See the site</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="font-mono">
                <Link href="/#contact">Email me</Link>
              </Button>
            </div>
          </div>
        </section>

        <SectionSeparator className="full-line-bottom" />

        {relatedPosts.length > 0 && (
          <>
            <section className="relative border-x px-4 full-line-bottom">
              <h2 className="relative full-line-bottom text-3xl font-semibold">
                Related posts
              </h2>
              <div className="py-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group flex flex-col gap-2 border-b py-5 last:border-0"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-primary">
                      {related.category}
                    </span>
                    <h3 className="font-mono text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                      {related.title}
                    </h3>
                    <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                      {related.excerpt}
                    </p>
                    <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                      <time dateTime={related.publishedAt}>
                        {formatDate(related.publishedAt)}
                      </time>
                      <div className="size-1 rounded-full bg-border" />
                      <span>{related.readTime}</span>
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
              Got a project?
            </h2>
            <p className="mx-auto max-w-md font-mono text-sm text-muted-foreground">
              Site feels slow, outdated, or just wrong for your business? Send
              a note. I&apos;ll tell you straight if I can help.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild className="font-mono">
                <Link href="/#contact">Email me</Link>
              </Button>
              <Button variant="outline" asChild className="font-mono">
                <Link href="/blog">Back to blog</Link>
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

export async function generateStaticParams() {
  return publishedBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = publishedBlogPosts.find((entry) => entry.slug === slug);

  if (!post) {
    return {
      title: "Post Not Found",
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
    };
  }

  const canonicalPath = `/blog/${post.slug}`;
  const publishedTime = post.publishedAt;
  const modifiedTime = post.updatedAt ?? post.publishedAt;
  const keywords = [
    ...post.tags,
    post.category,
    "Cherry Capital",
    "web development",
    "Northern Michigan",
  ];

  return {
    title: post.title,
    description: post.excerpt,
    keywords,
    authors: portfolioConfig.seo.authors,
    creator: siteName,
    publisher: siteName,
    category: post.category,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      locale: "en_US",
      url: canonicalPath,
      siteName,
      publishedTime,
      modifiedTime,
      authors: [portfolioConfig.name],
      tags: post.tags,
      section: post.category,
      images: [
        {
          ...defaultOgImage,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [defaultOgImage.url],
      creator: portfolioConfig.seo.twitterHandle,
      site: portfolioConfig.seo.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
