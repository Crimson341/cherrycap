"use client";

import * as React from "react";
import Link from "next/link";
import type { ReactElement } from "react";
import { useTheme } from "next-themes";
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/nextjs";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Bot,
  BarChart3,
  Globe,
  LayoutGrid,
  PenTool,
  Smile,
  Sparkles,
  Users,
  TrendingUp,
  MessageSquare,
  Mail,
  ShoppingCart,
  FileText,
  Zap,
  Target,
  Monitor,
  Moon,
  Sun,
  CirclePlus,
  LogOut,
  Headphones,
  Calendar,
  DollarSign,
  PieChart,
  Search,
  Image,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { useState, useCallback, useEffect } from "react";

// Products - Core offerings
const products: {
  title: string;
  icon: ReactElement;
  href: string;
  description: string;
}[] = [
  {
    title: "Analytics Dashboard",
    href: "/custom-solutions",
    icon: <BarChart3 strokeWidth={2} className="h-4 w-4" />,
    description: "Track your business metrics in real-time",
  },
  {
    title: "Customer Insights",
    href: "/custom-solutions",
    icon: <Users strokeWidth={2} className="h-4 w-4" />,
    description: "Understand your customers better",
  },
  {
    title: "Sales Tracking",
    href: "/custom-solutions",
    icon: <TrendingUp strokeWidth={2} className="h-4 w-4" />,
    description: "Monitor revenue and growth",
  },
  {
    title: "Reports & Exports",
    href: "/custom-solutions",
    icon: <FileText strokeWidth={2} className="h-4 w-4" />,
    description: "Generate beautiful business reports",
  },
];

const integrations: {
  title: string;
  icon: ReactElement;
  href: string;
  description: string;
}[] = [
  {
    title: "E-commerce",
    href: "/custom-solutions",
    icon: <ShoppingCart strokeWidth={2} className="h-4 w-4" />,
    description: "Shopify, WooCommerce, Stripe",
  },
  {
    title: "Marketing",
    href: "#",
    icon: <Megaphone strokeWidth={2} className="h-4 w-4" />,
    description: "Google Ads, Meta, TikTok",
  },
  {
    title: "CRM",
    href: "#",
    icon: <Users strokeWidth={2} className="h-4 w-4" />,
    description: "HubSpot, Salesforce, Zoho",
  },
  {
    title: "Email",
    href: "/custom-solutions",
    icon: <Mail strokeWidth={2} className="h-4 w-4" />,
    description: "Mailchimp, Klaviyo, SendGrid",
  },
];

// Tools for small businesses
const businessTools: {
  title: string;
  icon: ReactElement;
  href: string;
  description: string;
}[] = [
  {
    title: "Invoice Generator",
    href: "#",
    icon: <DollarSign strokeWidth={2} className="h-4 w-4" />,
    description: "Create professional invoices instantly",
  },
  {
    title: "Appointment Scheduler",
    href: "#",
    icon: <Calendar strokeWidth={2} className="h-4 w-4" />,
    description: "Let customers book time with you",
  },
  {
    title: "Lead Tracker",
    href: "#",
    icon: <Target strokeWidth={2} className="h-4 w-4" />,
    description: "Never lose a potential customer",
  },
  {
    title: "Review Manager",
    href: "#",
    icon: <Smile strokeWidth={2} className="h-4 w-4" />,
    description: "Collect and showcase reviews",
  },
];

const marketingTools: {
  title: string;
  icon: ReactElement;
  href: string;
  description: string;
}[] = [
  {
    title: "Social Scheduler",
    href: "#",
    icon: <Globe strokeWidth={2} className="h-4 w-4" />,
    description: "Plan and post to all platforms",
  },
  {
    title: "Email Campaigns",
    href: "#",
    icon: <Mail strokeWidth={2} className="h-4 w-4" />,
    description: "Reach your customers inbox",
  },
  {
    title: "Landing Pages",
    href: "#",
    icon: <LayoutGrid strokeWidth={2} className="h-4 w-4" />,
    description: "Build pages that convert",
  },
  {
    title: "Analytics",
    href: "#",
    icon: <PieChart strokeWidth={2} className="h-4 w-4" />,
    description: "See what's working",
  },
];

