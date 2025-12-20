"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Footer } from "@/components/blocks/footer-section";
import { BlogInteractions } from "@/components/ui/blog-interactions";

const postData = {
  title: "Welcome to CherryCap",
  slug: "/blog/welcome",
  description:
    "We're thrilled to have you here! CherryCap is your all-in-one platform for website analytics, SEO insights, and growth tools.",
  image:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop",
  createdAt: "December 18, 2025",
  author: "CherryCap Team",
  readTime: "2 min read",
  category: "releases",
};

export default function WelcomeBlogPost() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-4xl flex h-16 items-center justify-between px-4">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <Link href="/" className="font-bold text-xl tracking-tight">
            Cherry<span className="text-rose-500">Cap</span>
          </Link>

          <div className="w-[100px]" />
        </div>
      </header>

      <main className="relative">
        {/* Hero Image */}
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
          <img
            src={postData.image}
            alt={postData.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Content */}
        <article className="mx-auto max-w-3xl px-4 -mt-20 relative z-20">
          {/* Category Badge */}
          <span className="inline-block px-3 py-1 text-sm font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full mb-4">
            New Release
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            {postData.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{postData.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{postData.createdAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{postData.readTime}</span>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead text-xl text-muted-foreground mb-8">
              Welcome to CherryCap! We're excited to have you join our community 
              of creators, entrepreneurs, and businesses who are serious about 
              understanding and growing their online presence.
            </p>

            <h2>What is CherryCap?</h2>
            <p>
              CherryCap is your all-in-one platform for website analytics, SEO 
              insights, and growth tools. We built it because we believe everyone 
              deserves access to powerful, easy-to-understand analytics without 
              the complexity of traditional tools.
            </p>

            <h2>What You Can Do</h2>
            <p>
              Here's a quick overview of what's waiting for you:
            </p>
            <ul>
              <li><strong>Real-time Analytics</strong> — See who's visiting your site right now, where they're coming from, and what they're doing.</li>
              <li><strong>SEO & Growth Tools</strong> — Get actionable insights to improve your search rankings and grow your audience.</li>
              <li><strong>AI Assistant</strong> — Chat with our AI to get personalized recommendations and answers to your questions.</li>
              <li><strong>Newsletter</strong> — Stay updated with the latest tips, strategies, and platform updates.</li>
            </ul>

            <h2>Getting Started</h2>
            <p>
              Ready to dive in? Here's how to get started:
            </p>
            <ol>
              <li>Head to your <Link href="/dashboard" className="text-rose-500 hover:text-rose-400">Dashboard</Link> to set up your profile</li>
              <li>Try our <Link href="/chat" className="text-rose-500 hover:text-rose-400">AI Assistant</Link> for personalized help</li>
            </ol>

            <h2>We're Here to Help</h2>
            <p>
              Have questions? Need help? We're always here for you. Reach out 
              anytime and we'll get back to you as soon as possible.
            </p>
            <p>
              Thank you for choosing CherryCap. Let's build something amazing together.
            </p>

            <div className="mt-12 p-6 bg-muted rounded-xl">
              <p className="font-semibold mb-2">Ready to explore?</p>
              <p className="text-muted-foreground mb-4">
                Head to your dashboard to get started with CherryCap.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-6 py-3 text-sm font-medium text-white hover:bg-rose-600 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Interactions */}
          <div className="mt-12">
            <BlogInteractions postSlug={postData.slug} postTitle={postData.title} />
          </div>
        </article>
      </main>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
