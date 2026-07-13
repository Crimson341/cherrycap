import type { MetadataRoute } from "next";

import { portfolioConfig } from "@/lib/portfolioConfig";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: portfolioConfig.name,
    short_name: "Cherry Capital",
    description: portfolioConfig.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "en-US",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
