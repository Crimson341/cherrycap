"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/ui/vercel-navbar";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/blocks/footer-section").then(m => m.Footer));
const CanvasRevealEffect = dynamic(() => import("@/components/blocks/sign-in-flow-1").then(m => m.CanvasRevealEffect), { ssr: false });
import {
  ChevronRight,
  BarChart3,
  Users,
  TrendingUp,
  FileText,
  ShoppingCart,
  Mail,
  ArrowRight,
  Layers,
  Code,
  Palette,
  Zap,
  Shield,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";

const navigation = [
  {
    title: "Features",
    items: [
      { title: "Analytics Dashboard", href: "#analytics", icon: BarChart3 },
      { title: "Customer Insights", href: "#insights", icon: Users },
      { title: "Sales Tracking", href: "#sales", icon: TrendingUp },
      { title: "Reports & Exports", href: "#reports", icon: FileText },
    ]
  },
  {
    title: "Integrations",
    items: [
      { title: "E-commerce", href: "#ecommerce", icon: ShoppingCart },
      { title: "Email Marketing", href: "#email", icon: Mail },
    ]
  },
  {
    title: "Get Started",
    items: [
      { title: "Contact Us", href: "#contact", icon: Headphones },
    ]
  }
];

const features = [
  {
    id: "analytics",
    title: "Analytics Dashboard",
    icon: BarChart3,
    color: "blue",
    description: "Get a complete view of your business performance with a custom analytics dashboard built specifically for your needs. Track the metrics that matter most to you, all in one place.",
    capabilities: [
      "Real-time data visualization",
      "Custom KPI tracking",
      "Interactive charts and graphs",
      "Historical trend analysis",
      "Mobile-responsive design",
    ],
  },
  {
    id: "insights",
    title: "Customer Insights",
    icon: Users,
    color: "violet",
    description: "Understand your customers like never before. Our custom CMS solutions help you gather, analyze, and act on customer data to improve retention and grow your business.",
    capabilities: [
      "Customer behavior tracking",
      "Demographic analysis",
      "Purchase pattern insights",
      "Customer segmentation",
      "Feedback collection & analysis",
    ],
  },
  {
    id: "sales",
    title: "Sales Tracking",
    icon: TrendingUp,
    color: "emerald",
    description: "Monitor your revenue and growth in real-time. Our sales tracking solutions integrate seamlessly with your existing systems to give you complete visibility into your sales pipeline.",
    capabilities: [
      "Revenue monitoring",
      "Sales pipeline visualization",
      "Goal tracking & forecasting",
      "Team performance metrics",
      "Conversion rate analysis",
    ],
  },
  {
    id: "reports",
    title: "Reports & Exports",
    icon: FileText,
    color: "amber",
    description: "Generate beautiful, comprehensive reports with just a few clicks. Export your data in multiple formats for stakeholders, accounting, or compliance needs.",
    capabilities: [
      "Automated report generation",
      "Custom report templates",
      "Multiple export formats (PDF, CSV, Excel)",
      "Scheduled report delivery",
      "White-label branding options",
    ],
  },
];

const integrations = [
  {
    id: "ecommerce",
    title: "E-commerce Integration",
    icon: ShoppingCart,
    color: "rose",
    description: "Connect your online store to your custom CMS for unified management. We integrate with major platforms to bring all your data together.",
    platforms: [
      { name: "Shopify", desc: "Full store data sync" },
      { name: "WooCommerce", desc: "WordPress integration" },
      { name: "Stripe", desc: "Payment analytics" },
      { name: "Square", desc: "POS & online sales" },
    ],
  },
  {
    id: "email",
    title: "Email Marketing",
    icon: Mail,
    color: "sky",
    description: "Integrate your email marketing tools directly into your CMS. Manage campaigns, track performance, and automate communications from one central hub.",
    platforms: [
      { name: "Mailchimp", desc: "Campaign management" },
      { name: "Klaviyo", desc: "E-commerce email" },
      { name: "SendGrid", desc: "Transactional email" },
      { name: "ConvertKit", desc: "Creator-focused tools" },
    ],
  },
];

const benefits = [
  {
    icon: Layers,
    title: "Fully Custom",
    description: "Built specifically for your business needs, not a one-size-fits-all solution.",
  },
  {
    icon: Code,
    title: "Modern Technology",
    description: "Fast, secure, and scalable systems built with the latest tech stack.",
  },
  {
    icon: Palette,
    title: "Your Branding",
    description: "Matches your website and brand perfectly—feels like a natural extension.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed so you can access your data without waiting.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data stays yours. Enterprise-grade security built in.",
  },
  {
    icon: Headphones,
    title: "Ongoing Support",
    description: "We don't disappear after launch. Get help when you need it.",
  },
];

export default function CustomSolutionsPage() {
  const [activeSection, setActiveSection] = useState("analytics");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "analytics";

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < 150) {
          current = section.getAttribute("id") || current;
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; bgLight: string }> = {
      amber: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/20", bgLight: "bg-amber-500/10" },
      emerald: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/20", bgLight: "bg-emerald-500/10" },
      blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/20", bgLight: "bg-blue-500/10" },
      rose: { bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500/20", bgLight: "bg-rose-500/10" },
      violet: { bg: "bg-violet-500", text: "text-violet-500", border: "border-violet-500/20", bgLight: "bg-violet-500/10" },
      sky: { bg: "bg-sky-500", text: "text-sky-500", border: "border-sky-500/20", bgLight: "bg-sky-500/10" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      <JsonLd
        type="Service"
        data={{
          name: 'Custom Software Solutions',
          description: 'Tailored software and web applications for your unique business needs. AI-powered tools and custom integrations.',
          serviceType: 'Custom Software Development',
          url: 'https://cherrycapitalweb.com/custom-solutions',
        }}
      />
      <div className="flex w-full flex-col min-h-screen bg-background relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-30 dark:opacity-20">
        <CanvasRevealEffect
          animationSpeed={1}
          containerClassName="bg-background"
          colors={[
            [59, 130, 246],
            [139, 92, 246],
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
                                    ? "bg-blue-500/10 text-blue-500 font-medium"
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
                  <span className="text-foreground">Custom Solutions</span>
                </div>

                {/* Hero */}
                <section className="mb-16">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Layers className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-blue-500">Custom CMS Solutions</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Your Business,
                    <br />
                    <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-rose-500 bg-clip-text text-transparent">
                      Your Dashboard
                    </span>
                  </h1>

                  <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                    We build custom content management systems that integrate directly
                    into your website. Analytics, customer insights, sales tracking,
                    and more—all tailored to how you actually run your business.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-blue-500 hover:bg-blue-600" asChild>
                      <a href="#contact">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="#analytics">
                        See Features
                      </a>
                    </Button>
                  </div>
                </section>

                {/* Benefits Grid */}
                <section className="mb-16">
                  <h2 className="text-2xl font-bold mb-6">Why Custom?</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {benefits.map((benefit) => {
                      const Icon = benefit.icon;
                      return (
                        <div key={benefit.title} className="p-4 rounded-xl border border-border bg-card/50">
                          <Icon className="w-5 h-5 text-blue-500 mb-3" />
                          <h3 className="font-medium mb-1">{benefit.title}</h3>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Divider */}
                <div className="relative my-16">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-sm text-muted-foreground">
                      Core Features
                    </span>
                  </div>
                </div>

                {/* Features */}
                {features.map((feature) => {
                  const colors = getColorClasses(feature.color);
                  const Icon = feature.icon;

                  return (
                    <section key={feature.id} id={feature.id} className="mb-12 scroll-mt-20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${colors.bgLight}`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <h2 className="text-2xl font-bold">{feature.title}</h2>
                      </div>

                      <p className="text-muted-foreground mb-6">
                        {feature.description}
                      </p>

                      <div className="grid gap-2">
                        {feature.capabilities.map((capability) => (
                          <div key={capability} className="flex items-start gap-3 py-2">
                            <ChevronRight className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                            <span className="text-muted-foreground">{capability}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}

                {/* Divider */}
                <div className="relative my-16">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-sm text-muted-foreground">
                      Integrations
                    </span>
                  </div>
                </div>

                {/* Integrations */}
                {integrations.map((integration) => {
                  const colors = getColorClasses(integration.color);
                  const Icon = integration.icon;

                  return (
                    <section key={integration.id} id={integration.id} className="mb-12 scroll-mt-20">
                      <div className={`rounded-2xl border ${colors.border} ${colors.bgLight} p-8`}>
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`p-3 rounded-xl ${colors.bgLight}`}>
                            <Icon className={`w-8 h-8 ${colors.text}`} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">{integration.title}</h2>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-6">
                          {integration.description}
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {integration.platforms.map((platform) => (
                            <div key={platform.name} className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border">
                              <ChevronRight className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                              <div>
                                <p className="font-medium">{platform.name}</p>
                                <p className="text-sm text-muted-foreground">{platform.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                })}

                {/* CTA */}
                <section id="contact" className="mb-16 scroll-mt-20">
                  <div className="rounded-2xl border border-border bg-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Headphones className="w-6 h-6 text-blue-500" />
                      <h2 className="text-2xl font-bold">Let's Build Something</h2>
                    </div>

                    <p className="text-muted-foreground mb-6">
                      Every business is different. Tell us about yours, and we'll design
                      a custom solution that fits how you work—not the other way around.
                    </p>

                    <div className="bg-muted/50 rounded-xl p-6 border border-border mb-6">
                      <div className="flex items-start gap-4">
                        <Layers className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium mb-2">What's included?</p>
                          <p className="text-sm text-muted-foreground">
                            Custom dashboard design, full integration with your website,
                            data migration from existing tools, training for your team,
                            and ongoing support. We handle everything.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-blue-500 hover:bg-blue-600" asChild>
                        <Link href="/development#contact">
                          Start a Conversation
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="mailto:hello@cherrycap.com">
                          Email Us
                        </a>
                      </Button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Free consultation to discuss your needs and get a custom quote.
                      </p>
                    </div>
                  </div>
                </section>

              </div>
            </main>

            {/* Right Sidebar */}
            <aside className="hidden xl:block w-56 shrink-0">
              <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-8 px-6">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  On this page
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                      Analytics Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="#insights" className="text-muted-foreground hover:text-foreground transition-colors">
                      Customer Insights
                    </a>
                  </li>
                  <li>
                    <a href="#sales" className="text-muted-foreground hover:text-foreground transition-colors">
                      Sales Tracking
                    </a>
                  </li>
                  <li>
                    <a href="#reports" className="text-muted-foreground hover:text-foreground transition-colors">
                      Reports & Exports
                    </a>
                  </li>
                  <li className="pt-2 border-t border-border mt-2">
                    <a href="#ecommerce" className="text-muted-foreground hover:text-foreground transition-colors">
                      E-commerce
                    </a>
                  </li>
                  <li>
                    <a href="#email" className="text-muted-foreground hover:text-foreground transition-colors">
                      Email Marketing
                    </a>
                  </li>
                  <li className="pt-2 border-t border-border mt-2">
                    <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                      Contact Us
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
