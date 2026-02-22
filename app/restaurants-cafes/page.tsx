"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/ui/vercel-navbar";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/blocks/footer-section").then(m => m.Footer));
const CanvasRevealEffect = dynamic(() => import("@/components/blocks/sign-in-flow-1").then(m => m.CanvasRevealEffect), { ssr: false });
import { 
  ChevronRight,
  Coffee,
  Flower2,
  Mountain,
  Megaphone,
  BarChart3,
  Globe,
  Smartphone,
  Users,
  ArrowRight,
  MapPin,
  Clock,
  Star,
  Gift,
  Soup,
  Cake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";

const navigation = [
  {
    title: "Our Cafes",
    items: [
      { title: "Petals and Perks", href: "#petals-and-perks", icon: Flower2 },
      { title: "Hilltop", href: "#hilltop", icon: Mountain },
    ]
  },
  {
    title: "How We Help",
    items: [
      { title: "Digital Presence", href: "#digital-presence", icon: Globe },
      { title: "Marketing", href: "#marketing", icon: Megaphone },
      { title: "Technology", href: "#technology", icon: Smartphone },
    ]
  },
  {
    title: "Get Started",
    items: [
      { title: "Partner With Us", href: "#partner", icon: Users },
    ]
  }
];

const cafes = [
  {
    id: "petals-and-perks",
    name: "Petals and Perks",
    tagline: "A unique gift shop and coffee house",
    description: "Petals and Perks brings together the best of both worlds—a charming gift shop featuring full floral design services and Michigan-themed products from local artisans, alongside a cozy coffee house serving premium drinks and house-made treats. Using Higher Grounds fair trade organic coffee roasted right in Traverse City, every cup is crafted with care.",
    icon: Flower2,
    color: "amber",
    offerings: [
      { icon: Coffee, label: "Premium Coffee & Tea", desc: "Higher Grounds organic coffee, Light of Day teas" },
      { icon: Cake, label: "Fresh Baked Goods", desc: "House-made daily with local ingredients" },
      { icon: Soup, label: "Homemade Soups", desc: "Warm, comforting, made from scratch" },
      { icon: Gift, label: "Local Gifts & Florals", desc: "Michigan artisans, full floral services" },
    ],
    features: [
      "Cozy atmosphere",
      "Michigan artisan products",
      "Full floral design services",
      "House-made everything",
    ],
    hours: "7am - 6pm Daily",
    location: "Frankfort, MI",
  },
  {
    id: "hilltop",
    name: "Hilltop",
    tagline: "Coffee with a view",
    description: "Perched with stunning views of the Northern Michigan landscape, Hilltop offers a serene escape with premium coffee and a welcoming atmosphere. The perfect destination for locals and visitors alike seeking quality and tranquility.",
    icon: Mountain,
    color: "emerald",
    offerings: [
      { icon: Coffee, label: "Premium Coffee", desc: "Carefully sourced and roasted" },
    ],
    features: [
      "Scenic views",
      "Cozy indoor seating",
      "Local art displays",
      "Community gathering space",
    ],
    hours: "6am - 5pm Daily",
    location: "Northern Michigan",
  },
];

const strategies = [
  {
    id: "digital-presence",
    title: "Digital Presence",
    icon: Globe,
    color: "blue",
    description: "In today's world, your online presence is often the first impression. We help local cafes and restaurants stand out with modern, fast, mobile-friendly websites that capture their unique character.",
    services: [
      "Custom website design & development",
      "Menu displays with easy updates",
      "Online ordering integration",
      "Google Business optimization",
      "Photo & content strategy",
    ],
  },
  {
    id: "marketing",
    title: "Marketing & Growth",
    icon: Megaphone,
    color: "rose",
    description: "From social media to email campaigns, we help cafes reach more customers and build lasting relationships with their community. Local marketing that actually works.",
    services: [
      "Social media management",
      "Email newsletter campaigns",
      "Loyalty program setup",
      "Event promotion",
      "Review management",
    ],
  },
  {
    id: "technology",
    title: "Technology Solutions",
    icon: Smartphone,
    color: "violet",
    description: "Streamline operations and enhance customer experience with the right technology. We help implement systems that save time, reduce errors, and give you insights into your business.",
    services: [
      "POS system integration",
      "Inventory management",
      "Customer analytics",
      "Reservation systems",
      "Automation & efficiency tools",
    ],
  },
];

export default function RestaurantsCafesPage() {
  const [activeSection, setActiveSection] = useState("pedals-and-perks");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "pedals-and-perks";
      
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
    };
    return colors[color] || colors.amber;
  };

  return (
    <>
      <JsonLd
        type="Service"
        data={{
          name: 'Restaurant & Cafe Website Services',
          description: 'Beautiful websites for restaurants, cafes, and food businesses in Northern Michigan. Online menus, ordering, and more.',
          serviceType: 'Restaurant Website Development',
          url: 'https://cherrycapitalweb.com/restaurants-cafes',
        }}
      />
      <div className="flex w-full flex-col min-h-screen bg-background relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-30 dark:opacity-20">
        <CanvasRevealEffect
          animationSpeed={1}
          containerClassName="bg-background"
          colors={[
            [251, 191, 36],
            [16, 185, 129],
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
                                    ? "bg-amber-500/10 text-amber-500 font-medium" 
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
                  <span className="text-foreground">Restaurants & Cafes</span>
                </div>

                {/* Hero */}
                <section className="mb-16">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Coffee className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-sm font-medium text-amber-500">Local Favorites</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Restaurants & Cafes
                    <br />
                    <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 bg-clip-text text-transparent">
                      in Northern Michigan
                    </span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                    Great coffee, community vibes, and the best of Northern Michigan. 
                    Discover our family of cafes and learn how we're helping local 
                    food businesses thrive in the digital age.
                  </p>
                </section>

                {/* Cafes */}
                {cafes.map((cafe) => {
                  const colors = getColorClasses(cafe.color);
                  const Icon = cafe.icon;
                  
                  return (
                    <section key={cafe.id} id={cafe.id} className="mb-16 scroll-mt-20">
                      <div className={`rounded-2xl border ${colors.border} ${colors.bgLight} p-8`}>
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`p-3 rounded-xl ${colors.bgLight}`}>
                            <Icon className={`w-8 h-8 ${colors.text}`} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">{cafe.name}</h2>
                            <p className={`text-sm ${colors.text}`}>{cafe.tagline}</p>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-6">
                          {cafe.description}
                        </p>

                        {/* Offerings */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                          {cafe.offerings.map((offering) => {
                            const OfferingIcon = offering.icon;
                            return (
                              <div key={offering.label} className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border">
                                <OfferingIcon className={`w-5 h-5 ${colors.text} mt-0.5`} />
                                <div>
                                  <p className="font-medium">{offering.label}</p>
                                  <p className="text-sm text-muted-foreground">{offering.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Features */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            What Makes It Special
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {cafe.features.map((feature) => (
                              <span 
                                key={feature}
                                className="px-3 py-1 text-sm rounded-full bg-background border border-border"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{cafe.hours}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{cafe.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span>Part of the CherryCap family</span>
                          </div>
                        </div>
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
                      How We Help Local Businesses
                    </span>
                  </div>
                </div>

                {/* Strategies */}
                {strategies.map((strategy) => {
                  const colors = getColorClasses(strategy.color);
                  const Icon = strategy.icon;
                  
                  return (
                    <section key={strategy.id} id={strategy.id} className="mb-12 scroll-mt-20">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                        <h2 className="text-2xl font-bold">{strategy.title}</h2>
                      </div>
                      
                      <p className="text-muted-foreground mb-6">
                        {strategy.description}
                      </p>

                      <div className="grid gap-2">
                        {strategy.services.map((service) => (
                          <div key={service} className="flex items-start gap-3 py-2">
                            <ChevronRight className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                            <span className="text-muted-foreground">{service}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}

                {/* CTA */}
                <section id="partner" className="mb-16 scroll-mt-20">
                  <div className="rounded-2xl border border-border bg-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6 text-amber-500" />
                      <h2 className="text-2xl font-bold">Partner With Us</h2>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      Running a restaurant, cafe, or food business in Northern Michigan? 
                      We understand the unique challenges of the local market. Let's talk 
                      about how we can help you reach more customers and streamline your 
                      operations.
                    </p>

                    <div className="bg-muted/50 rounded-xl p-6 border border-border mb-6">
                      <div className="flex items-start gap-4">
                        <BarChart3 className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium mb-2">Why work with CherryCap?</p>
                          <p className="text-sm text-muted-foreground">
                            We're local. We understand Northern Michigan's seasonal rhythms, 
                            tourist traffic, and community dynamics. We build solutions that 
                            work for your reality—not some generic template from a company 
                            that's never set foot up north.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-amber-500 hover:bg-amber-600" asChild>
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
                        Free consultation for Northern Michigan food & beverage businesses.
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
                    <a href="#petals-and-perks" className="text-muted-foreground hover:text-foreground transition-colors">
                      Petals and Perks
                    </a>
                  </li>
                  <li>
                    <a href="#hilltop" className="text-muted-foreground hover:text-foreground transition-colors">
                      Hilltop
                    </a>
                  </li>
                  <li className="pt-2 border-t border-border mt-2">
                    <a href="#digital-presence" className="text-muted-foreground hover:text-foreground transition-colors">
                      Digital Presence
                    </a>
                  </li>
                  <li>
                    <a href="#marketing" className="text-muted-foreground hover:text-foreground transition-colors">
                      Marketing
                    </a>
                  </li>
                  <li>
                    <a href="#technology" className="text-muted-foreground hover:text-foreground transition-colors">
                      Technology
                    </a>
                  </li>
                  <li>
                    <a href="#partner" className="text-muted-foreground hover:text-foreground transition-colors">
                      Partner With Us
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
