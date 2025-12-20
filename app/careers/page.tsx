"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Header } from "@/components/ui/vercel-navbar";
import { Footer } from "@/components/blocks/footer-section";
import { LineIcon } from "@/components/ui/line-icon";
import { ArrowRight } from "lucide-react";

const opportunities = [
  {
    title: "AI Trainer",
    emoji: "🤖",
    description: "Make our chatbot smarter. Review conversations, fix bad responses, teach it to actually help people.",
    time: "2-5 hrs/week",
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Social Media",
    emoji: "📱",
    description: "Create posts, find content, engage with people. Turn your scrolling habit into actual benefits.",
    time: "3-6 hrs/week",
    color: "from-pink-500 to-rose-600",
  },
  {
    title: "Sales Scout",
    emoji: "🎯",
    description: "Know someone who needs a website? Connect us. Get a fat bonus when they sign.",
    time: "Flexible",
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Writer",
    emoji: "✍️",
    description: "Blog posts, case studies, website copy. Build your portfolio while helping us out.",
    time: "2-4 hrs/week",
    color: "from-emerald-500 to-green-600",
  },
];

const perks = [
  { icon: "discount", value: "20%", label: "Off all our services" },
  { icon: "gift", value: "$500", label: "Max referral bonus" },
  { icon: "alarm-1", value: "0", label: "Required office hours" },
  { icon: "home-1", value: "100%", label: "Remote forever" },
];

const benefitsList = [
  { icon: "discount", title: "20% off everything we do", desc: "Need a website? Side project? Your friends want one? You get 20% off. They get 10% off." },
  { icon: "target-1", title: "$200-500 referral bonuses", desc: "Know a business that needs a website? Introduce us. If they sign, you get cash. Real cash." },
  { icon: "coffee-cup", title: "Work literally whenever", desc: "3am from your bed? Sunday at a coffee shop? We don't track hours. Just get stuff done." },
  { icon: "graduation-1", title: "Skills that actually matter", desc: "AI, marketing, sales, content. Stuff you can put on a resume. Stuff that gets you hired." },
  { icon: "bolt-1", title: "No meetings (almost)", desc: "Quick check-ins when needed. That's it. Your time is yours." },
];

