import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

const footerLinks = [
  { label: "About", href: "/#about" },
  { label: "Work", href: "/#projects" },
  { label: "Experience", href: "/#experience" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
  { label: "Blog", href: "/blog" },
];

function FooterSection() {
  return (
    <section
      className="relative h-fit border-x full-line-bottom p-4"
      aria-label="Site footer"
    >
      <div
        className={cn(
          "absolute top-0 left-0 flex h-full w-8 border-r border-edge",
          "before:absolute before:inset-0 before:-z-1",
          "before:bg-[repeating-linear-gradient(45deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]",
          "before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56"
        )}
      />
      <div
        className={cn(
          "absolute top-0 right-0 flex h-full w-8 border-l border-edge",
          "before:absolute before:inset-0 before:-z-1",
          "before:bg-[repeating-linear-gradient(45deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]",
          "before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56"
        )}
      />
      <div className="flex flex-col items-center gap-4">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-mono text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-center font-mono text-sm text-balance text-muted-foreground">
          Built by{" "}
          <a
            className="font-semibold underline"
            href="https://www.cherrycapitalweb.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cherry Capital
          </a>
          .
        </p>
      </div>
    </section>
  )
}

export default FooterSection
