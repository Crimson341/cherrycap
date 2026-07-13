import Link from "next/link";
import { portfolioConfig } from "@/lib/portfolioConfig";
import { YellowRingMark } from "@/components/ui/GeometricHeroArt";

const services = [
  {
    title: "Custom websites",
    body: "Built from scratch for how you actually sell — not a template with your logo stuck on.",
  },
  {
    title: "Redesigns",
    body: "Slow, dated, or confusing? Strip it down and rebuild something people can use on a phone.",
  },
  {
    title: "Local SEO",
    body: "Technical setup and content so people near you can find you when they search.",
  },
  {
    title: "WordPress security",
    body: "Cleanup, hardening, updates, and monitoring for sites that already run on WordPress.",
    href: "/security",
  },
];

export function HomeAbout() {
  return (
    <section
      id="about"
      data-gsap="section"
      className="border-b border-black/10 bg-white"
    >
      <div className="mx-auto grid max-w-6xl gap-16 px-4 py-20 sm:px-8 md:grid-cols-2 md:py-28">
        <div>
          <p
            data-gsap="section-heading"
            className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-black/40"
          >
            About
          </p>
          <h2
            data-gsap="section-heading"
            className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            One person.
            <br />
            Beulah, Michigan.
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-black/65">
            <p data-gsap="reveal">
              I run Cherry Capital. Most people I work with are local owners who
              are tired of sites that feel old, load slow, or never say what the
              business actually does.
            </p>
            <p data-gsap="reveal">
              Process is simple: learn the business, clean up the message, build
              something fast on phones, hand it off so you&apos;re not stuck with
              me forever unless you want to be.
            </p>
            <p data-gsap="reveal">
              You talk to me the whole time. No sales guy, then a designer, then
              a developer who never met you.
            </p>
          </div>
          <div
            data-gsap="reveal"
            className="mt-10 flex items-center gap-4 border-t border-black/10 pt-8"
          >
            <YellowRingMark className="size-10" />
            <div className="text-sm">
              <p className="font-medium">{portfolioConfig.email}</p>
              <p className="text-black/50">{portfolioConfig.location}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <ul className="divide-y divide-black/10 border-y border-black/10">
            {services.map((service, index) => (
              <li
                key={service.title}
                data-gsap="reveal"
                className="flex gap-6 py-8"
              >
                <span className="font-mono text-sm text-black/30">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="mb-2 text-lg font-semibold tracking-tight">
                    {"href" in service && service.href ? (
                      <Link
                        href={service.href}
                        className="underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-black"
                      >
                        {service.title}
                      </Link>
                    ) : (
                      service.title
                    )}
                  </h3>
                  <p className="text-sm leading-relaxed text-black/60">
                    {service.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
