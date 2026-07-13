import Link from "next/link";
import {
  AccentBars,
  BlackGeometry,
  BlueGeometry,
  GlyphRow,
  RuleStack,
  YellowRingMark,
} from "@/components/ui/GeometricHeroArt";

export function HomeHero() {
  return (
    <section
      data-gsap="hero"
      className="relative min-h-[100svh] overflow-hidden bg-white"
    >
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1400px] flex-col px-5 pb-10 pt-6 sm:px-10 lg:px-14">
        <div
          data-gsap="hero-blue"
          className="pointer-events-none absolute left-[-6%] top-[6%] z-0 h-[min(52vh,480px)] w-[min(58vw,420px)] will-change-transform sm:left-[-2%] sm:top-[8%] md:left-0"
        >
          <BlueGeometry />
        </div>
        <div
          data-gsap="hero-black"
          className="pointer-events-none absolute bottom-[-2%] left-[-8%] z-0 h-[min(46vh,400px)] w-[min(62vw,460px)] will-change-transform sm:left-[-3%] md:left-0"
        >
          <BlackGeometry />
        </div>

        <div
          data-gsap="hero-content"
          className="relative z-10 flex flex-1 flex-col justify-center pl-0 pt-10 will-change-transform sm:pl-[20%] md:pl-[28%] lg:pl-[30%]"
        >
          <div className="max-w-[16ch] sm:max-w-none">
            <h1 className="font-sans text-[clamp(2.4rem,7.2vw,5.75rem)] font-bold leading-[0.95] tracking-[-0.035em] text-black">
              <span
                data-gsap="hero-line"
                className="inline-flex flex-wrap items-center gap-x-2 gap-y-1"
              >
                <span>Websites that</span>
                <span
                  data-gsap="hero-mark"
                  className="inline-flex translate-y-[-0.05em] will-change-transform"
                >
                  <YellowRingMark />
                </span>
              </span>

              <br />

              <span data-gsap="hero-line" className="relative mt-[0.08em] inline-block pr-2">
                <span className="relative z-[1]">actually work</span>
                <span
                  data-gsap="hero-underline"
                  className="absolute bottom-[0.08em] left-0 z-0 h-[0.14em] w-full origin-left bg-black"
                  aria-hidden="true"
                />
              </span>

              <br />

              <span
                data-gsap="hero-line"
                className="mt-[0.12em] inline-flex items-end gap-x-3"
              >
                <AccentBars className="mb-[0.12em]" />
                <span>for local business.</span>
              </span>
            </h1>
          </div>

          <div className="mt-14 grid max-w-3xl grid-cols-1 items-end gap-8 sm:mt-16 sm:grid-cols-[auto_1px_1fr] sm:gap-x-8 md:mt-20">
            <Link
              data-gsap="hero-cta"
              href="/#contact"
              className="inline-flex h-12 w-fit items-center justify-center bg-black px-7 text-[0.95rem] font-medium text-white transition-opacity hover:opacity-85"
            >
              Talk to me
            </Link>

            <div
              data-gsap="hero-cta"
              className="hidden h-14 w-px bg-black/20 sm:block"
              aria-hidden="true"
            />

            <div data-gsap="hero-cta" className="relative min-w-0">
              <div className="flex items-start justify-between gap-6">
                <p className="max-w-[22rem] text-[0.95rem] leading-relaxed text-black/55">
                  Fast custom sites for Northern Michigan. You work with me —
                  not a sales chain.
                </p>
                <RuleStack className="mt-1 hidden shrink-0 sm:flex" />
              </div>

              <div className="mt-6 h-px w-full bg-black/15" />

              <div className="mt-5 flex items-center justify-between gap-6">
                <GlyphRow />
                <a
                  href="#work"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-black/70 transition-colors hover:text-black"
                >
                  Explore
                  <span
                    className="inline-block transition-transform group-hover:translate-y-0.5"
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