// AI Tools for small businesses
const aiAssistants: {
  title: string;
  icon: ReactElement;
  href: string;
  description: string;
}[] = [
  {
    title: "AI Chatbot",
    href: "/ai",
    icon: <MessageSquare strokeWidth={2} className="h-4 w-4" />,
    description: "24/7 customer support on autopilot",
  },
  {
    title: "AI Copywriter",
    href: "#",
    icon: <PenTool strokeWidth={2} className="h-4 w-4" />,
    description: "Write ads, emails & posts in seconds",
  },
  {
    title: "AI Image Creator",
    href: "#",
    icon: <Image strokeWidth={2} className="h-4 w-4" />,
    description: "Generate product & marketing images",
  },
  {
    title: "AI Insights",
    href: "#",
    icon: <Sparkles strokeWidth={2} className="h-4 w-4" />,
    description: "Get smart recommendations",
  },
];

const aiAutomation: {
  title: string;
  icon: ReactElement;
  href: string;
  description: string;
}[] = [
  {
    title: "Smart Replies",
    href: "/ai",
    icon: <Zap strokeWidth={2} className="h-4 w-4" />,
    description: "Auto-respond to common questions",
  },
  {
    title: "SEO Assistant",
    href: "#",
    icon: <Search strokeWidth={2} className="h-4 w-4" />,
    description: "Rank higher on Google",
  },
  {
    title: "Sales Assistant",
    href: "/ai",
    icon: <Bot strokeWidth={2} className="h-4 w-4" />,
    description: "Qualify leads automatically",
  },
];

// Solutions by business type
const solutions: {
  title: string;
  icon: ReactElement;
  href: string;
  description: string;
}[] = [
  {
    title: "Retail & E-commerce",
    href: "#",
    icon: <ShoppingCart strokeWidth={2} className="h-4 w-4" />,
    description: "Sell more online and in-store",
  },
  {
    title: "Restaurants & Cafes",
    href: "/restaurants-cafes",
    icon: <Smile strokeWidth={2} className="h-4 w-4" />,
    description: "Reservations, orders & loyalty",
  },
  {
    title: "Service Businesses",
    href: "#",
    icon: <Calendar strokeWidth={2} className="h-4 w-4" />,
    description: "Bookings and client management",
  },
  {
    title: "Agencies & Freelancers",
    href: "#",
    icon: <Megaphone strokeWidth={2} className="h-4 w-4" />,
    description: "Manage clients and projects",
  },
];

const resources: {
  title: string;
  icon: ReactElement;
  href: string;
  description: string;
}[] = [
  {
    title: "Help Center",
    href: "#",
    icon: <Headphones strokeWidth={2} className="h-4 w-4" />,
    description: "Get answers fast",
  },
  {
    title: "Success Stories",
    href: "#",
    icon: <TrendingUp strokeWidth={2} className="h-4 w-4" />,
    description: "See how others grew",
  },
  {
    title: "Blog",
    href: "/blog",
    icon: <FileText strokeWidth={2} className="h-4 w-4" />,
    description: "Tips to grow your business",
  },
];

