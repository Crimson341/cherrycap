import React from 'react';

interface BlogContentProps {
  children: React.ReactNode;
}

export function BlogContent({ children }: BlogContentProps) {
  return (
    <div className="prose prose-lg max-w-none font-mono leading-relaxed">
      {children}
    </div>
  );
}

// Helper components for blog content
export function BlogHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
      {children}
    </h2>
  );
}

export function BlogParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 tracking-wide text-foreground leading-relaxed">
      {children}
    </p>
  );
}

export function BlogList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-2 mb-6">
      {children}
    </ul>
  );
}

export function BlogListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-primary mt-2">•</span>
      <span>{children}</span>
    </li>
  );
}

export function BlogOrderedList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="space-y-2 mb-6 list-decimal list-inside">
      {children}
    </ol>
  );
}

export function BlogOrderedListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-foreground">
      {children}
    </li>
  );
} 