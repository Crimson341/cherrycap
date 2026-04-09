import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { Calendar, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlickeringGrid } from "@/components/ui/FlickingGridBG";
import { BlogStructuredData } from "@/components/BlogStructuredData";
import { NextjsSpecialPost } from "@/components";
import { publishedBlogPosts } from "@/lib/blogPosts";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { defaultOgImage } from "@/lib/seo";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = publishedBlogPosts.find((entry) => entry.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <BlogStructuredData post={post} />
      <div className="min-h-screen bg-background">
        <main className="h-dvh max-w-full overflow-x-hidden sm:overflow-x-visible relative w-full mx-auto md:max-w-3xl pt-12 px-2 md:px-0">
        {/* Header Section */}
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
            <div className="relative z-10 px-8">
              <div className="text-center space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  {post.featured && (
                    <Badge variant="default" className="text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl font-bold font-mono leading-tight">
                  {post.title}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-mono leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-mono">
                  <Calendar className="size-4" />
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </time>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <section className="px-4 border-x full-line-bottom relative">
          <div className="py-4 flex items-center justify-between">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono">
              <ArrowLeft className="size-4" />
              Back to Blog
            </Link>
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="border-x full-line-bottom relative">
          <div className="px-4 py-8 max-w-4xl mx-auto">
            {post.slug === 'what-makes-nextjs-special' ? (
              <NextjsSpecialPost />
            ) : (
              <div className="prose prose-lg max-w-none font-mono leading-relaxed">
                <p className="mb-6 tracking-wide text-foreground leading-relaxed">
                  {post.content}
                </p>
              </div>
            )}
          </div>
        </article>

        {/* Author Bio Section */}
        <section className="border-x full-line-bottom relative px-4">
          <div className="py-8 max-w-4xl mx-auto">
            <div className="bg-muted/30 rounded-lg p-6 border">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 font-mono">About the Author</h3>
                  <p className="text-muted-foreground font-mono text-sm leading-relaxed mb-4">
                    Cherry Capital is a modern web development studio serving local businesses in Northern Michigan. 
                    With expertise in Next.js, React, and local SEO, the studio helps businesses outperform their 
                    WordPress-using competitors through faster, more secure custom websites.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/" className="flex items-center gap-1">
                        View Portfolio
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/#contact" className="flex items-center gap-1">
                        Get in Touch
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts CTA */}
        <section className="border-x full-line-bottom relative px-4">
          <div className="py-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold font-mono">
              More Web Development Insights
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto font-mono text-sm">
              Check out more articles about modern web development and growing your local business online.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/blog">
                  Read More Posts
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/#contact">
                  Let&apos;s Work Together
                </Link>
              </Button>
            </div>
          </div>
        </section>
        </main>
      </div>
    </>
  );
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  return publishedBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each blog post
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
      },
    };
  }

  const canonicalPath = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [...post.tags, "Cherry Capital", "web development"],
    authors: portfolioConfig.seo.authors,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: canonicalPath,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [portfolioConfig.name],
      tags: post.tags,
      section: post.category,
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [defaultOgImage.url],
    },
  };
}
