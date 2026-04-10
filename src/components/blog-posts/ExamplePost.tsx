import React from 'react';
import { BlogContent, BlogHeading, BlogParagraph, BlogList, BlogListItem } from '@/components/BlogContent';
import { Code } from '@/components/Code';

export function ExamplePost() {
  return (
    <BlogContent>
      <BlogParagraph>
        This is how easy it is to write blog posts now. No more parsing strings or weird content management.
      </BlogParagraph>

      <BlogHeading>Code Examples Are Simple</BlogHeading>
      
      <BlogParagraph>
        Just wrap your code in the Code component:
      </BlogParagraph>

      <Code language="typescript">
{`// My Next.js 15 config
import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    reactCompiler: true,
    after: true,
  },
};

export default config;`}
      </Code>

      <BlogHeading>Lists Are Clean Too</BlogHeading>

      <BlogParagraph>
        What I don't use and why:
      </BlogParagraph>

      <BlogList>
        <BlogListItem><strong>Redux</strong>: React's built-in state is fine for 90% of cases</BlogListItem>
        <BlogListItem><strong>Styled Components</strong>: Tailwind is faster and more maintainable</BlogListItem>
        <BlogListItem><strong>WordPress</strong>: Obviously. It's 2025, come on.</BlogListItem>
        <BlogListItem><strong>jQuery</strong>: This isn't 2015</BlogListItem>
      </BlogList>

      <BlogParagraph>
        Way cleaner than parsing strings, and you get full TypeScript support!
      </BlogParagraph>
    </BlogContent>
  );
} 