"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/ui/vercel-navbar";
import { Footer } from "@/components/blocks/footer-section";
import { CanvasRevealEffect } from "@/components/blocks/sign-in-flow-1";
import { 
  ChevronRight,
  Globe,
  ShoppingBag,
  Puzzle,
  Palette,
  Database,
  Webhook,
  ShieldCheck,
  Zap,
  Code2,
  Blocks,
  ArrowRight,
  BookOpen,
  Rocket,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DevContactForm } from "@/components/ui/dev-contact-form";
import { JsonLd } from "@/components/seo/json-ld";

const navigation = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "#introduction", icon: BookOpen },
      { title: "Why Custom Development", href: "#why-custom", icon: Rocket },
    ]
  },
  {
    title: "WordPress",
    items: [
      { title: "Plugin Development", href: "#wp-plugins", icon: Puzzle },
      { title: "Theme Development", href: "#wp-themes", icon: Palette },
      { title: "WooCommerce", href: "#wp-woocommerce", icon: ShoppingBag },
      { title: "API Integrations", href: "#wp-api", icon: Webhook },
    ]
  },
  {
    title: "Shopify",
    items: [
      { title: "App Development", href: "#shopify-apps", icon: Blocks },
      { title: "Theme Development", href: "#shopify-themes", icon: Palette },
      { title: "Checkout Extensions", href: "#shopify-checkout", icon: ShieldCheck },
      { title: "Storefront API", href: "#shopify-storefront", icon: Database },
    ]
  },
  {
    title: "Working Together",
    items: [
      { title: "Our Process", href: "#process", icon: Zap },
      { title: "Get Started", href: "#contact", icon: Send },
    ]
  }
];

