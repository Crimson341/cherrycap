import React from 'react';

interface BlogContentProps {
  children: React.ReactNode;
}

export function BlogContent({ children }: BlogContentProps) {
  return (
    <div className="cc-article-prose prose prose-lg max-w-none">
      {children}
    </div>
  );
}

// Helper components for blog content
export function BlogHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2>
      {children}
    </h2>
  );
}

export function BlogParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p>
      {children}
    </p>
  );
}

export function BlogList({ children }: { children: React.ReactNode }) {
  return (
    <ul>
      {children}
    </ul>
  );
}

export function BlogListItem({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <span aria-hidden="true">•</span>
      <span>{children}</span>
    </li>
  );
}

export function BlogOrderedList({ children }: { children: React.ReactNode }) {
  return (
    <ol>
      {children}
    </ol>
  );
}

export function BlogOrderedListItem({ children }: { children: React.ReactNode }) {
  return (
    <li>
      {children}
    </li>
  );
}
