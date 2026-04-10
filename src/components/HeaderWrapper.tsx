"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";

export function HeaderClientWrapper(props: React.ComponentProps<"header">) {
  const { scrollY } = useScroll();

  const [affix, setAffix] = useState(false);

  useMotionValueEvent(scrollY, "change", (latestValue) => {
    setAffix(latestValue >= 8);
  });

  return <header data-affix={affix} {...props} />;
}