import React from "react";
import { Header } from "./sections/Header";

function BlogPageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header transition />
      <main id="main" className="relative mx-auto w-full max-w-full overflow-x-hidden px-2 pt-12 md:max-w-3xl md:overflow-x-visible md:px-0">
        <div className="w-full">{children}</div>
      </main>
    </>
  );
}

export default BlogPageShell;
