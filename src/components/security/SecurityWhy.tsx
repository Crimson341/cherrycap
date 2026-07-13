import { YellowRingMark } from "@/components/ui/GeometricHeroArt";

const signals = [
  {
    title: "Site redirects to spam",
    body: "Visitors land on pharmacy ads or weird domains. Search rankings tank overnight.",
  },
  {
    title: "Google Safe Browsing warning",
    body: "Chrome shows the red “deceptive site” screen. Trust and traffic disappear until it’s clean.",
  },
  {
    title: "Admin locked or missing users",
    body: "You can’t log in, or there are mystery admin accounts. That’s often an active compromise.",
  },
  {
    title: "Slow, weird, or broken pages",
    body: "Injected scripts, SEO spam, and cryptominers hide in themes and uploads — not always obvious.",
  },
];

export function SecurityWhy() {
  return (
    <section
      id="why"
      data-gsap="section"
      className="border-b border-black/10 bg-white"
    >
      <div className="mx-auto grid max-w-6xl gap-16 px-4 py-20 sm:px-8 md:grid-cols-2 md:py-28">
        <div>
          <p
            data-gsap="section-heading"
            className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-black/40"
          >
            Why it matters
          </p>
          <h2
            data-gsap="section-heading"
            className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            WordPress runs a huge
            <br />
            chunk of the web.
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-black/65">
            <p data-gsap="reveal">
              That popularity is why it gets targeted. Outdated plugins, cheap
              hosting, and shared logins turn a fine local business site into an
              open door.
            </p>
            <p data-gsap="reveal">
              You don&apos;t need enterprise jargon. You need someone who will
              clean the mess, explain what happened in plain English, and leave
              the site harder to break the next time.
            </p>
            <p data-gsap="reveal">
              I work with Northern Michigan businesses that already have a
              WordPress site and want it protected — whether I built it or not.
            </p>
          </div>
          <div
            data-gsap="reveal"
            className="mt-10 flex items-center gap-4 border-t border-black/10 pt-8"
          >
            <YellowRingMark className="size-10" />
            <div className="text-sm">
              <p className="font-medium">Not just a plugin install</p>
              <p className="text-black/50">
                Audit, fix, harden, monitor — end to end.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p
            data-gsap="section-heading"
            className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-black/40"
          >
            Common warning signs
          </p>
          <ul className="divide-y divide-black/10 border-y border-black/10">
            {signals.map((item, index) => (
              <li
                key={item.title}
                data-gsap="reveal"
                className="flex gap-6 py-7"
              >
                <span className="font-mono text-sm text-black/30">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="mb-1.5 text-base font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-black/60">
                    {item.body}
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
