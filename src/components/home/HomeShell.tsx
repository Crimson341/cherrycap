import Link from "next/link";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { HomePageAnimations } from "@/components/home/HomePageAnimations";

const nav = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Security", href: "/security" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export function HomeShell({
  children,
  ctaHref = "/#contact",
}: {
  children: React.ReactNode;
  ctaHref?: string;
}) {
  return (
    <HomePageAnimations>
      <div className="min-h-dvh bg-white font-sans text-black antialiased selection:bg-[#F4E44A] selection:text-black">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:shadow-lg"
        >
          Skip to content
        </a>

        <header
          data-gsap="nav"
          className="absolute inset-x-0 top-0 z-50 bg-transparent"
        >
          <div className="relative mx-auto flex h-[4.25rem] max-w-[1400px] items-center justify-end px-5 sm:px-10 lg:px-14">
            <nav
              className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-9 text-[0.9rem] text-black/75 md:flex"
              aria-label="Primary"
            >
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href={ctaHref}
              className="border border-black bg-white px-3.5 py-2 text-[0.85rem] font-medium shadow-[4px_4px_0_0_#000] transition-[transform,box-shadow] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_#000]"
            >
              Get in touch
            </Link>
          </div>
        </header>

        {/* Mobile-only brand + menu strip */}
        <div className="absolute left-5 top-5 z-50 md:hidden">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            {portfolioConfig.name}
          </Link>
        </div>

        <main id="main">{children}</main>
      </div>
    </HomePageAnimations>
  );
}
