"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Spline from "@splinetool/react-spline";
import { Header } from "@/components/ui/vercel-navbar";
import { Footer } from "@/components/blocks/footer-section";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  Bot,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Mail,
  Sparkles,
  Calendar,
  HeadphonesIcon,
  ShoppingCart,
  FileText,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { Testimonial } from "@/components/ui/design-testimonial";
import { ShineBorder, AITimeline } from "@/components/ui/shine-border";

// AI Testimonials
const aiTestimonials = [
  {
    quote: "Our AI chatbot handles 80% of customer questions. We finally sleep through the night.",
    author: "Mike Torres",
    role: "Owner",
    company: "Traverse City Brewing",
  },
  {
    quote: "Bookings went up 40% after adding the AI assistant. It never misses a reservation request.",
    author: "Sarah Mitchell",
    role: "General Manager",
    company: "Peninsula Inn",
  },
  {
    quote: "Like having a 24/7 receptionist who knows everything about our services.",
    author: "David Chen",
    role: "Owner",
    company: "Northern Plumbing Co",
  },
];

// AI Features
const features = [
  {
    icon: MessageSquare,
    title: "24/7 Customer Support",
    description: "Answer questions about hours, services, and pricing—even while you sleep.",
  },
  {
    icon: Calendar,
    title: "Appointment Booking",
    description: "Let customers schedule directly through chat. Syncs with your calendar.",
  },
  {
    icon: ShoppingCart,
    title: "Product Recommendations",
    description: "Guide customers to the right products. Like your best salesperson, always on.",
  },
  {
    icon: FileText,
    title: "Lead Capture",
    description: "Collect contact info and qualify leads before they reach you.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Serve customers in multiple languages. Perfect for tourist areas.",
  },
  {
    icon: HeadphonesIcon,
    title: "Human Handoff",
    description: "Smoothly transfers to you with full context when needed.",
  },
];

// Stats
const stats = [
  { value: "24/7", label: "Always Available" },
  { value: "80%", label: "Questions Answered" },
  { value: "3x", label: "More Leads" },
  { value: "<2s", label: "Response Time" },
];

// Use cases
const industries = [
  {
    name: "Restaurants & Wineries",
    items: ["Menu questions", "Reservations", "Daily specials", "Large parties"],
  },
  {
    name: "Contractors",
    items: ["Instant quotes", "Schedule jobs", "Service areas", "Emergency requests"],
  },
  {
    name: "Retail",
    items: ["Product help", "Stock checks", "Order status", "Returns"],
  },
  {
    name: "Professional Services",
    items: ["Book consultations", "FAQs", "Intake forms", "Lead qualification"],
  },
];

