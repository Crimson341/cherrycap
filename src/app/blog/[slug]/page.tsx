import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { BlogStructuredData } from "@/components/BlogStructuredData";
import { BlogBrandFooter, BlogBrandHeader } from "@/components/blog/BlogBrandChrome";
import { NextjsSpecialPost, WelcomePost, WhyCherryCapitalPost } from "@/components";
import { publishedBlogPosts } from "@/lib/blogPosts";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { defaultOgImage } from "@/lib/seo";

interface BlogPostPageProps { params: Promise<{ slug: string }>; }

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = publishedBlogPosts.find((entry) => entry.slug === slug);
  if (!post) notFound();

  return (
    <div className="cc-page cc-article-page">
      <BlogStructuredData post={post} />
      <a className="cc-skip" href="#article-content">Skip to article</a>
      <BlogBrandHeader />

      <main id="article-content">
        <header className="cc-article-hero">
          <Link href="/blog" className="cc-article-back"><ArrowLeft size={16} /> All field notes</Link>
          <div className="cc-article-meta">
            <span>{post.category}</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span><Clock size={13} /> {post.readTime}</span>
          </div>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="cc-article-tags">
            {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </header>

        {post.heroImage ? (
          <figure className="cc-article-photo">
            <Image
              src={post.heroImage}
              alt={post.heroAlt ?? ""}
              width={1672}
              height={941}
              priority
              sizes="100vw"
            />
            <figcaption>
              <span>Cherry Capital · Field Notes</span>
              <span>{String(post.id + 1).padStart(2, "0")}</span>
            </figcaption>
          </figure>
        ) : (
          <section className="cc-article-art" aria-hidden="true">
            <div className="cc-article-art-orbit" />
            <span className="cc-article-art-label">Cherry Capital · Field Notes</span>
            <strong>Think.<br /><em>Make.</em><br />Refine.</strong>
            <span className="cc-article-art-number">{String(post.id + 1).padStart(2, "0")}</span>
            <div className="cc-article-art-cherry" />
          </section>
        )}

        <article className="cc-article-shell">
          <aside className="cc-article-aside">
            <span>Published</span>
            <strong>{formatDate(post.publishedAt)}</strong>
            <span>Reading time</span>
            <strong>{post.readTime}</strong>
            <span>Filed under</span>
            <strong>{post.category}</strong>
          </aside>
          <div className="cc-article-body">
            {post.slug === "welcome-to-the-cherry-capital-blog" ? (
              <WelcomePost />
            ) : post.slug === "what-makes-nextjs-special" ? (
              <NextjsSpecialPost />
            ) : post.slug === "why-choose-cherry-capital-web" ? (
              <WhyCherryCapitalPost />
            ) : (
              <div className="cc-article-prose"><p>{post.content}</p></div>
            )}
          </div>
        </article>

        <section className="cc-article-author">
          <div className="cc-author-monogram">SC</div>
          <div>
            <p className="cc-eyebrow">Written by the studio</p>
            <h2>Scott at Cherry Capital</h2>
            <p>
              Designer, developer, and founder of an independent Northern Michigan
              web studio helping good businesses show up better online.
            </p>
          </div>
          <Link href="/#contact">Work with the studio <ArrowRight size={18} /></Link>
        </section>

        <section className="cc-article-next">
          <p className="cc-eyebrow">Keep reading</p>
          <h2>More ideas from<br />the <em>field.</em></h2>
          <Link href="/blog">Browse all field notes <ArrowRight size={18} /></Link>
        </section>
      </main>

      <BlogBrandFooter />
    </div>
  );
}

export async function generateStaticParams() {
  return publishedBlogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = publishedBlogPosts.find((entry) => entry.slug === slug);
  if (!post) return { title: "Post Not Found", robots: { index: false, follow: false } };
  const canonicalPath = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    authors: portfolioConfig.seo.authors,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: post.title, description: post.excerpt, type: "article", url: canonicalPath,
      publishedTime: post.publishedAt, modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [portfolioConfig.name], tags: post.tags, section: post.category,
      images: post.heroImage ? [post.heroImage] : [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image", title: post.title, description: post.excerpt,
      images: [post.heroImage ?? defaultOgImage.url],
    },
  };
}
