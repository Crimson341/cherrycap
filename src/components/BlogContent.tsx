import type { ReactNode } from "react";

interface BlogContentProps {
  children: ReactNode;
}

export function BlogContent({ children }: BlogContentProps) {
  return (
    <div className="prose prose-lg max-w-none font-mono leading-relaxed">
      {children}
    </div>
  );
}

// Helper components for blog content
export function BlogHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
      {children}
    </h2>
  );
}

export function BlogParagraph({ children }: { children: ReactNode }) {
  return (
    <p className="mb-6 tracking-wide text-foreground leading-relaxed">
      {children}
    </p>
  );
}

export function BlogList({ children }: { children: ReactNode }) {
  return (
    <ul className="space-y-2 mb-6">
      {children}
    </ul>
  );
}

export function BlogListItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-primary mt-2">•</span>
      <span>{children}</span>
    </li>
  );
}
