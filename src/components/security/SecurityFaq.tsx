"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Do you only secure sites you built?",
    answer:
      "No. If it’s WordPress and you can get me admin or hosting access, I can audit, clean, and harden it — even if someone else built it years ago.",
  },
  {
    question: "Can you fix a site that’s already hacked?",
    answer:
      "Yes. Cleanup is a core part of this service: remove malware, close the entry point, update what’s outdated, and verify the site is clean before we call it done.",
  },
  {
    question: "Is a security plugin enough?",
    answer:
      "Plugins help, but they don’t replace updates, strong logins, good backups, and sane hosting. I use the right tools — I don’t sell a single plugin as a silver bullet.",
  },
  {
    question: "Will this slow my site down?",
    answer:
      "Done right, hardening shouldn’t make the site crawl. I avoid stacking heavy suites that fight each other, and I watch performance when changes go live.",
  },
  {
    question: "What if I want to leave WordPress eventually?",
    answer:
      "That’s fine. I also build custom Next.js sites. Security work can stabilize what you have now while we plan a cleaner rebuild if that makes sense later.",
  },
];

export function SecurityFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-gsap="section"
      className="border-b border-black/10 bg-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 md:py-28">
        <div className="relative mb-12 max-w-md">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 top-7 h-3 w-28 bg-[#F5E642]/70 sm:top-8 sm:h-3.5 sm:w-36"
          />
          <p
            data-gsap="section-heading"
            className="relative mb-3 text-xs font-medium uppercase tracking-[0.2em] text-black/40"
          >
            FAQ
          </p>
          <h2
            data-gsap="section-heading"
            className="relative text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Straight answers
          </h2>
        </div>

        <div className="divide-y divide-black/10 border-y border-black/10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                data-gsap="reveal"
                className={cn(
                  "group/row relative py-1 transition-colors",
                  isOpen && "bg-[#fafafa]",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-[#F5E642] transition-transform duration-300 ease-out",
                    isOpen && "scale-y-100",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left outline-none transition-colors hover:text-black focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
                >
                  <span className="flex min-w-0 items-start gap-4">
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 font-mono text-xs tabular-nums transition-colors",
                        isOpen
                          ? "text-black"
                          : "text-black/30 group-hover/row:text-black/50",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base font-semibold tracking-tight">
                      {faq.question}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center border text-sm transition-colors",
                      isOpen
                        ? "border-black bg-black text-white"
                        : "border-black/20 text-black/50 group-hover/row:border-black group-hover/row:text-black",
                    )}
                    aria-hidden="true"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="max-w-2xl pb-6 pl-10 pr-12 text-sm leading-relaxed text-black/60 sm:pl-12">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
