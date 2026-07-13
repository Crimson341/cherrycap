import Link from "next/link";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { GlyphRow } from "@/components/ui/GeometricHeroArt";

const links = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Security", href: "/security" },
  { label: "FAQ", href: "/#faq" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export function HomeFooter() {
  return (
    <footer data-gsap="footer" className="bg-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-lg font-semibold tracking-tight">
            {portfolioConfig.name}
          </p>
          <p className="max-w-xs text-sm text-white/50">
            Custom websites for Northern Michigan businesses.
          </p>
          <div className="mt-6">
            <GlyphRow className="[&_span]:border-white [&_.bg-black]:bg-white [&_.bg-white]:bg-black" />
          </div>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-xs text-white/35 sm:px-8">
          <span>
            © {new Date().getFullYear()} {portfolioConfig.name}
          </span>
          <a
            href={`mailto:${portfolioConfig.email}`}
            className="hover:text-white/70"
          >
            {portfolioConfig.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
