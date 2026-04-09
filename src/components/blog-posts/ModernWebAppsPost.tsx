import React from 'react';
import { BlogContent, BlogHeading, BlogParagraph, BlogList, BlogListItem } from '@/components/BlogContent';
import { Code } from '@/components/Code';

export function ModernWebAppsPost() {
  return (
    <BlogContent>
      <BlogParagraph>
        Most "how I code" articles are just recycled tutorial content. This isn't that. This is my actual workflow after building dozens of production apps for real businesses - the good, the bad, and the stuff nobody talks about.
      </BlogParagraph>

      <BlogHeading>My Development Stack (The Tools That Actually Matter)</BlogHeading>
      
      <BlogParagraph>
        Let's start with what I'm actually using every day. No fluff, no trendy frameworks that'll be dead in 6 months - just the tools that actually help me ship fast, reliable websites for real businesses.
      </BlogParagraph>

      <BlogHeading>Next.js 15: The Foundation That Doesn't Suck</BlogHeading>
      
      <BlogParagraph>
        Here's my exact config file - this is what powers every client site:
      </BlogParagraph>

      <Code language="typescript">
{`// next.config.ts - The config that actually works
import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    // Turbopack - 76% faster builds, 96% faster updates
    // This alone saves me hours every week
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // React 19 features that are actually useful
    reactCompiler: true, // Automatic optimizations
    after: true, // Run code after response (analytics, emails)
    
    // PPR - Partial Prerendering for instant page loads
    ppr: 'incremental',
    
    // Server Actions for forms without API routes
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000', 'cherrycapitalweb.com'],
    },
  },
  
  // Image optimization that actually works
  images: {
    formats: ['image/webp', 'image/avif'], // Modern formats first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Real device breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icons and thumbnails
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache for 30 days
    dangerouslyAllowSVG: false, // Security first
  },
  
  // Bundle optimization for faster loads
  experimental: {
    optimizePackageImports: [
      'lucide-react', // Tree shake icons
      'date-fns', // Only import what you use
      'lodash-es', // ES modules for better bundling
    ],
  },
  
  // Redirect trailing slashes for SEO
  trailingSlash: false,
  
  // Compression for smaller bundles
  compress: true,
  
  // PoweredByHeader adds nothing but attack surface
  poweredByHeader: false,
  
  // Only generate what you need
  output: 'standalone',
};

export default config;`}
      </Code>

      <BlogHeading>Why Next.js 15 Over Everything Else</BlogHeading>
      
      <BlogParagraph>
        I've tried them all - Gatsby, Nuxt, SvelteKit, even went back to vanilla React. Here's why Next.js 15 is the only framework I trust for client work:
      </BlogParagraph>

      <BlogParagraph>
        <strong>Performance That Actually Matters</strong>
      </BlogParagraph>
      <BlogList>
        <BlogListItem>Turbopack builds are 76% faster than Webpack. That's 30 seconds vs 2 minutes for hot reloads</BlogListItem>
        <BlogListItem>PPR (Partial Prerendering) gives you static speed with dynamic data</BlogListItem>
        <BlogListItem>Automatic image optimization without plugins or configuration hell</BlogListItem>
        <BlogListItem>Bundle splitting that just works - no manual route chunks</BlogListItem>
      </BlogList>

      <BlogParagraph>
        <strong>Developer Experience That Doesn't Fight You</strong>
      </BlogParagraph>
      <BlogList>
        <BlogListItem>TypeScript support out of the box, no config needed</BlogListItem>
        <BlogListItem>File-based routing that makes sense</BlogListItem>
        <BlogListItem>Server Actions eliminate 90% of API routes</BlogListItem>
        <BlogListItem>Built-in CSS support for Tailwind, Sass, whatever</BlogListItem>
      </BlogList>

      <BlogParagraph>
        <strong>Production Ready Without Babysitting</strong>
      </BlogParagraph>
      <BlogList>
        <BlogListItem>Zero-config deployment to Vercel</BlogListItem>
        <BlogListItem>Edge runtime for global performance</BlogListItem>
        <BlogListItem>Built-in analytics and error reporting</BlogListItem>
        <BlogListItem>Automatic security headers</BlogListItem>
      </BlogList>

      <BlogParagraph>
        <strong>Real Business Benefits</strong>
      </BlogParagraph>
      <BlogParagraph>
        When Lynn & Perin Mercantile switched from their WordPress site to my Next.js build:
      </BlogParagraph>
      <BlogList>
        <BlogListItem>Page load times: 15 seconds → 1.8 seconds</BlogListItem>
        <BlogListItem>Mobile PageSpeed score: 32 → 94</BlogListItem>
        <BlogListItem>Monthly maintenance: 4 hours → 0 hours</BlogListItem>
        <BlogListItem>Security updates: Weekly nightmare → Never</BlogListItem>
      </BlogList>

      <BlogHeading>What I Don't Use (And Why You Shouldn't Either)</BlogHeading>
      
      <BlogList>
        <BlogListItem><strong>Gatsby</strong>: Dead project walking. GraphQL for static sites is overengineering.</BlogListItem>
        <BlogListItem><strong>Create React App</strong>: Abandoned by Meta. Use Vite if you must go vanilla React.</BlogListItem>
        <BlogListItem><strong>Remix</strong>: Good ideas, but Next.js already solved these problems better.</BlogListItem>
        <BlogListItem><strong>SvelteKit</strong>: Great DX, but ecosystem too small for client work.</BlogListItem>
        <BlogListItem><strong>WordPress</strong>: It's 2025. Stop.</BlogListItem>
      </BlogList>

      <BlogHeading>The Stack Around Next.js</BlogHeading>
      
      <BlogParagraph>
        This is what I pair with Next.js for maximum velocity:
      </BlogParagraph>

      <Code language="typescript">
{`// package.json dependencies that matter
{
  "dependencies": {
    "next": "16.2.3", // The foundation
    "react": "19.2.5", // Latest stable
    "typescript": "^5.0.0", // Type safety
    "tailwindcss": "^4.0.0", // CSS that doesn't suck
    "convex": "^1.0.0", // Real-time database
    "zod": "^3.22.0", // Runtime type checking
    "react-hook-form": "^7.45.0", // Forms that work
    "sonner": "^1.0.0", // Toast notifications
    "lucide-react": "^0.300.0" // Icons that load fast
  }
}`}
      </Code>

      <BlogParagraph>
        <strong>Why These Choices</strong>
      </BlogParagraph>
      <BlogList>
        <BlogListItem><strong>TypeScript</strong>: Catches bugs before clients do. Non-negotiable.</BlogListItem>
        <BlogListItem><strong>Tailwind v4</strong>: CSS-first config, no more JavaScript bloat.</BlogListItem>
        <BlogListItem><strong>Convex</strong>: Real-time without WebSocket hell. Built-in auth, file storage.</BlogListItem>
        <BlogListItem><strong>Zod</strong>: Validate data at runtime, not just compile time.</BlogListItem>
        <BlogListItem><strong>React Hook Form</strong>: Forms with validation that don't re-render everything.</BlogListItem>
        <BlogListItem><strong>Sonner</strong>: Toast notifications that don't break accessibility.</BlogListItem>
        <BlogListItem><strong>Lucide</strong>: 1000+ icons, tree-shakeable, consistent design.</BlogListItem>
      </BlogList>

      <BlogHeading>Development Environment That Works</BlogHeading>

      <Code language="bash">
{`# My actual development setup
pnpm create next-app@latest project-name --typescript --tailwind --app
cd project-name

# Install the essentials
pnpm add convex zod react-hook-form sonner lucide-react
pnpm add -D @types/node

# Start with Turbopack
pnpm dev --turbo`}
      </Code>

      <BlogHeading>Project Structure That Scales</BlogHeading>
      
      <BlogParagraph>
        Every project starts with this structure. It's not fancy, but it works:
      </BlogParagraph>

      <Code language="bash">
{`src/
├── app/                 # Next.js 15 app router
│   ├── (auth)/         # Route groups for organization  
│   ├── (marketing)/    # Landing pages
│   └── globals.css     # Global styles
├── components/
│   ├── ui/            # Reusable UI components
│   ├── features/      # Feature-specific components
│   └── layout/        # Headers, footers, etc.
├── lib/
│   ├── utils.ts       # Helper functions
│   ├── db.ts          # Database client
│   └── constants.ts   # App configuration
└── types/             # TypeScript definitions`}
      </Code>

      <BlogHeading>Component Architecture That Doesn't Suck</BlogHeading>
      
      <BlogParagraph>
        Here's how I structure components for maintainability:
      </BlogParagraph>

      <Code language="tsx">
{`// components/features/ContactForm.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ContactFormProps {
  businessName?: string
  onSuccess?: () => void
}

export function ContactForm({ businessName, onSuccess }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Failed to send message')
      
      toast.success('Message sent! I\\'ll get back to you soon.')
      onSuccess?.()
    } catch (error) {
      toast.error('Something went wrong. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        name="name"
        placeholder="Your name"
        required
        className="bg-background/50"
      />
      <Input
        name="email"
        type="email"
        placeholder="Your email"
        required
        className="bg-background/50"
      />
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  )
}`}
      </Code>

      <BlogParagraph>
        Clean, typed, and handles errors properly. No magic, just code that works.
      </BlogParagraph>

      <BlogHeading>The Result: Websites That Actually Work</BlogHeading>
      
      <BlogParagraph>
        Every site I build with this stack:
      </BlogParagraph>
      <BlogList>
        <BlogListItem>Loads in under 2 seconds on mobile</BlogListItem>
        <BlogListItem>Scores 90+ on PageSpeed Insights</BlogListItem>
        <BlogListItem>Requires zero maintenance</BlogListItem>
        <BlogListItem>Scales to millions of users</BlogListItem>
        <BlogListItem>Costs $20/month to host</BlogListItem>
      </BlogList>

      <BlogParagraph>
        Compare that to WordPress sites that:
      </BlogParagraph>
      <BlogList>
        <BlogListItem>Take 15+ seconds to load</BlogListItem>
        <BlogListItem>Need constant security updates</BlogListItem>
        <BlogListItem>Break with plugin conflicts</BlogListItem>
        <BlogListItem>Cost $200+/month in hosting and maintenance</BlogListItem>
        <BlogListItem>Get hacked monthly</BlogListItem>
      </BlogList>

      <BlogParagraph>
        The choice is obvious. Next.js 15 isn't just faster to develop with - it's better for your business and your users.
      </BlogParagraph>

      <BlogHeading>The Bottom Line</BlogHeading>
      
      <BlogParagraph>
        This isn't the only way to build websites, but it's the way that works for me and my clients. Fast, reliable, maintainable websites that help businesses grow.
      </BlogParagraph>

      <BlogParagraph>
        If you're still fighting with WordPress in 2025, you're making your life harder than it needs to be.
      </BlogParagraph>
    </BlogContent>
  );
} 
