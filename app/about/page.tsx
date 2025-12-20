"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/ui/vercel-navbar";
import { Footer } from "@/components/blocks/footer-section";
import {
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Award,
  Calendar,
  Coffee,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Stats data
const stats = [
  { value: "10+", label: "Local Businesses Served", icon: Users },
  { value: "3", label: "Years in Northern Michigan", icon: Calendar },
  { value: "<24hr", label: "Average Response Time", icon: Clock },
  { value: "100%", label: "Client Satisfaction", icon: Star },
];

// Why choose us comparison
const comparison = [
  {
    feature: "Based in Northern Michigan",
    us: true,
    bigAgency: false,
    freelancer: false,
  },
  {
    feature: "Transparent, upfront pricing",
    us: true,
    bigAgency: false,
    freelancer: true,
  },
  {
    feature: "Same-day support available",
    us: true,
    bigAgency: false,
    freelancer: false,
  },
  {
    feature: "Understands Northern Michigan market",
    us: true,
    bigAgency: false,
    freelancer: false,
  },
  {
    feature: "Modern tech (not just WordPress)",
    us: true,
    bigAgency: true,
    freelancer: false,
  },
  {
    feature: "No long-term contracts required",
    us: true,
    bigAgency: false,
    freelancer: true,
  },
  {
    feature: "Design + development + SEO",
    us: true,
    bigAgency: true,
    freelancer: false,
  },
  {
    feature: "Affordable for small business",
    us: true,
    bigAgency: false,
    freelancer: true,
  },
];

// Values
const values = [
  {
    icon: MessageCircle,
    title: "Straight Talk",
    description: "No jargon, no upselling. We tell you what you actually need and what it'll cost.",
  },
  {
    icon: Zap,
    title: "Fast & Responsive",
    description: "When your site goes down on a Saturday, we answer. Period.",
  },
  {
    icon: Shield,
    title: "Built to Last",
    description: "We build things right the first time. No band-aids, no shortcuts.",
  },
  {
    icon: Heart,
    title: "Invested in Your Success",
    description: "Your success is our success. We're not happy until your phone starts ringing.",
  },
];

// Service areas
const serviceAreas = [
  "Traverse City",
  "Leelanau County", 
  "Benzie County",
  "Grand Traverse County",
  "Antrim County",
  "Kalkaska County",
  "Charlevoix",
  "Petoskey",
  "Elk Rapids",
  "Suttons Bay",
  "Frankfort",
  "Beulah",
];

export default function AboutPage() {
  return (
    <div className="flex w-full flex-col min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-neutral-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-slate-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700/50 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-neutral-300 font-medium">Based in Beulah, MI</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                We're the web team{" "}
                <span className="bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                  your business deserves
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Local web design for Northern Michigan businesses. We build websites that 
                actually bring you customers—not just look pretty in a portfolio.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-neutral-100 hover:bg-white text-neutral-900" asChild>
                  <Link href="/#contact">
                    Chat with Us
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:hello@cherrycap.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Right - Founder Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-neutral-500/20 to-slate-500/20 rounded-full blur-2xl" />

                <div className="relative">
                  {/* Founder image placeholder */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neutral-300 to-neutral-500 mb-6 flex items-center justify-center">
                    <span className="text-4xl font-bold text-neutral-900">CC</span>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">Meet the Team</h3>
                  <p className="text-neutral-400 font-medium mb-4">CherryCap • Founded 2022</p>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "I grew up in the area. I watched local businesses struggle with outdated 
                    websites while their competitors passed them by online. CherryCap is my 
                    answer to that problem."
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <a 
                      href="mailto:hello@cherrycap.com"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      hello@cherrycap.com
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800/50 mb-4">
                  <stat.icon className="w-6 h-6 text-neutral-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why We Started CherryCap
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The honest story of why we do what we do
            </p>
          </motion.div>

          <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              We kept seeing the same problem: Local businesses in Northern Michigan were 
              getting left behind online. Not because they weren't good at what they do—the 
              wineries, restaurants, contractors, and shops up here are incredible. But their 
              websites were stuck in 2010.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Meanwhile, their options for getting help were terrible:
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 gap-4 my-8"
            >
              {[
                { title: "Big agencies", desc: "Charge $20k+ and treat you like a number" },
                { title: "Freelancers", desc: "Disappear after the project's done" },
                { title: "DIY platforms", desc: "Fine until you need anything custom" },
                { title: "Out-of-state firms", desc: "Don't understand our market" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <XCircle className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">{item.title}:</span>{" "}
                    <span className="text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              So we built CherryCap to fill that gap. A local team that builds modern websites 
              at honest prices, actually answers the phone, and sticks around after launch.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="font-medium text-foreground"
            >
              Three years later, we've helped local businesses get online and actually 
              get results. And we're just getting started.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700/50 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-neutral-300 font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How we compare to your other options
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're not the cheapest and we're not the biggest. But for local businesses 
              who want quality work and real support, we're the best value.
            </p>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">Feature</th>
                  <th className="py-4 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-bold text-neutral-200">CherryCap</span>
                      <span className="text-xs text-muted-foreground">Local Agency</span>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-medium text-foreground">Big Agency</span>
                      <span className="text-xs text-muted-foreground">$15k+ projects</span>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-medium text-foreground">Freelancer</span>
                      <span className="text-xs text-muted-foreground">Solo worker</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="py-4 px-4 text-sm">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.us ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.bigAgency ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.freelancer ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How we work
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our promise to every client we work with
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card hover:border-neutral-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-800/50 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700/50 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-neutral-300 font-medium">Service Area</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Proudly serving Northern Michigan
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We're based in Beulah and serve businesses throughout 
                Northern Michigan. Local enough to grab coffee with you, skilled 
                enough to compete with anyone.
              </p>

              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1.5 text-sm rounded-full bg-background border border-border"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              {/* Map placeholder */}
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-neutral-500/10 via-background to-slate-500/10 border border-border overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">Beulah, MI</p>
                    <p className="text-sm text-muted-foreground">Benzie County, Northern Michigan</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-border bg-card p-8 md:p-12 overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-500/5 via-transparent to-slate-500/5" />

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-800/50 mb-6">
                <Coffee className="w-8 h-8 text-neutral-400" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Let's grab coffee and talk about your project
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                No pressure, no sales pitch. Just an honest conversation about what 
                you need and whether we're the right fit. Coffee's on us.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button size="lg" className="bg-neutral-100 hover:bg-white text-neutral-900 w-full sm:w-auto" asChild>
                  <Link href="/#contact">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with Us
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="mailto:hello@cherrycap.com">
                    <Mail className="w-4 h-4 mr-2" />
                    hello@cherrycap.com
                  </a>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Or fill out our{" "}
                <Link href="/#contact" className="text-neutral-300 hover:underline">
                  contact form
                </Link>{" "}
                and we'll reach out within 24 hours.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
