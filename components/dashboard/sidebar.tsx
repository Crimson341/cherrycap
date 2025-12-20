"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  User,
  FileText,
  LayoutGrid,
  UtensilsCrossed,
  Users,
  Bot,
  Settings,
  LogOut,
  ChevronsUpDown,
  Building2,
  Plus,
  Sparkles,
  HelpCircle,
  Palette,
  QrCode,
  CreditCard,
  Calendar,
  Coins,
  Pin,
  PinOff,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "3.5rem" },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const textVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { x: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: { x: { stiffness: 100 } },
  },
};

const transitionProps = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.2,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

// Navigation items configuration
const mainNavItems = [
  { href: "/dashboard", icon: User, label: "Profile" },
  { href: "/dashboard/blog-editor", icon: FileText, label: "Blog Editor" },
  { href: "/dashboard/kanban", icon: LayoutGrid, label: "Kanban" },
  { href: "/dashboard/menu-maker", icon: UtensilsCrossed, label: "Menu Maker" },
  { href: "/dashboard/team", icon: Users, label: "Team" },
  { href: "/dashboard/brand", icon: Palette, label: "Brand Context" },
  { href: "/dashboard/credits", icon: Coins, label: "AI Credits" },
];

const toolsNavItems = [
  { href: "/chat", icon: Bot, label: "AI Assistant", badge: "NEW" },
  { href: "/ai", icon: Sparkles, label: "AI for Your Site", badge: "NEW" },
  { href: "/dashboard/qr-studio", icon: QrCode, label: "QR Studio", badge: "NEW" },
];

// Admin-only nav items
const ADMIN_EMAIL = "scottheney68@gmail.com";
const adminNavItems = [
  { href: "/dashboard/calendar", icon: Calendar, label: "AI Calendar", badge: "NEW" },
];

