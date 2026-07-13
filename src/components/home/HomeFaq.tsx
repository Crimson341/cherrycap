"use client";

import { useCallback, useRef, useState } from "react";
import { portfolioConfig } from "@/lib/portfolioConfig";
import {
  gsap,
  prefersReducedMotion,
  registerGsap,
  useGSAP,
} from "@/lib/gsap-client";
import { cn } from "@/lib/utils";

export function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const animateAnswer = useCallback((index: number, open: boolean) => {
    const answer = answerRefs.current[index];
    const icon = iconRefs.current[index];
    if (!answer) return;

    registerGsap();
    const reduced = prefersReducedMotion();
    const inner = answer.querySelector<HTMLElement>("[data-faq-answer-inner]");

    gsap.killTweensOf([answer, icon, inner].filter(Boolean));

    if (reduced) {
      gsap.set(answer, {
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
      });
      if (icon) gsap.set(icon, { rotate: open ? 45 : 0 });
      return;
    }

    if (open) {
      gsap.set(answer, { height: "auto", opacity: 1 });
      const targetHeight = answer.offsetHeight;
      gsap.fromTo(
        answer,
        { height: 0, opacity: 0 },
        {
          height: targetHeight,
          opacity: 1,
          duration: 0.45,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(answer, { height: "auto" });
          },
        },
      );
      if (inner) {
        gsap.fromTo(
          inner,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, delay: 0.06, ease: "power2.out" },
        );
      }
      if (icon) {
        gsap.to(icon, { rotate: 45, duration: 0.35, ease: "back.out(1.6)" });
      }
    } else {
      gsap.to(answer, {
        height: 0,
        opacity: 0,
        duration: 0.32,
        ease: "power2.inOut",
      });
      if (inner) {
        gsap.to(inner, { y: -6, opacity: 0, duration: 0.2, ease: "power1.in" });
      }
      if (icon) {
        gsap.to(icon, { rotate: 0, duration: 0.28, ease: "power2.out" });
      }
    }
  }, []);

  const toggle = useCallback(
    (index: number) => {
      if (openIndex === index) {
        animateAnswer(index, false);
        setOpenIndex(null);
        return;
      }
      if (openIndex !== null) {
        animateAnswer(openIndex, false);
      }
      animateAnswer(index, true);
      setOpenIndex(index);
    },
    [animateAnswer, openIndex],
  );

  useGSAP(
    () => {
      registerGsap();
      if (!rootRef.current || prefersReducedMotion()) return;

      const rows = rowRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!rows.length) return;

      gsap.set(rows, { opacity: 0, y: 36 });

      gsap.to(rows, {
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out",
      });

      // Soft yellow accent wipe behind the heading on enter
      const accent = rootRef.current.querySelector("[data-faq-accent]");
      if (accent) {
        gsap.fromTo(
          accent,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="faq"
      data-gsap="section"
      data-gsap-faq=""
      className="border-b border-black/10 bg-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 md:py-28">
        <div className="relative mb-12 max-w-md">
          <span
            data-faq-accent=""
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 top-7 h-3 w-28 origin-left bg-[#F5E642]/70 sm:top-8 sm:h-3.5 sm:w-36"
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
            Quick answers
          </h2>
        </div>

        <div className="divide-y divide-black/10 border-y border-black/10">
          {portfolioConfig.faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                data-gsap="faq-item"
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
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer list-none items-start justify-between gap-6 py-6 text-left outline-none transition-colors hover:text-black focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
                >
                  <span className="flex min-w-0 items-start gap-4">
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 font-mono text-xs tabular-nums transition-colors duration-300",
                        isOpen ? "text-black" : "text-black/30 group-hover/row:text-black/50",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "text-base font-semibold tracking-tight transition-transform duration-300",
                        isOpen ? "translate-x-0.5" : "group-hover/row:translate-x-0.5",
                      )}
                    >
                      {faq.question}
                    </span>
                  </span>
                  <span
                    ref={(el) => {
                      iconRefs.current[index] = el;
                    }}
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center border text-sm transition-colors duration-300",
                      isOpen
                        ? "border-black bg-black text-white"
                        : "border-black/20 text-black/50 group-hover/row:border-black group-hover/row:text-black",
                    )}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                <div
                  ref={(el) => {
                    answerRefs.current[index] = el;
                  }}
                  className="overflow-hidden"
                  style={{ height: 0, opacity: 0 }}
                  inert={!isOpen ? true : undefined}
                >
                  <div
                    data-faq-answer-inner=""
                    className="max-w-2xl pb-6 pl-10 pr-12 text-sm leading-relaxed text-black/60 sm:pl-12"
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
