import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    return [
      {
        source: "/blog/",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/blog/:slug/",
        destination: "/blog/:slug",
        permanent: true,
      },
      {
        source: "/signin/",
        destination: "/signin",
        permanent: true,
      },
      {
        source: "/dashboard/",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/giveaway-rules/",
        destination: "/giveaway-rules",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
