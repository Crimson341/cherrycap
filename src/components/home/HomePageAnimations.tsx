"use client";

import { useRef } from "react";
import {
  gsap,
  prefersReducedMotion,
  registerGsap,
  useGSAP,
} from "@/lib/gsap-client";

/**
 * Orchestrates GSAP entrance + scroll animations for the redesigned homepage.
 * Targets elements via data-gsap attributes so section markup stays clean.
 */
export function HomePageAnimations({
  children,
}: {
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (!root.current) return;

      if (prefersReducedMotion()) {
        gsap.set("[data-gsap]", { clearProps: "all", opacity: 1, y: 0, x: 0 });
        return;
      }

      const ctx = gsap.context(() => {
        // —— Header ——
        gsap.from("[data-gsap='nav']", {
          y: -20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.15,
        });

        // —— Hero geometry (strong entrance like a print piece landing) ——
        gsap.from("[data-gsap='hero-blue']", {
          x: -120,
          y: -50,
          rotate: -18,
          scale: 0.92,
          opacity: 0,
          duration: 1.35,
          ease: "power4.out",
        });
        gsap.from("[data-gsap='hero-black']", {
          x: -90,
          y: 70,
          rotate: 10,
          scale: 0.94,
          opacity: 0,
          duration: 1.25,
          ease: "power4.out",
          delay: 0.1,
        });

        gsap.to("[data-gsap='hero-blue']", {
          y: "+=14",
          rotate: "+=1.5",
          duration: 5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.4,
        });
        gsap.to("[data-gsap='hero-black']", {
          y: "-=12",
          rotate: "-=1.2",
          duration: 5.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.55,
        });

        // —— Hero type ——
        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
        heroTl
          .from(
            "[data-gsap='hero-line']",
            {
              y: 64,
              opacity: 0,
              duration: 0.85,
              stagger: 0.14,
            },
            0.2,
          )
          .from(
            "[data-gsap='hero-underline']",
            {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.6,
              ease: "power2.inOut",
            },
            "-=0.4",
          )
          .from(
            "[data-gsap='hero-mark']",
            {
              scale: 0,
              rotate: -120,
              opacity: 0,
              duration: 0.65,
              ease: "back.out(1.7)",
            },
            "-=0.55",
          )
          .from(
            "[data-gsap='hero-cta']",
            {
              y: 28,
              opacity: 0,
              duration: 0.6,
              stagger: 0.1,
            },
            "-=0.2",
          );

        gsap.to("[data-gsap='hero-mark']", {
          rotate: 360,
          duration: 20,
          ease: "none",
          repeat: -1,
          delay: 1.6,
        });

        // —— Scroll sections ——
        gsap.utils.toArray<HTMLElement>("[data-gsap='section']").forEach((section) => {
          const heading = section.querySelectorAll("[data-gsap='section-heading']");
          const items = section.querySelectorAll("[data-gsap='reveal']");
          const cards = section.querySelectorAll("[data-gsap='card']");
          const lines = section.querySelectorAll("[data-gsap='line']");

          if (heading.length) {
            gsap.from(heading, {
              scrollTrigger: {
                trigger: section,
                start: "top 78%",
                toggleActions: "play none none reverse",
              },
              y: 40,
              opacity: 0,
              duration: 0.75,
              stagger: 0.08,
              ease: "power3.out",
            });
          }

          if (items.length) {
            gsap.from(items, {
              scrollTrigger: {
                trigger: section,
                start: "top 72%",
                toggleActions: "play none none reverse",
              },
              y: 36,
              opacity: 0,
              duration: 0.7,
              stagger: 0.09,
              ease: "power3.out",
            });
          }

          if (cards.length) {
            gsap.from(cards, {
              scrollTrigger: {
                trigger: section,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
              y: 50,
              opacity: 0,
              scale: 0.97,
              duration: 0.75,
              stagger: 0.1,
              ease: "power3.out",
            });
          }

          if (lines.length) {
            gsap.from(lines, {
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.8,
              stagger: 0.1,
              ease: "power2.inOut",
            });
          }
        });

        // FAQ open/close + row entrance live in HomeFaq (client accordion).

        // —— Contact form fields ——
        gsap.from("[data-gsap='form-field']", {
          scrollTrigger: {
            trigger: "[data-gsap-contact]",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          y: 24,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        });

        // —— Footer ——
        gsap.from("[data-gsap='footer'] > *", {
          scrollTrigger: {
            trigger: "[data-gsap='footer']",
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
          y: 30,
          opacity: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: "power3.out",
        });

        // —— Parallax on hero art while scrolling ——
        gsap.to("[data-gsap='hero-blue']", {
          scrollTrigger: {
            trigger: "[data-gsap='hero']",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
          y: -60,
          ease: "none",
        });
        gsap.to("[data-gsap='hero-black']", {
          scrollTrigger: {
            trigger: "[data-gsap='hero']",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
          y: 40,
          ease: "none",
        });
        gsap.to("[data-gsap='hero-content']", {
          scrollTrigger: {
            trigger: "[data-gsap='hero']",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
          y: -30,
          opacity: 0.35,
          ease: "none",
        });
      }, root);

      return () => ctx.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="home-gsap-root">
      {children}
    </div>
  );
}
