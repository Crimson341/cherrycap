"use client";

import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

export function GridBackground() {
  return (
    <AnimatedGridPattern
      width={40}
      height={40}
      numSquares={30}
      maxOpacity={0.3}
      duration={4}
      className="fixed inset-0 z-0"
    />
  );
}