function AsciiHero() {
  useEffect(() => {
    const embedScript = document.createElement('script');
    embedScript.type = 'text/javascript';
    embedScript.textContent = `
      !function(){
        if(!window.UnicornStudio){
          window.UnicornStudio={isInitialized:!1};
          var i=document.createElement("script");
          i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
          i.onload=function(){
            window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
          };
          (document.head || document.body).appendChild(i)
        }
      }();
    `;
    document.head.appendChild(embedScript);

    const style = document.createElement('style');
    style.id = 'ascii-hero-styles';
    style.textContent = `
      [data-us-project] {
        position: relative !important;
        overflow: hidden !important;
      }
      [data-us-project] canvas {
        clip-path: inset(0 0 10% 0) !important;
      }
      [data-us-project] * {
        pointer-events: none !important;
      }
      [data-us-project] a[href*="unicorn"],
      [data-us-project] button[title*="unicorn"],
      [data-us-project] div[title*="Made with"],
      [data-us-project] .unicorn-brand,
      [data-us-project] [class*="brand"],
      [data-us-project] [class*="credit"],
      [data-us-project] [class*="watermark"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      try {
        document.head.removeChild(embedScript);
        const styleEl = document.getElementById('ascii-hero-styles');
        if (styleEl) document.head.removeChild(styleEl);
      } catch (e) {}
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Animation */}
      <div className="absolute inset-0 w-full h-full hidden lg:block">
        <div 
          data-us-project="OMzqyUv6M3kSnv0JeAtC" 
          style={{ width: '100%', height: '100%', minHeight: '100vh' }}
        />
      </div>

      {/* Mobile stars background */}
      <div className="absolute inset-0 w-full h-full lg:hidden opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, white, transparent),
            radial-gradient(1px 1px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(1px 1px at 90% 60%, white, transparent)
          `,
        }}
      />

      {/* Corner Frame Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-white/30 z-20" />
      <div className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-white/30 z-20" />
      <div className="absolute bottom-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-white/30 z-20" />
      <div className="absolute bottom-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/30 z-20" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center lg:justify-end">
        <div className="w-full lg:w-1/2 px-6 lg:px-16 lg:pr-[10%] text-center lg:text-left">
          <motion.div 
            className="max-w-lg mx-auto lg:ml-auto lg:mx-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Top decorative line */}
            <div className="flex items-center gap-2 mb-4 opacity-60 justify-center lg:justify-start">
              <div className="w-8 h-px bg-white" />
              <span className="text-white text-[10px] font-mono tracking-wider">CHERRYCAP</span>
              <div className="flex-1 h-px bg-white max-w-16" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 mb-6">
              <span className="text-white/60 text-xs font-mono">JOIN THE TEAM</span>
            </div>

            {/* Plato Quote */}
            <h1 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight font-mono tracking-wide">
              "Be kind, for everyone
              <br />
              <span className="text-white/60">you meet is fighting</span>
              <br />
              a hard battle."
            </h1>

            {/* Attribution */}
            <p className="text-white/40 text-sm font-mono mb-6">— PLATO</p>

            {/* Description */}
            <p className="text-sm lg:text-base text-gray-400 mb-8 leading-relaxed font-mono">
              We're building something real here. Not a corporation—a team. 
              Help us help local businesses, and we'll take care of you.
            </p>

            {/* Decorative dots */}
            <div className="hidden lg:flex gap-1 mb-6 opacity-40">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-white rounded-full" />
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a 
                href="#opportunities"
                className="px-6 py-3 bg-white text-black font-mono text-sm hover:bg-white/90 transition-all inline-flex items-center justify-center gap-2"
              >
                SEE OPPORTUNITIES
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="mailto:hello@cherrycap.com"
                className="px-6 py-3 border border-white text-white font-mono text-sm hover:bg-white hover:text-black transition-all inline-flex items-center justify-center"
              >
                CONTACT US
              </a>
            </div>

            {/* Bottom tech notation */}
            <div className="hidden lg:flex items-center gap-2 mt-8 opacity-40">
              <span className="text-white text-[9px] font-mono">∞</span>
              <div className="flex-1 h-px bg-white max-w-32" />
              <span className="text-white text-[9px] font-mono">TRAVERSE.CITY.MI</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <motion.div 
            className="w-1.5 h-1.5 bg-white/50 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

export default function CareersPage() {
  return (
    <div className="flex w-full flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <Header />

      <main className="flex-1">
        
        {/* ASCII Hero with Plato Quote */}
        <AsciiHero />

        {/* Stats bar */}
        <section className="py-16 border-y border-border bg-muted/30">
          <div className="container px-6 mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {perks.map((perk, i) => (
                <motion.div
                  key={perk.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-3">
                    <LineIcon name={perk.icon} size={28} className="text-neutral-400" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-1">{perk.value}</div>
                  <div className="text-sm text-muted-foreground">{perk.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Opportunities - Big cards */}
        <section id="opportunities" className="py-24 scroll-mt-20">
          <div className="container px-6 mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Pick your role</h2>
              <p className="text-xl text-muted-foreground">Do one. Do all. Whatever works.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {opportunities.map((opp, i) => (
                <motion.div
                  key={opp.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 cursor-pointer"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${opp.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <span className="text-5xl">{opp.emoji}</span>
                      <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {opp.time}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{opp.title}</h3>
                    <p className="text-muted-foreground text-lg">{opp.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What you actually get */}
        <section className="py-24 bg-muted/30">
          <div className="container px-6 mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">The perks are real</h2>
              <p className="text-xl text-muted-foreground">Not pizza parties. Actual value.</p>
            </motion.div>

            <div className="space-y-6">
              {benefitsList.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-300 to-neutral-500 flex items-center justify-center shrink-0">
                    <LineIcon name={item.icon} size={24} className="text-neutral-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who this is for */}
        <section className="py-24">
          <div className="container px-6 mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Perfect for you if...</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {[
                "You're a student wanting real experience",
                "You scroll social media anyway",
                "You know local business owners",
                "You're between jobs",
                "You want discounts on web work",
                "You're bored and want a side thing",
                "You're good with AI tools",
                "You like writing",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA - Big and simple */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-500/10 via-background to-slate-500/10" />
          
          <div className="container px-6 mx-auto max-w-3xl relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-7xl mb-8"
              >
                👋
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Let's do this</h2>
              <p className="text-xl text-muted-foreground mb-10">
                Email us. Tell us which role sounds good. Be yourself.
              </p>

              <a
                href="mailto:hello@cherrycap.com?subject=I want to help out"
                className="inline-flex items-center gap-3 px-10 py-5 bg-neutral-100 hover:bg-white text-neutral-900 font-bold text-lg rounded-full transition-all hover:scale-105"
              >
                <LineIcon name="envelope-1" size={22} className="text-neutral-900" />
                hello@cherrycap.com
              </a>

              <p className="text-sm text-muted-foreground mt-8">
                No resume. No cover letter. Just be real.
              </p>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
