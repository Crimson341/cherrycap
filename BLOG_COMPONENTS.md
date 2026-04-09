# Blog Components System

Making blog posts easy as hell to write with React components instead of string parsing bullshit.

## Overview

Instead of fighting with markdown parsers and string manipulation, write your blog posts as clean React components with full TypeScript support.

## Components

### `<Code>`
Syntax highlighted code blocks with dark theme.

```tsx
import { Code } from '@/components';

<Code language="typescript">
  {`const example = "clean code";`}
</Code>
```

**Props:**
- `language?: string` - Programming language (default: 'javascript')
- `showLineNumbers?: boolean` - Show line numbers (default: false)
- `children: string` - The code content

### `<BlogContent>`
Wrapper component with proper prose styling.

```tsx
import { BlogContent } from '@/components';

<BlogContent>
  {/* Your blog content goes here */}
</BlogContent>
```

### `<BlogHeading>`
Section headings with consistent styling.

```tsx
<BlogHeading>My Section Title</BlogHeading>
```

### `<BlogParagraph>`
Regular text paragraphs.

```tsx
<BlogParagraph>
  This is a paragraph with proper spacing and typography.
</BlogParagraph>
```

### `<BlogList>` & `<BlogListItem>`
Bullet point lists.

```tsx
<BlogList>
  <BlogListItem>First item</BlogListItem>
  <BlogListItem>Second item</BlogListItem>
</BlogList>
```

### `<BlogOrderedList>` & `<BlogOrderedListItem>`
Numbered lists.

```tsx
<BlogOrderedList>
  <BlogOrderedListItem>Step 1</BlogOrderedListItem>
  <BlogOrderedListItem>Step 2</BlogOrderedListItem>
</BlogOrderedList>
```

## Writing a New Blog Post

### The Old Way (Don't Do This)
```typescript
// Annoying string parsing
content: `**My Heading**

This is a paragraph.

\`\`\`typescript
const code = "messy";
\`\`\`

- List item 1
- List item 2`
```

### The New Way (Clean AF)
```tsx
import { BlogContent, BlogHeading, BlogParagraph, BlogList, BlogListItem, Code } from '@/components';

export function MyNewPost() {
  return (
    <BlogContent>
      <BlogHeading>My Heading</BlogHeading>
      
      <BlogParagraph>
        This is a paragraph.
      </BlogParagraph>

      <Code language="typescript">
        {`const code = "clean as hell";`}
      </Code>

      <BlogList>
        <BlogListItem>List item 1</BlogListItem>
        <BlogListItem>List item 2</BlogListItem>
      </BlogList>
    </BlogContent>
  );
}
```

## Example Post

Check out `src/components/blog-posts/ExamplePost.tsx` for a complete example.

## Benefits

- ✅ **TypeScript support** - No more typos or broken content
- ✅ **Syntax highlighting** - Just wrap code in `<Code language="typescript">`
- ✅ **Consistent styling** - All components match your design system
- ✅ **Easy to maintain** - Change the styling once, updates everywhere
- ✅ **No more string parsing** - Write actual React components
- ✅ **Full IDE support** - Auto-completion, error checking, refactoring

## Supported Languages

The `<Code>` component supports all languages that Prism.js supports:

- `typescript` / `tsx`
- `javascript` / `jsx`
- `css`
- `bash` / `shell`
- `json`
- `html`
- `python`
- `sql`
- And many more...

## Quick Import

```tsx
// Import everything you need
import { 
  BlogContent, 
  BlogHeading, 
  BlogParagraph, 
  BlogList, 
  BlogListItem,
  BlogOrderedList,
  BlogOrderedListItem,
  Code 
} from '@/components';
```

## Tips

1. **Use template literals for multi-line code:**
   ```tsx
   <Code language="typescript">
     {`const config = {
       name: "value",
       other: "setting"
     };`}
   </Code>
   ```

2. **Keep it semantic:**
   - Use `BlogHeading` for section titles
   - Use `BlogParagraph` for regular text
   - Use `BlogList` for bullet points

3. **TypeScript will catch errors:**
   - Missing props
   - Wrong component structure
   - Typos in language names

## Advanced Components

### `<Callout>`
Colored callout boxes for important information.

```tsx
<Callout type="warning" title="Important">
  WordPress sites get hacked every 39 seconds.
</Callout>

<Callout type="success" title="Performance Win">
  Next.js builds are 76% faster with Turbopack.
</Callout>

<Callout type="tip" title="Pro Tip">
  Use the after() API for analytics.
</Callout>
```

**Types:** `warning`, `success`, `info`, `tip`

### `<Comparison>`
Side-by-side before/after comparisons.

```tsx
<Comparison
  before={{
    title: "WordPress",
    items: ["15s load times", "Security updates", "Plugin conflicts"]
  }}
  after={{
    title: "Next.js",
    items: ["2s load times", "Zero vulnerabilities", "No dependencies"]
  }}
/>
```

### `<Stats>`
Showcase key metrics and performance stats.

```tsx
<Stats
  stats={[
    { label: "Build Speed", value: "76%", change: "+96% faster", positive: true },
    { label: "PageSpeed Score", value: "94", change: "vs 32 WordPress", positive: true }
  ]}
/>
```

### `<BlockQuote>`
Client testimonials and quotes.

```tsx
<BlockQuote
  quote="Cherry Capital rebuilt our site and sales increased 40% in the first month."
  author="Sarah Johnson"
  role="Owner"
  company="Lynn & Perin Mercantile"
/>
```

### `<TechStack>`
Showcase your technology choices with explanations.

```tsx
<TechStack
  categories={[
    {
      name: "Frontend",
      tools: [
        {
          name: "Next.js 15",
          description: "React framework with SSR",
          reason: "Best performance and DX"
        }
      ]
    }
  ]}
/>
```

### `<CostBreakdown>`
Compare costs between solutions.

```tsx
<CostBreakdown
  title="Annual Costs"
  items={[
    { item: "Hosting", wordpress: "$600-2400", nextjs: "$240" },
    { item: "Security", wordpress: "$300-600", nextjs: "$0" }
  ]}
  total={{ wordpress: "$900-3000", nextjs: "$240" }}
/>
```

### `<PerformanceMetrics>`
Show before/after performance improvements.

```tsx
<PerformanceMetrics
  metrics={[
    {
      label: "Page Load Time",
      before: "15.2",
      after: "1.8",
      unit: "s",
      improvement: "744% faster"
    }
  ]}
/>
```

### `<ExtLink>`
External links with icons.

```tsx
<ExtLink href="https://nextjs.org">Next.js Docs</ExtLink>
```

## Complete Example

Check out `src/components/blog-posts/AdvancedExamplePost.tsx` to see all components in action.

Now stop fighting with string parsers and write some damn good content! 🔥 
