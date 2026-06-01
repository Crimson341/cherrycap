import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@/convex": path.resolve(__dirname, "convex"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}", "convex/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "opensrc", "video-seo-showcase", ".next"],
  },
});
