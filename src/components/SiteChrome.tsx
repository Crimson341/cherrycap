import Link from "next/link";

import { portfolioConfig } from "@/lib/portfolioConfig";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Work", href: "/#work" },
  { label: "Security", href: "/security" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export function SiteChrome({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
          <Link href="/" className="font-semibold tracking-tight">
            {portfolioConfig.name}
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-4 text-sm sm:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main
        id="main"
        className={cn("mx-auto min-h-[calc(100dvh-4rem)] w-full max-w-6xl px-4 sm:px-6", className)}
      >
        {children}
      </main>
    </div>
  );
}