// CherryCap Logo Component
function CherryCapLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-5 w-5 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-500" />
      <span className="font-semibold text-lg text-foreground">CherryCap</span>
    </div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`flex sticky px-4 z-50 top-0 w-full items-center h-16 justify-between transition-all duration-300 backdrop-blur-md ${
        scrolled ? "bg-background/80 border-b border-border" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="flex items-center justify-between w-full mx-auto max-w-7xl">
        <div className="flex h-14 justify-center items-center">
          <Link href="/">
            <CherryCapLogo className="h-14" />
          </Link>
          <NavigationMenu className="ml-8 hidden lg:flex" viewport={true}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent font-normal text-muted-foreground"
                  )}
                >
                  Products
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background/95 backdrop-blur-md">
                  <ul className="grid w-[400px] pt-2 grid-cols-2 md:w-[550px]">
                    <div>
                      <span className="p-4 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        Dashboard & Analytics
                      </span>
                      {products.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          icon={component.icon}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </div>
                    <div>
                      <span className="p-4 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        Integrations
                      </span>
                      {integrations.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          icon={component.icon}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </div>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent font-normal text-muted-foreground"
                  )}
                >
                  Tools
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background/95 backdrop-blur-md">
                  <ul className="grid w-[400px] pt-2 grid-cols-2 md:w-[550px]">
                    <div>
                      <span className="p-4 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        Business Tools
                      </span>
                      {businessTools.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          icon={component.icon}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </div>
                    <div>
                      <span className="p-4 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        Marketing Tools
                      </span>
                      {marketingTools.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          icon={component.icon}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </div>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent font-normal text-muted-foreground"
                  )}
                >
                  AI Tools
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background/95 backdrop-blur-md">
                  <ul className="grid w-[400px] pt-2 grid-cols-2 md:w-[550px]">
                    <div>
                      <span className="p-4 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        AI Assistants
                      </span>
                      {aiAssistants.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          icon={component.icon}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </div>
                    <div>
                      <span className="p-4 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        Automation
                      </span>
                      {aiAutomation.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          icon={component.icon}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </div>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent font-normal text-muted-foreground"
                  )}
                >
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background/95 backdrop-blur-md">
                  <ul className="grid w-[400px] pt-2 grid-cols-2 md:w-[550px]">
                    <div>
                      <span className="p-4 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        By Industry
                      </span>
                      {solutions.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          icon={component.icon}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </div>
                    <div>
                      <span className="p-4 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        Resources
                      </span>
                      {resources.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          icon={component.icon}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </div>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent font-normal text-muted-foreground"
                  )}
                >
                  <Link href="#">Pricing</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent font-normal text-muted-foreground"
                  )}
                >
                  <Link href="/blog">Blog</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex gap-2 items-center">
          <AnimatedThemeToggle className="mr-2" />
          {isSignedIn ? (
            <>
              <Button variant="ghost" size="sm">
                Contact
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="border cursor-pointer">
                    <AvatarImage
                      src={user?.imageUrl || ""}
                      alt={user?.fullName || "User"}
                    />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-70 p-3 rounded-xl" align="end">
                  <div className="p-2">
                    <h1 className="font-semibold">{user?.fullName || "User"}</h1>
                    <p className="text-sm text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
                    </p>
                  </div>
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="py-3" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-3">
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-3 justify-between">
                      Invite Team <CirclePlus strokeWidth={2} className="h-4 w-4" />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="-mx-3" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="py-3 justify-between">
                      Theme <ThemeSwitcher />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="-mx-3" />

                  <DropdownMenuItem 
                    className="py-3 justify-between cursor-pointer"
                    onClick={() => signOut({ redirectUrl: "/" })}
                  >
                    Logout <LogOut strokeWidth={2} className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="-mx-3" />
                  <DropdownMenuItem className="pt-3">
                    <Button className="w-full">Upgrade to Pro</Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ListItem({
  title,
  icon,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string;
  icon: ReactElement;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild className="hover:bg-transparent">
        <Link href={href}>
          <div className="flex gap-3 items-start rounded-md p-2 group">
            <div className="border rounded-sm p-2 transition-all duration-200 group-hover:bg-foreground group-hover:text-background group-hover:scale-105">
              {icon}
            </div>
            <div>
              <div className="text-sm font-medium leading-none group-hover:text-foreground transition-colors">
                {title}
              </div>
              <p className="text-muted-foreground line-clamp-2 pt-1 text-xs leading-snug group-hover:text-foreground transition-colors">
                {children}
              </p>
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

const themes = [
  {
    key: "system",
    icon: Monitor,
    label: "System theme",
  },
  {
    key: "light",
    icon: Sun,
    label: "Light theme",
  },
  {
    key: "dark",
    icon: Moon,
    label: "Dark theme",
  },
];

export type ThemeSwitcherProps = {
  value?: "light" | "dark" | "system";
  onChange?: (theme: "light" | "dark" | "system") => void;
  defaultValue?: "light" | "dark" | "system";
  className?: string;
};

const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const handleThemeClick = useCallback(
    (themeKey: "light" | "dark" | "system") => {
      setTheme(themeKey);
    },
    [setTheme]
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative isolate flex h-7 rounded-full bg-background p-1 ring-1 ring-border",
        className
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <button
            aria-label={label}
            className="relative h-5 w-6 rounded-full"
            key={key}
            onClick={() => handleThemeClick(key as "light" | "dark" | "system")}
            type="button"
          >
            {isActive && (
              <div className="absolute inset-0 rounded-full bg-secondary" />
            )}
            <Icon
              className={cn(
                "relative z-10 m-auto h-3.5 w-3.5",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
