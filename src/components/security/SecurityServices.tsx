const services = [
  {
    title: "Malware cleanup",
    body: "Infected plugins, spam redirects, defaced pages, locked-out admin — I clean the site, remove the junk, and get you back online.",
  },
  {
    title: "Hardening",
    body: "Lock down logins, file permissions, XML-RPC, unused endpoints, and the usual WordPress soft spots attackers probe first.",
  },
  {
    title: "Updates that don’t break things",
    body: "Core, themes, and plugins stay current. I check for conflicts so an update doesn’t take the shop offline on a Saturday.",
  },
  {
    title: "Backups you can restore",
    body: "Automated off-site backups with a real restore path — not a plugin that only works until you need it.",
  },
  {
    title: "Login & bot protection",
    body: "Brute-force blocks, 2FA guidance, rate limiting, and firewall rules so bots stop guessing passwords all night.",
  },
  {
    title: "Ongoing monitoring",
    body: "Uptime checks, change alerts, and a standing plan so small issues get fixed before they become a rebuild.",
  },
];

export function SecurityServices() {
  return (
    <section
      id="services"
      data-gsap="section"
      className="border-b border-black/10 bg-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 md:py-28">
        <div className="mb-14 max-w-2xl">
          <p
            data-gsap="section-heading"
            className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-black/40"
          >
            Services
          </p>
          <h2
            data-gsap="section-heading"
            className="mb-5 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Security work that matches
            <br className="hidden sm:block" /> how WordPress actually fails.
          </h2>
          <p
            data-gsap="reveal"
            className="max-w-xl text-base leading-relaxed text-black/60"
          >
            Most hacks aren&apos;t Hollywood. They&apos;re old plugins, weak
            passwords, and sites nobody has logged into in a year. I fix the
            breach and tighten the setup so it doesn&apos;t bounce right back.
          </p>
        </div>

        <div className="grid gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.title}
              data-gsap="card"
              className="flex flex-col bg-white p-7 transition-colors hover:bg-[#fafafa]"
            >
              <span className="mb-6 font-mono text-xs text-black/30">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-3 text-lg font-semibold tracking-tight">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-black/60">
                {service.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