// Pricing
const pricing = [
  {
    name: "Starter",
    price: "$199",
    period: "/mo",
    description: "Test AI on your site",
    features: ["500 conversations/mo", "FAQ training", "Email alerts", "Setup included"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$399",
    period: "/mo",
    description: "Full automation",
    features: ["Unlimited conversations", "Appointment booking", "Lead qualification", "CRM integration", "Priority support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "White-glove service",
    features: ["Multiple AI agents", "Phone handling", "Custom integrations", "Dedicated manager"],
    highlighted: false,
  },
];

// Process steps
const steps = [
  { num: "01", title: "Discovery", desc: "30-min call to learn your business" },
  { num: "02", title: "Training", desc: "We train AI on your services & voice" },
  { num: "03", title: "Install", desc: "Add to any website in minutes" },
  { num: "04", title: "Launch", desc: "Go live with ongoing optimization" },
];

export default function AIPage() {
  return (
    <>
      <JsonLd
        type="Service"
        data={{
          name: 'AI-Powered Business Tools',
          description: 'Leverage artificial intelligence for your Northern Michigan business. Smart analytics, automation, and insights.',
          serviceType: 'AI Solutions',
          url: 'https://cherrycapitalweb.com/ai',
        }}
      />
      <div className="flex w-full flex-col min-h-screen bg-black text-white">
      <Header />

      {/* Hero Section with 3D Boxes */}
      <section className="relative min-h-screen overflow-hidden">
        {/* 3D Spline Background - interactive */}
        <div className="absolute inset-0 z-0" style={{ pointerEvents: "auto" }}>
          <Spline
            style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
            scene="https://prod.spline.design/dJqTIQ-tE3ULUPMi/scene.splinecode"
          />
        </div>

        {/* Gradient overlays for readability - doesn't block interactions */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: `
              linear-gradient(to right, rgba(0, 0, 0, 0.85), transparent 40%, transparent 60%, rgba(0, 0, 0, 0.85)),
              linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.95))
            `,
          }}
        />

        {/* Hero Content - pointer-events-none except for buttons */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 min-h-screen flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-6 backdrop-blur-sm">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400 font-medium">AI-Powered</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Add AI to your site.{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Never miss a customer.
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Your customers have questions at 10pm. They want to book on Sunday.
                Give them an AI assistant trained on your business.
              </p>

              <div className="flex flex-wrap gap-4 pointer-events-auto">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all" asChild>
                  <Link href="/#contact">
                    See a Demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black transition-all" asChild>
                  <a href="mailto:hello@cherrycap.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonial testimonials={aiTestimonials} />

      {/* How AI Works Section - Text Left, Timeline Right */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-medium">How It Works</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                From question to{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  conversion
                </span>{" "}
                in seconds
              </h2>

              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Your AI assistant works around the clock, handling customer inquiries
                with the same care and knowledge you would—just faster and without
                needing coffee breaks.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-gray-300">Trained on your specific business</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-gray-300">Responds in your brand voice</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-gray-300">Seamlessly hands off to humans when needed</span>
                </div>
              </div>
            </motion.div>

            {/* Right - ShineBorder with Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ShineBorder
                color={["#22d3ee", "#3b82f6", "#8b5cf6"]}
                borderRadius={24}
                borderWidth={2}
                duration={10}
                className="p-8"
              >
                <AITimeline />
              </ShineBorder>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-cyan-400 mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Everything your AI can do
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Trained on your business, answering like you would
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-2xl border border-gray-800 bg-gray-900 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
              >
                <feature.icon className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Built for local businesses
            </h2>
            <p className="text-lg text-gray-400">
              AI that understands Northern Michigan
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((industry, i) => (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-gray-800 bg-gray-900"
              >
                <h3 className="font-semibold mb-4 text-cyan-400">{industry.name}</h3>
                <ul className="space-y-2">
                  {industry.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Live in under 2 weeks
            </h2>
            <p className="text-lg text-gray-400">
              We handle everything—you just answer a few questions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="text-4xl font-bold text-cyan-400/20 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{step.num}</div>
                <h3 className="font-semibold mb-1 text-white">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              One customer pays for it
            </h2>
            <p className="text-lg text-gray-400">
              Most businesses see 10x that. No contracts.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlowCard
                  glowColor={tier.highlighted ? "blue" : "purple"}
                  customSize
                  className="h-full p-6"
                >
                  <div className="relative z-10">
                    {tier.highlighted && (
                      <span className="inline-block px-3 py-1 rounded-full bg-cyan-500 text-black text-xs font-medium mb-4">
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{tier.price}</span>
                      <span className="text-gray-400">{tier.period}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">{tier.description}</p>

                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                          <span className="text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${tier.highlighted ? "bg-white text-black hover:bg-gray-200" : "border-white text-white hover:bg-white hover:text-black"}`}
                      variant={tier.highlighted ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/#contact">Get Started</Link>
                    </Button>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-black">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Common questions</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { q: "Will it sound robotic?", a: "No—we train it on your voice. Customers often can't tell it's AI." },
              { q: "Do I need a new website?", a: "Nope. Works with WordPress, Squarespace, Wix, custom—anything." },
              { q: "How long to set up?", a: "Most businesses are live in 1-2 weeks. We handle all the training." },
              { q: "Can I see conversations?", a: "Yes—full dashboard showing every chat and how AI responded." },
              { q: "What if I want to cancel?", a: "Cancel anytime. No contracts, no hassle." },
            ].map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border border-gray-800 bg-gray-900"
              >
                <h3 className="font-semibold mb-2 text-white">{faq.q}</h3>
                <p className="text-sm text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 mb-6">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Ready to add AI?
            </h2>

            <p className="text-lg text-gray-400 mb-8">
              Free consultation. We'll show you exactly what it would look like on your site.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all" asChild>
                <Link href="/#contact">
                  Chat with AI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black transition-all" asChild>
                <a href="mailto:hello@cherrycap.com">
                  <Mail className="w-4 h-4 mr-2" />
                  hello@cherrycap.com
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}
