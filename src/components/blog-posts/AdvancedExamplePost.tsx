import React from 'react';
import { 
  BlogContent, 
  BlogHeading, 
  BlogParagraph,
  Code,
  Callout,
  Comparison,
  Stats,
  BlockQuote,
  TechStack,
  CostBreakdown,
  ExtLink,
  PerformanceMetrics
} from '@/components';

export function AdvancedExamplePost() {
  return (
    <BlogContent>
      <BlogParagraph>
        Here&apos;s how to use all the advanced blog components to make your content way more engaging and professional.
      </BlogParagraph>

      <BlogHeading>Callout Boxes for Important Info</BlogHeading>
      
      <Callout type="warning" title="WordPress Alert">
        WordPress sites are getting hacked every 39 seconds. That&apos;s not a typo - it&apos;s a security nightmare.
      </Callout>

      <Callout type="success" title="Performance Win">
        Next.js 15 with Turbopack reduces build times by 76%. That&apos;s 30 seconds instead of 2 minutes.
      </Callout>

      <Callout type="tip" title="Pro Tip">
        Use the `after()` API in Next.js 15 to run analytics after the response is sent. Your users get faster pages.
      </Callout>

      <BlogHeading>Before/After Comparisons</BlogHeading>
      
      <Comparison
        before={{
          title: "WordPress Development",
          items: [
            "15+ second page loads",
            "Weekly security updates",
            "Plugin conflicts breaking sites",
            "$200+/month hosting costs",
            "Constant maintenance required"
          ]
        }}
        after={{
          title: "Next.js Development",
          items: [
            "Sub-2 second page loads",
            "Zero security vulnerabilities",
            "No plugin dependencies",
            "$20/month hosting costs",
            "Zero maintenance required"
          ]
        }}
      />

      <BlogHeading>Performance Stats That Matter</BlogHeading>
      
      <Stats
        stats={[
          { label: "Build Speed", value: "76%", change: "+96% faster updates", positive: true },
          { label: "PageSpeed Score", value: "94", change: "vs 32 WordPress", positive: true },
          { label: "Load Time", value: "1.8s", change: "vs 15s WordPress", positive: true },
          { label: "Monthly Cost", value: "$20", change: "vs $200+ WP", positive: true }
        ]}
      />

      <BlogHeading>Client Testimonials</BlogHeading>
      
      <BlockQuote
        quote="Cherry Capital rebuilt our WordPress disaster into a Next.js masterpiece. Our site went from 15-second load times to under 2 seconds. Sales increased 40% in the first month."
        author="Sarah Johnson"
        role="Owner"
        company="Lynn & Perin Mercantile"
      />

      <BlogHeading>My Complete Tech Stack</BlogHeading>
      
      <TechStack
        categories={[
          {
            name: "Frontend Framework",
            tools: [
              {
                name: "Next.js 15",
                description: "React framework with server-side rendering and static generation",
                reason: "Best developer experience and performance"
              },
              {
                name: "TypeScript",
                description: "Static type checking for JavaScript",
                reason: "Catches bugs before clients do"
              }
            ]
          },
          {
            name: "Styling & UI",
            tools: [
              {
                name: "Tailwind CSS v4",
                description: "Utility-first CSS framework",
                reason: "CSS-first config, no JavaScript bloat"
              },
              {
                name: "Lucide React",
                description: "Beautiful & consistent icon library",
                reason: "Tree-shakeable, 1000+ icons"
              }
            ]
          }
        ]}
      />

      <BlogHeading>Real Cost Breakdown</BlogHeading>
      
      <CostBreakdown
        title="Annual Hosting & Maintenance Costs"
        items={[
          { item: "Hosting", wordpress: "$600-2400", nextjs: "$240" },
          { item: "Security", wordpress: "$300-600", nextjs: "$0" },
          { item: "Backups", wordpress: "$120-300", nextjs: "$0" },
          { item: "Maintenance", wordpress: "$2400-12000", nextjs: "$0" },
          { item: "Performance", wordpress: "$500-1200", nextjs: "$0" }
        ]}
        total={{
          wordpress: "$3,920 - $16,500",
          nextjs: "$240"
        }}
      />

      <BlogHeading>Performance Improvements</BlogHeading>
      
      <PerformanceMetrics
        metrics={[
          {
            label: "Page Load Time",
            before: "15.2",
            after: "1.8",
            unit: "s",
            improvement: "744% faster"
          },
          {
            label: "Time to Interactive",
            before: "12.4",
            after: "2.1",
            unit: "s",
            improvement: "490% faster"
          },
          {
            label: "PageSpeed Score",
            before: "32",
            after: "94",
            unit: "/100",
            improvement: "+62 points"
          }
        ]}
      />

      <BlogHeading>External Resources</BlogHeading>
      
      <BlogParagraph>
        Check out <ExtLink href="https://nextjs.org/docs">Next.js 15 documentation</ExtLink> for the latest features.
        The <ExtLink href="https://turbo.build">Turbopack documentation</ExtLink> explains why builds are so much faster.
      </BlogParagraph>

      <BlogHeading>Code Example with Syntax Highlighting</BlogHeading>
      
      <Code language="typescript">
{`// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Failed to send')
      
      toast.success('Message sent!')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}`}
      </Code>

      <Callout type="info" title="Component Benefits">
        These components make your blog posts way more engaging and professional. Each one is reusable, 
        TypeScript-safe, and follows your design system automatically.
      </Callout>
    </BlogContent>
  );
} 
