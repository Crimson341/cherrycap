"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const items = [
  {
    id: "01",
    title: "People Actually Find You",
    img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80",
    content:
      "You know that competitor down the street who always seems busy? They're probably showing up on Google and you're not. We fix that. When someone searches for what you do, they'll find you first.",
  },
  {
    id: "02",
    title: "They Actually Call You",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    content:
      "A website that looks nice but doesn't get you calls is just expensive decoration. Every site we build has one job: get people to pick up the phone, fill out the form, or walk through your door.",
  },
  {
    id: "03",
    title: "You Look Like a Million Bucks",
    img: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop&q=80",
    content:
      "People judge your business by your website. If it looks like it's from 2010, they'll assume your business is too. We make you look modern, trustworthy, and worth their money.",
  },
  {
    id: "04",
    title: "Works on Grandma's Phone Too",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    content:
      "More than half your customers are browsing on their phones. If your site is a pain to use on mobile, they'll just go to someone else. Ours work perfectly everywhere.",
  },
  {
    id: "05",
    title: "We Actually Pick Up the Phone",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80",
    content:
      "Had a bad experience with a web company before? Us too. That's why we're different. Need something changed? Call us. Text us. We'll handle it. No tickets, no waiting, no runaround.",
  },
];

export function Accordion03() {
  return (
    <section id="services" className="relative py-32 overflow-hidden">
      {/* Background gradient - slate/silver tones */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-neutral-500/10 via-slate-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700/50 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-neutral-300 font-medium">Here's What Actually Happens</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your website should{" "}
            <span className="bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              work for you
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Not just sit there looking pretty. Here's what changes when you work with us:
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          className="w-full max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
            <Accordion type="single" defaultValue="02" collapsible className="w-full">
              {items.map((item) => (
                <AccordionItem
                  className="relative border-b border-neutral-800 last:border-b-0"
                  value={item.id}
                  key={item.id}
                >
                  <AccordionTrigger className="px-6 py-6 hover:no-underline hover:bg-neutral-800/50 transition-colors [&>svg]:hidden group">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-muted-foreground group-hover:text-neutral-200 transition-colors">
                        {item.id}
                      </span>
                      <h3 className="text-lg md:text-xl font-semibold text-foreground text-left">
                        {item.title}
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground w-full h-full">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="px-6 pb-6 space-y-6">
                        <p className="text-base leading-relaxed">{item.content}</p>
                        <Button
                          className="bg-neutral-100 hover:bg-white text-neutral-900 border-0 rounded-full px-6"
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                      <div className="relative h-48 md:h-64 md:absolute md:w-1/2 md:right-0 md:top-0 md:bottom-0 md:h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-transparent to-transparent z-10 md:block hidden" />
                        <img
                          className="w-full h-full object-cover"
                          src={item.img}
                          alt={item.title}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Accordion03;