// All pinnable items (combined for lookup)
const allNavItems = [...mainNavItems, ...toolsNavItems, ...adminNavItems];

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Fetch user's organizations
  const organizations = useQuery(
    api.organizations.listForUser,
    user?.id ? { userId: user.id } : "skip"
  );

  // Fetch pinned items
  const pinnedItems = useQuery(api.userProfiles.getPinnedItems) ?? [];
  const pinItem = useMutation(api.userProfiles.pinItem);
  const unpinItem = useMutation(api.userProfiles.unpinItem);

  const currentOrg = organizations?.[0];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  const isPinned = (href: string) => pinnedItems.includes(href);

  const handlePin = async (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await pinItem({ href });
  };

  const handleUnpin = async (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await unpinItem({ href });
  };

  // Get pinned nav items with their full data
  const pinnedNavItems = pinnedItems
    .map((href) => allNavItems.find((item) => item.href === href))
    .filter(Boolean) as typeof allNavItems;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const showLabels = isMobile || !isCollapsed;

    return (
      <motion.div
        className="relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-neutral-950 transition-all"
        variants={!isMobile ? contentVariants : undefined}
      >
        <motion.ul variants={!isMobile ? staggerVariants : undefined} className="flex h-full flex-col">
          <div className="flex grow flex-col">
            {/* Logo & Organization Switcher */}
            <div className="flex h-14 w-full shrink-0 border-b border-neutral-800/50 p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2.5 px-2 hover:bg-neutral-800/50"
                    >
                      {/* CherryCap Logo */}
                      <div className="size-6 rounded-lg bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 shadow-lg shadow-rose-500/20 shrink-0" />
                      {isMobile ? (
                        <div className="flex w-fit items-center gap-2">
                          <p className="text-sm font-semibold text-white">
                            {currentOrg?.name || "CherryCap"}
                          </p>
                          <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-500" />
                        </div>
                      ) : (
                        <motion.li
                          variants={textVariants}
                          className="flex w-fit items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-semibold text-white">
                                {currentOrg?.name || "CherryCap"}
                              </p>
                              <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-500" />
                            </>
                          )}
                        </motion.li>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-neutral-900 border-neutral-800">
                    {organizations?.map((org) => org && (
                      <DropdownMenuItem key={org._id} className="flex items-center gap-2 text-white hover:bg-neutral-800">
                        <div
                          className="size-5 rounded flex items-center justify-center shrink-0"
                          style={{ backgroundColor: org.brandColor || "#e11d48" }}
                        >
                          <Building2 className="h-3 w-3 text-white" />
                        </div>
                        <span className="truncate">{org.name}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <DropdownMenuItem asChild className="text-neutral-400 hover:bg-neutral-800 hover:text-white">
                      <Link href="/dashboard/team" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create organization
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-0.5")}>
                    {/* Pinned Items Section */}
                    {pinnedNavItems.length > 0 && (
                      <>
                        {showLabels && (
                          isMobile ? (
                            <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                              Pinned
                            </p>
                          ) : (
                            <motion.p
                              variants={textVariants}
                              className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-600"
                            >
                              Pinned
                            </motion.p>
                          )
                        )}
                        {pinnedNavItems.map((item) => (
                          <div
                            key={`pinned-${item.href}`}
                            className="group relative"
                            onMouseEnter={() => setHoveredItem(`pinned-${item.href}`)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <Link
                              href={item.href}
                              className={cn(
                                "flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 transition-all",
                                isActive(item.href)
                                  ? "bg-rose-500/10 text-rose-400"
                                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                              )}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              {isMobile ? (
                                <div className="ml-2.5 flex items-center gap-2">
                                  <p className="text-sm font-medium">{item.label}</p>
                                </div>
                              ) : (
                                <motion.li variants={textVariants} className="flex-1">
                                  {!isCollapsed && (
                                    <div className="ml-2.5 flex items-center gap-2">
                                      <p className="text-sm font-medium">{item.label}</p>
                                    </div>
                                  )}
                                </motion.li>
                              )}
                            </Link>
                            {showLabels && hoveredItem === `pinned-${item.href}` && (
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => handleUnpin(item.href, e)}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-neutral-700 text-neutral-500 hover:text-rose-400 transition-colors"
                                    >
                                      <PinOff className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="bg-neutral-800 text-white border-neutral-700">
                                    Unpin
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        ))}
                        <Separator className="my-2 bg-neutral-800/50" />
                      </>
                    )}

                    {/* Main Nav Items */}
                    {mainNavItems.map((item) => (
                      <div
                        key={item.href}
                        className="group relative"
                        onMouseEnter={() => setHoveredItem(item.href)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 transition-all",
                            isActive(item.href)
                              ? "bg-rose-500/10 text-rose-400"
                              : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {isMobile ? (
                            <p className="ml-2.5 text-sm font-medium">{item.label}</p>
                          ) : (
                            <motion.li variants={textVariants} className="flex-1">
                              {!isCollapsed && (
                                <p className="ml-2.5 text-sm font-medium">{item.label}</p>
                              )}
                            </motion.li>
                          )}
                        </Link>
                        {showLabels && hoveredItem === item.href && !isPinned(item.href) && (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => handlePin(item.href, e)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-neutral-700 text-neutral-500 hover:text-rose-400 transition-colors"
                                >
                                  <Pin className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-neutral-800 text-white border-neutral-700">
                                Pin to top
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ))}

                    <Separator className="my-2 bg-neutral-800/50" />

                    {/* Tools Section */}
                    {showLabels && (
                      isMobile ? (
                        <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                          Tools
                        </p>
                      ) : (
                        <motion.p
                          variants={textVariants}
                          className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-600"
                        >
                          Tools
                        </motion.p>
                      )
                    )}

                    {toolsNavItems.map((item) => (
                      <div
                        key={item.href}
                        className="group relative"
                        onMouseEnter={() => setHoveredItem(item.href)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 transition-all",
                            isActive(item.href)
                              ? "bg-rose-500/10 text-rose-400"
                              : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {isMobile ? (
                            <div className="ml-2.5 flex items-center gap-2">
                              <p className="text-sm font-medium">{item.label}</p>
                              {item.badge && (
                                <Badge
                                  className="h-4 px-1 text-[9px] font-semibold border-none bg-rose-500/10 text-rose-400"
                                  variant="outline"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <motion.li variants={textVariants} className="flex-1">
                              {!isCollapsed && (
                                <div className="ml-2.5 flex items-center gap-2">
                                  <p className="text-sm font-medium">{item.label}</p>
                                  {item.badge && (
                                    <Badge
                                      className="h-4 px-1 text-[9px] font-semibold border-none bg-rose-500/10 text-rose-400"
                                      variant="outline"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </motion.li>
                          )}
                        </Link>
                        {showLabels && hoveredItem === item.href && !isPinned(item.href) && (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => handlePin(item.href, e)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-neutral-700 text-neutral-500 hover:text-rose-400 transition-colors"
                                >
                                  <Pin className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-neutral-800 text-white border-neutral-700">
                                Pin to top
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ))}

                    {/* Admin-only Section */}
                    {user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL && (
                      <>
                        <Separator className="my-2 bg-neutral-800/50" />
                        {showLabels && (
                          isMobile ? (
                            <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                              Admin
                            </p>
                          ) : (
                            <motion.p
                              variants={textVariants}
                              className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-600"
                            >
                              Admin
                            </motion.p>
                          )
                        )}
                        {adminNavItems.map((item) => (
                          <div
                            key={item.href}
                            className="group relative"
                            onMouseEnter={() => setHoveredItem(item.href)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <Link
                              href={item.href}
                              className={cn(
                                "flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 transition-all",
                                isActive(item.href)
                                  ? "bg-rose-500/10 text-rose-400"
                                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                              )}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              {isMobile ? (
                                <div className="ml-2.5 flex items-center gap-2">
                                  <p className="text-sm font-medium">{item.label}</p>
                                  {item.badge && (
                                    <Badge
                                      className="h-4 px-1 text-[9px] font-semibold border-none bg-rose-500/10 text-rose-400"
                                      variant="outline"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <motion.li variants={textVariants} className="flex-1">
                                  {!isCollapsed && (
                                    <div className="ml-2.5 flex items-center gap-2">
                                      <p className="text-sm font-medium">{item.label}</p>
                                      {item.badge && (
                                        <Badge
                                          className="h-4 px-1 text-[9px] font-semibold border-none bg-rose-500/10 text-rose-400"
                                          variant="outline"
                                        >
                                          {item.badge}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </motion.li>
                              )}
                            </Link>
                            {showLabels && hoveredItem === item.href && !isPinned(item.href) && (
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => handlePin(item.href, e)}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-neutral-700 text-neutral-500 hover:text-rose-400 transition-colors"
                                    >
                                      <Pin className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="bg-neutral-800 text-white border-neutral-700">
                                    Pin to top
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Bottom Section */}
              <div className="flex flex-col p-2 border-t border-neutral-800/50">
                {/* Help */}
                <Link
                  href="/help"
                  className="flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 text-neutral-500 transition-all hover:bg-neutral-800/50 hover:text-white"
                >
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  {isMobile ? (
                    <p className="ml-2.5 text-sm font-medium">Help & Support</p>
                  ) : (
                    <motion.li variants={textVariants}>
                      {!isCollapsed && (
                        <p className="ml-2.5 text-sm font-medium">Help & Support</p>
                      )}
                    </motion.li>
                  )}
                </Link>

                {/* Settings */}
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 transition-all",
                    pathname?.includes("/settings")
                      ? "bg-rose-500/10 text-rose-400"
                      : "text-neutral-500 hover:bg-neutral-800/50 hover:text-white"
                  )}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  {isMobile ? (
                    <p className="ml-2.5 text-sm font-medium">Settings</p>
                  ) : (
                    <motion.li variants={textVariants}>
                      {!isCollapsed && (
                        <p className="ml-2.5 text-sm font-medium">Settings</p>
                      )}
                    </motion.li>
                  )}
                </Link>

                {/* Billing */}
                <Link
                  href="/dashboard/billing"
                  className={cn(
                    "flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 transition-all",
                    pathname?.includes("/billing")
                      ? "bg-rose-500/10 text-rose-400"
                      : "text-neutral-500 hover:bg-neutral-800/50 hover:text-white"
                  )}
                >
                  <CreditCard className="h-4 w-4 shrink-0" />
                  {isMobile ? (
                    <p className="ml-2.5 text-sm font-medium">Billing</p>
                  ) : (
                    <motion.li variants={textVariants}>
                      {!isCollapsed && (
                        <p className="ml-2.5 text-sm font-medium">Billing</p>
                      )}
                    </motion.li>
                  )}
                </Link>

                {/* User Account */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full">
                    <div className="flex h-10 w-full flex-row items-center gap-2.5 rounded-lg px-2.5 py-2 mt-1 transition-all hover:bg-neutral-800/50">
                      <Avatar className="size-6 ring-2 ring-neutral-800">
                        <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                        <AvatarFallback className="bg-neutral-800 text-white text-xs">
                          {user?.firstName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isMobile ? (
                        <div className="flex w-full items-center gap-2">
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {user?.fullName || user?.firstName || "Account"}
                            </p>
                          </div>
                          <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                        </div>
                      ) : (
                        <motion.li
                          variants={textVariants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {user?.fullName || user?.firstName || "Account"}
                                </p>
                              </div>
                              <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                            </>
                          )}
                        </motion.li>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={8} align="start" className="w-56 bg-neutral-900 border-neutral-800">
                    <div className="flex flex-row items-center gap-2.5 p-2">
                      <Avatar className="size-8 ring-2 ring-neutral-800">
                        <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                        <AvatarFallback className="bg-neutral-800 text-white text-sm">
                          {user?.firstName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-sm font-medium text-white truncate">
                          {user?.fullName || user?.firstName || "User"}
                        </span>
                        <span className="text-xs text-neutral-500 truncate">
                          {user?.primaryEmailAddress?.emailAddress || ""}
                        </span>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <DropdownMenuItem asChild className="text-neutral-300 hover:bg-neutral-800 hover:text-white">
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-neutral-300 hover:bg-neutral-800 hover:text-white">
                      <Link href="/dashboard/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-neutral-300 hover:bg-neutral-800 hover:text-white">
                      <Link href="/dashboard/team" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <DropdownMenuItem
                      className="text-neutral-300 hover:bg-neutral-800 hover:text-white"
                      onClick={() => signOut({ redirectUrl: "/" })}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden h-10 w-10 flex items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="fixed left-0 top-0 z-50 h-full w-72 border-r border-neutral-800/50 md:hidden"
          >
            {/* Close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 z-10 h-8 w-8 flex items-center justify-center rounded-lg bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent isMobile={true} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        className="sidebar fixed left-0 z-40 h-full shrink-0 border-r border-neutral-800/50 hidden md:block"
        initial={isCollapsed ? "closed" : "open"}
        animate={isCollapsed ? "closed" : "open"}
        variants={sidebarVariants}
        transition={transitionProps}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <SidebarContent isMobile={false} />
      </motion.div>
    </>
  );
}
