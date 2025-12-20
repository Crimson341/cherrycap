"use client";

import { useRef } from "react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { Web3HeroAnimated } from "@/components/ui/animated-web3-landing-page";
import { Footer } from "@/components/blocks/footer-section";
import { Features9 } from "@/components/blocks/features-9";
import Pricing from "@/components/ui/pricing-component";
import { Contact2 } from "@/components/ui/contact-2";
import { HeroSection } from "@/components/ui/hero-section";
import { Accordion03 } from "@/components/ui/accordion-03";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";
import { BlogPreview } from "@/components/ui/blog-preview";

export default function HomeClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="bg-background text-foreground selection:bg-neutral-500/30">
      {/* ============ HERO SECTION ============ */}
      <Web3HeroAnimated />

      {/* Shooting Stars Background - silver/neutral theme */}
      <div className="fixed inset-0 z-0 pointer-events-none dark:block hidden">
        <ShootingStars
          starColor="#a3a3a3"
          trailColor="#d4d4d4"
          minSpeed={15}
          maxSpeed={35}
          minDelay={1000}
          maxDelay={3000}
        />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none dark:hidden block">
        <ShootingStars
          starColor="#525252"
          trailColor="#a3a3a3"
          minSpeed={15}
          maxSpeed={35}
          minDelay={1500}
          maxDelay={4000}
        />
      </div>

      {/* ============ SHIP PRODUCTS 10X FASTER - Full Screen Section ============ */}
      <HeroSection />

      {/* ============ ACCORDION - Interfaces that users love ============ */}
      <Accordion03 />

      {/* ============ FEATURES SECTION ============ */}
      <Features9 />

      {/* ============ PRICING SECTION ============ */}
      <Pricing />

      {/* ============ BLOG PREVIEW SECTION ============ */}
      <BlogPreview />

      {/* ============ TESTIMONIALS SECTION ============ */}
      <TestimonialsSection
        title="Real results from real locals"
        description="Here's what Northern Michigan business owners are saying about working with us"
        testimonials={[
          {
            author: {
              name: "Sarah M.",
              handle: "Winery Owner, Old Mission Peninsula",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
            },
            text: "We were paying $200/month to an agency downstate that never answered the phone. CherryCap rebuilt our site in 3 weeks and tasting room reservations are up 3x. Plus I can actually call them when I need something."
          },
          {
            author: {
              name: "Mike T.",
              handle: "Roofing Contractor, Elk Rapids",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            },
            text: "I'm a roofer, not a tech guy. They built me a site that ranks for 'roofing Traverse City' and now I get 5-10 leads a week from the website. Best $2,500 I ever spent."
          },
          {
            author: {
              name: "Lisa R.",
              handle: "Boutique Owner, Suttons Bay",
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
            },
            text: "My site went down on a Saturday during Cherry Festival. I texted them and it was fixed in an hour. Try getting that from the big agencies. These guys actually care about local businesses."
          },
          {
            author: {
              name: "Dr. James P.",
              handle: "Family Dentist, Downtown TC",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            },
            text: "We went from page 3 on Google to #2 for 'dentist traverse city' in 4 months. New patient bookings are up 40%. The ROI is insane—should've done this years ago."
          },
          {
            author: {
              name: "Amanda K.",
              handle: "Restaurant Owner, Front Street",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
            },
            text: "Our old site looked like it was from 2008. They gave us something modern that actually works on phones. Online orders doubled the first month and customers tell us how good the site looks."
          },
          {
            author: {
              name: "Tom & Karen H.",
              handle: "B&B Owners, Benzie County",
              avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&h=150&fit=crop&crop=face"
            },
            text: "We were skeptical after a bad experience with another local company. CherryCap was upfront about pricing, delivered early, and taught us how to update it ourselves. Highly recommend."
          }
        ]}
      />

      {/* ============ CONTACT SECTION ============ */}
      <Contact2
        title="Let's Talk"
        description="Tell us what you're dealing with. No sales pitch, no pressure—just a straight-up conversation about whether we can actually help your business."
        email="hello@cherrycap.com"
        web={{ label: "cherrycap.com", url: "https://cherrycap.com" }}
      />

      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
  );
}
