import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { siteConfig } from '@/lib/seo-config'
import { JsonLd } from '@/components/seo/json-ld'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

type Props = {
  params: Promise<{ slug: string }>
}

// Generate static params for pre-rendering
export async function generateStaticParams() {
  try {
    const posts = await convex.query(api.blogPosts.listPublished)
    return posts
      .filter((post) => post.slug)
      .map((post) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  try {
    const post = await convex.query(api.blogPosts.getBySlug, { slug })

    if (!post) {
      return {
        title: 'Post Not Found',
      }
    }

    const description = post.metaDescription || `Read ${post.title} on the Cherry Capital Web blog.`
    const ogImage = `${siteConfig.url}/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(description)}&type=blog`

    return {
      title: post.title,
      description,
      keywords: post.targetKeyword ? [post.targetKeyword] : undefined,
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
        url: `${siteConfig.url}/blog/${slug}`,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical: `${siteConfig.url}/blog/${slug}`,
      },
    }
  } catch {
    return {
      title: 'Post Not Found',
    }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  let post
  try {
    post = await convex.query(api.blogPosts.getBySlug, { slug })
  } catch {
    notFound()
  }

  if (!post) {
    notFound()
  }

  return (
    <>
      <JsonLd
        type="BlogPosting"
        data={{
          headline: post.title,
          description: post.metaDescription,
          datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
          dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
          author: {
            '@type': 'Organization',
            name: 'Cherry Capital Web',
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteConfig.url}/blog/${slug}`,
          },
        }}
      />
      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {post.publishedAt && (
          <p className="text-muted-foreground mb-8">
            Published {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  )
}