export default function DevelopmentPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "introduction";
      
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < 150) {
          current = section.getAttribute("id") || current;
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <JsonLd
        type="Service"
        data={{
          name: 'Web Development Services',
          description: 'Custom web development for Northern Michigan businesses. Modern, fast, and mobile-friendly websites.',
          serviceType: 'Web Development',
          url: 'https://cherrycapitalweb.com/development',
        }}
      />
      <div className="flex w-full flex-col min-h-screen bg-background relative">
      {/* Animated Background - subtle */}
      <div className="fixed inset-0 z-0 opacity-30 dark:opacity-20">
        <CanvasRevealEffect
          animationSpeed={1}
          containerClassName="bg-background"
          colors={[
            [163, 163, 163],
            [212, 212, 212],
          ]}
          dotSize={3}
          reverse={false}
          showGradient={false}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        {/* Main Layout */}
        <div className="flex-1 mx-auto w-full max-w-[90rem]">
          <div className="flex">
            {/* Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0 border-r border-border">
              <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-8 px-6">
                <nav className="space-y-6">
                  {navigation.map((group) => (
                    <div key={group.title}>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {group.title}
                      </h4>
                      <ul className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeSection === item.href.replace("#", "");
                          return (
                            <li key={item.href}>
                              <a
                                href={item.href}
                                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                  isActive
                                    ? "bg-neutral-800/50 text-neutral-200 font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                {item.title}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
                
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                  <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-foreground">Development</span>
                </div>

                {/* Introduction */}
                <section id="introduction" className="mb-16 scroll-mt-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-neutral-800/50">
                      <Code2 className="w-5 h-5 text-neutral-400" />
                    </div>
                    <span className="text-sm font-medium text-neutral-400">Custom Development</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    WordPress & Shopify Development
                  </h1>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                    We build custom plugins, apps, and integrations for businesses running on 
                    WordPress or Shopify. Whether you need a simple tweak or a complex custom 
                    solution, we've got you covered.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-neutral-100 hover:bg-white text-neutral-900">
                      Start a Project
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline">
                      View Examples
                    </Button>
                  </div>
                </section>

                {/* Why Custom */}
                <section id="why-custom" className="mb-16 scroll-mt-20">
                  <h2 className="text-2xl font-bold mb-4">Why Custom Development?</h2>
                  <p className="text-muted-foreground mb-6">
                    Off-the-shelf plugins and apps are great—until they're not. When your business 
                    needs something specific, custom development gives you exactly what you need 
                    without the bloat, conflicts, or limitations of generic solutions.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: "Tailored to your needs", desc: "Built specifically for your workflow and requirements" },
                      { title: "Better performance", desc: "No unnecessary code slowing down your site" },
                      { title: "Full ownership", desc: "You own the code—no recurring license fees" },
                      { title: "Ongoing support", desc: "We maintain and update your solution as needed" },
                    ].map((item) => (
                      <div key={item.title} className="p-4 rounded-xl border border-border bg-card">
                        <h4 className="font-medium mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* WordPress Section */}
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                    <Globe className="w-6 h-6 text-blue-500" />
                    <h2 className="text-2xl font-bold">WordPress Development</h2>
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                      43% of the web
                    </span>
                  </div>

                  <section id="wp-plugins" className="mb-12 scroll-mt-20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Puzzle className="w-5 h-5 text-muted-foreground" />
                      Plugin Development
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Custom WordPress plugins that add the exact functionality your site needs. 
                      We follow WordPress coding standards and best practices for security and performance.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <h4 className="text-sm font-medium mb-2">What we build:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Custom post types and taxonomies</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Admin dashboards and settings pages</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Gutenberg blocks and editor extensions</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Third-party API integrations</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Custom forms and data processing</li>
                      </ul>
                    </div>
                  </section>

                  <section id="wp-themes" className="mb-12 scroll-mt-20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-muted-foreground" />
                      Theme Development
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Custom themes or theme modifications that match your brand perfectly. 
                      We build with performance in mind—fast, accessible, and SEO-friendly.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <h4 className="text-sm font-medium mb-2">What we build:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Full custom themes from scratch</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Child themes for existing themes</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Block themes (Full Site Editing)</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Theme customization and modifications</li>
                      </ul>
                    </div>
                  </section>

                  <section id="wp-woocommerce" className="mb-12 scroll-mt-20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                      WooCommerce Extensions
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Extend your WooCommerce store with custom functionality. From checkout 
                      modifications to complex product configurators, we make your store work the way you need.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <h4 className="text-sm font-medium mb-2">What we build:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Custom checkout flows</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Product add-ons and configurators</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Shipping and payment integrations</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Inventory and order management</li>
                      </ul>
                    </div>
                  </section>

                  <section id="wp-api" className="mb-12 scroll-mt-20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Webhook className="w-5 h-5 text-muted-foreground" />
                      API Integrations
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your WordPress site to external services—CRMs, ERPs, marketing tools, 
                      payment processors, and more. We build reliable integrations that keep your data in sync.
                    </p>
                  </section>
                </div>

                {/* Shopify Section */}
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                    <ShoppingBag className="w-6 h-6 text-green-500" />
                    <h2 className="text-2xl font-bold">Shopify Development</h2>
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      4.4M+ merchants
                    </span>
                  </div>

                  <section id="shopify-apps" className="mb-12 scroll-mt-20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Blocks className="w-5 h-5 text-muted-foreground" />
                      Custom Shopify Apps
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Private apps built specifically for your store. Add custom functionality 
                      without relying on third-party apps that don't quite fit your needs.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <h4 className="text-sm font-medium mb-2">What we build:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Custom admin interfaces</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Inventory management tools</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Order processing automation</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Customer data management</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Reporting and analytics dashboards</li>
                      </ul>
                    </div>
                  </section>

                  <section id="shopify-themes" className="mb-12 scroll-mt-20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-muted-foreground" />
                      Theme Development
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Custom Shopify themes or modifications to existing themes. We build with 
                      Liquid, JavaScript, and modern CSS to create fast, beautiful storefronts.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <h4 className="text-sm font-medium mb-2">What we build:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Custom themes from scratch</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Theme customizations and sections</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Dynamic product pages</li>
                        <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Custom landing pages</li>
                      </ul>
                    </div>
                  </section>

                  <section id="shopify-checkout" className="mb-12 scroll-mt-20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                      Checkout Extensions
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Customize your Shopify checkout experience with Checkout UI Extensions 
                      and Shopify Functions. Add custom fields, validation, discounts, and more.
                    </p>
                  </section>

                  <section id="shopify-storefront" className="mb-12 scroll-mt-20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Database className="w-5 h-5 text-muted-foreground" />
                      Headless & Hydrogen
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Build blazing-fast custom storefronts with Shopify's Storefront API and 
                      Hydrogen framework. Perfect for brands that need complete control over the 
                      shopping experience.
                    </p>
                  </section>
                </div>

                {/* Process */}
                <section id="process" className="mb-16 scroll-mt-20">
                  <h2 className="text-2xl font-bold mb-6">Our Process</h2>
                  
                  <div className="space-y-6">
                    {[
                      { step: "1", title: "Discovery", desc: "We start with a call to understand your needs, goals, and existing setup. No commitment—just a conversation." },
                      { step: "2", title: "Proposal", desc: "We'll put together a detailed proposal with scope, timeline, and pricing. You'll know exactly what you're getting." },
                      { step: "3", title: "Development", desc: "We build your solution with regular updates and demos. You're involved throughout the process." },
                      { step: "4", title: "Launch", desc: "We deploy to your site, test thoroughly, and make sure everything works perfectly." },
                      { step: "5", title: "Support", desc: "We don't disappear after launch. We're here for bug fixes, updates, and future enhancements." },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-800/50 text-neutral-300 flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Contact */}
                <section id="contact" className="mb-16 scroll-mt-20">
                  <h2 className="text-2xl font-bold mb-6">Get Started</h2>
                  <DevContactForm />
                </section>

              </div>
            </main>

            {/* Right Sidebar - Table of Contents (optional, for larger screens) */}
            <aside className="hidden xl:block w-56 shrink-0">
              <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-8 px-6">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  On this page
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#introduction" className="text-muted-foreground hover:text-foreground transition-colors">
                      Introduction
                    </a>
                  </li>
                  <li>
                    <a href="#why-custom" className="text-muted-foreground hover:text-foreground transition-colors">
                      Why Custom Development
                    </a>
                  </li>
                  <li>
                    <a href="#wp-plugins" className="text-muted-foreground hover:text-foreground transition-colors">
                      WordPress
                    </a>
                  </li>
                  <li>
                    <a href="#shopify-apps" className="text-muted-foreground hover:text-foreground transition-colors">
                      Shopify
                    </a>
                  </li>
                  <li>
                    <a href="#process" className="text-muted-foreground hover:text-foreground transition-colors">
                      Our Process
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                      Get Started
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>

        <Footer />
      </div>
    </div>
    </>
  );
}
