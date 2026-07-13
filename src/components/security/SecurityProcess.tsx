const steps = [
  {
    title: "Quick audit",
    body: "I look at plugins, users, file changes, hosting setup, and backup health — then tell you what’s wrong without the scare tactics.",
  },
  {
    title: "Clean & harden",
    body: "Remove malware, close the hole, update what needs updating, and lock down the usual WordPress weak points.",
  },
  {
    title: "Verify & hand off",
    body: "Confirm the site is clean, restore trust signals if needed, document what changed, and set monitoring if you want ongoing cover.",
  },
];

export function SecurityProcess() {
  return (
    <section
      id="process"
      data-gsap="section"
      className="border-b border-black/10 bg-[#fafafa]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 md:py-28">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-lg">
            <p
              data-gsap="section-heading"
              className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-black/40"
            >
              Process
            </p>
            <h2
              data-gsap="section-heading"
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Three steps. No agency chain.
            </h2>
          </div>
          <p
            data-gsap="reveal"
            className="max-w-xs text-sm leading-relaxed text-black/55"
          >
            You work with me the whole time — from first scan to “you’re good
            again.”
          </p>
        </div>

        <ol className="grid gap-px bg-black/10 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              data-gsap="card"
              className="relative bg-white p-8"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center border border-black bg-black font-mono text-sm text-white">
                  {index + 1}
                </span>
                {index < steps.length - 1 && (
                  <span
                    className="hidden text-black/20 md:inline"
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </div>
              <h3 className="mb-3 text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-black/60">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
