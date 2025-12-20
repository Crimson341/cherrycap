"use client";

import { Copy, ExternalLink, GitPullRequest, Maximize2 } from "lucide-react";
import { MeshGradient, Dithering } from "@paper-design/shaders-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const releases = [
  {
    title: "v3.0.0: Major UI Refresh & New Integrations",
    date: "May 15, 2025",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=700&fit=crop",
    excerpt:
      "This major release introduces a redesigned interface for a more intuitive experience, plus integrations with leading third-party platforms.",
    contributors: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face",
    ],
    content: (
      <div className="prose prose-invert prose-sm max-w-none">
        <h3 className="text-white">Refreshed User Interface</h3>
        <p className="text-zinc-400">
          A lighter, faster UI with improved accessibility and responsiveness.
        </p>
        <ul className="text-zinc-400">
          <li>New typography and icon system</li>
          <li>Reorganized navigation and controls</li>
          <li>Configurable dashboard panels</li>
        </ul>
        <h4 className="text-white">Enhanced Integrations</h4>
        <p className="text-zinc-400">
          Seamless connections for Slack, Drive, and Trello to boost workflow
          efficiency.
        </p>
      </div>
    ),
  },
  {
    title: "v2.9.5: Performance Boost & API Enhancements",
    date: "April 02, 2025",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
    excerpt:
      "This release brings a performance overhaul and introduces new API endpoints for advanced analytics and automation.",
    contributors: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&crop=face",
    ],
    content: (
      <div className="prose prose-invert prose-sm max-w-none">
        <h3 className="text-white">Performance Overhaul</h3>
        <ul className="text-zinc-400">
          <li>Reduced load time by 35%</li>
          <li>Improved caching and query batching</li>
          <li>Faster image preloading</li>
        </ul>
        <h4 className="text-white">API Enhancements</h4>
        <ul className="text-zinc-400">
          <li>New analytics endpoints</li>
          <li>Improved role-based permissions</li>
          <li>Expanded webhooks for automation</li>
        </ul>
      </div>
    ),
  },
  {
    title: "v2.9.0: Dark Mode & Accessibility Updates",
    date: "March 10, 2025",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=700&fit=crop",
    excerpt:
      "Introducing system-wide dark mode support and significant accessibility improvements for screen readers and keyboard navigation.",
    contributors: [
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=96&h=96&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=96&h=96&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=96&h=96&fit=crop&crop=face",
    ],
    content: (
      <div className="prose prose-invert prose-sm max-w-none">
        <h3 className="text-white">Dark Mode</h3>
        <p className="text-zinc-400">
          Full dark mode support with automatic system preference detection.
        </p>
        <ul className="text-zinc-400">
          <li>Seamless theme switching</li>
          <li>Reduced eye strain in low-light conditions</li>
          <li>Consistent color palette across all components</li>
        </ul>
        <h4 className="text-white">Accessibility Improvements</h4>
        <ul className="text-zinc-400">
          <li>Enhanced screen reader support</li>
          <li>Improved keyboard navigation</li>
          <li>Better focus indicators</li>
        </ul>
      </div>
    ),
  },
];

export function Changelog() {
  return (
    <section className="relative w-full overflow-hidden bg-black min-h-screen">
      {/* shader header full-width */}
      <div className="relative w-full overflow-hidden h-64">
        <MeshGradient
          colors={["#5b00ff", "#00ffa3", "#ff9a00", "#ea00ff"]}
          swirl={0.55}
          distortion={0.85}
          speed={0.1}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        <Dithering
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "overlay", opacity: 0.3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />

        <div className="relative container mx-auto px-4 py-12 text-left h-full flex items-end pb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <GitPullRequest className="size-4" />
              <p>Changelog</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white leading-snug">
              Latest Enhancements
              <br /> & Platform News
            </h1>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="grid justify-center container mx-auto px-4 border-x border-zinc-800">
        {releases.map((item, idx) => (
          <Dialog key={idx}>
            <div className="relative flex flex-col lg:flex-row w-full py-16 gap-6 lg:gap-0">
              <div className="lg:sticky top-2 h-fit">
                <time className="text-zinc-500 w-36 text-sm font-medium lg:absolute">
                  {item.date}
                </time>
              </div>

              <div className="flex max-w-prose flex-col gap-4 lg:mx-auto">
                <h3 className="text-2xl md:text-3xl font-medium text-white lg:pt-10">
                  {item.title}
                </h3>
                <DialogTrigger asChild>
                  <div className="relative cursor-pointer group">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="border-zinc-800 max-h-96 w-full rounded-lg border object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
                        <Maximize2 className="size-6 text-white" />
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <p className="text-zinc-400 text-sm font-medium">
                  {item.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center -space-x-2">
                      {item.contributors.slice(0, 3).map((src, id) => (
                        <img
                          key={id}
                          src={src}
                          alt="Contributor"
                          className="border-zinc-800 size-6 rounded-full border-2 border-black object-cover"
                        />
                      ))}
                    </div>
                    {item.contributors.length > 3 && (
                      <span className="text-zinc-500 text-sm font-medium ml-2">
                        +{item.contributors.length - 3} contributors
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                              <Maximize2 className="size-4" />
                            </Button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Show full release</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <Copy className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy link</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <ExternalLink className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open in new tab</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800 absolute bottom-0 left-0 right-0 h-px w-[200vw] -translate-x-1/2" />
            </div>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-prose bg-zinc-900 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-left text-white">{item.title}</DialogTitle>
                <DialogDescription className="text-left text-zinc-400">
                  {item.excerpt}
                </DialogDescription>
              </DialogHeader>
              <img
                src={item.image}
                alt={item.title}
                className="border-zinc-800 max-h-96 w-full rounded-lg border object-cover"
              />
              {item.content}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </section>
  );
}

export { Changelog as Component };
