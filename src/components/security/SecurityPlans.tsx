import Link from "next/link";

const plans = [
  {
    name: "Cleanup",
    tag: "One-time",
    description:
      "Site already compromised? Get cleaned, hardened, and back online.",
    points: [
      "Full malware scan & removal",
      "Core / theme / plugin updates",
      "Security hardening pass",
      "Post-clean verification",
    ],
    cta: "Request cleanup",
    featured: false,
  },
  {
    name: "Care plan",
    tag: "Monthly",
    description:
      "Stay patched, backed up, and watched — without learning WordPress.",
    points: [
      "Monthly updates & health checks",
      "Off-site backups",
      "Uptime & change monitoring",
      "Priority response if something breaks",
    ],
    cta: "Ask about care",
    featured: true,
  },
  {
    name: "Audit",
    tag: "One-time",
    description:
      "Not hacked yet, but uneasy. Get a clear report and a fix list.",
    points: [
      "Configuration & plugin review",
      "User & permission check",
      "Backup & hosting notes",
      "Prioritized action plan",
    ],
    cta: "Book an audit",
    featured: false,
  },
];

export function SecurityPlans() {
  return (
    <section
      id="plans"
      data-gsap="section"
      className="border-b border-black/10 bg-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 md:py-28">
        <div className="mb-14 max-w-xl">
          <p
            data-gsap="section-heading"
            className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-black/40"
          >
            Engagements
          </p>
          <h2
            data-gsap="section-heading"
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Pick how hands-on you want me.
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              data-gsap="card"
              className={
                plan.featured
                  ? "flex flex-col border-2 border-black bg-black p-7 text-white shadow-[6px_6px_0_0_#F4E44A]"
                  : "flex flex-col border border-black/15 bg-white p-7"
              }
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold tracking-tight">
                  {plan.name}
                </h3>
                <span
                  className={
                    plan.featured
                      ? "border border-white/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70"
                      : "border border-black/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-black/45"
                  }
                >
                  {plan.tag}
                </span>
              </div>
              <p
                className={
                  plan.featured
                    ? "mb-8 text-sm leading-relaxed text-white/65"
                    : "mb-8 text-sm leading-relaxed text-black/60"
                }
              >
                {plan.description}
              </p>
              <ul className="mb-10 flex-1 space-y-3">
                {plan.points.map((point) => (
                  <li
                    key={point}
                    className={
                      plan.featured
                        ? "flex gap-3 text-sm text-white/80"
                        : "flex gap-3 text-sm text-black/70"
                    }
                  >
                    <span
                      className={
                        plan.featured
                          ? "mt-1.5 size-1.5 shrink-0 bg-[#F4E44A]"
                          : "mt-1.5 size-1.5 shrink-0 bg-black"
                      }
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="#contact"
                className={
                  plan.featured
                    ? "inline-flex h-11 items-center justify-center bg-white text-sm font-medium text-black transition-opacity hover:opacity-90"
                    : "inline-flex h-11 items-center justify-center border border-black bg-white text-sm font-medium shadow-[4px_4px_0_0_#000] transition-[transform,box-shadow] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_#000]"
                }
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>

        <p
          data-gsap="reveal"
          className="mt-8 max-w-2xl text-sm leading-relaxed text-black/50"
        >
          Pricing depends on how messy the site is and whether you want ongoing
          care. Send the URL and a short note — I&apos;ll tell you what makes
          sense before any work starts.
        </p>
      </div>
    </section>
  );
}
