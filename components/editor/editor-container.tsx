"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EditorContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function EditorContainer({
  children,
  className,
  ...props
}: EditorContainerProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
