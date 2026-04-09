import React from "react";

function AboutSection() {
  return (
    <section className="px-4 border-x full-line-bottom relative">
      <h2 className="text-3xl font-semibold relative full-line-bottom ">
        About
      </h2>
      <div className="flex flex-col gap-4 py-4 font-mono text-sm ">
        <p className="tracking-wide">
          Cherry Capital builds websites that actually work and make you money. 
          No fluff, no templates, just real solutions that convert visitors into customers. Based in Beulah, Michigan, the studio has helped 
          local businesses go from invisible online to dominating their market.
        </p>
        <p className="tracking-wide">
          <strong>Here&apos;s the deal:</strong> Your website loads faster than your competition can blink (we&apos;re talking under 2 seconds), 
          looks perfect on every device, and is designed to turn browsers into buyers. I use the same enterprise tech that powers 
          <strong> Nike, Spotify, OpenAI, Stripe, and Netflix</strong>—basically, you get Fortune 500 infrastructure without the Fortune 500 price tag.
        </p>
        <p className="tracking-wide">
          <strong>No cookie-cutter stuff here.</strong> Every site I build is completely custom-designed for your business—not some template 
          I yanked off the shelf. Built-in SEO that actually ranks, conversion optimization that actually converts, analytics that actually matter. 
          Your website becomes your best salesperson.
        </p>
        <p className="tracking-wide">
          <strong>And then I stick around.</strong> After launch, I handle everything: hosting, security updates, performance monitoring, 
          content management, the whole thing. You focus on running your business while I make sure your website stays lightning-fast, secure, 
          and always working hard for you.
        </p>
        <p className="tracking-wide">
          Ready to stop wasting time with mediocre web solutions? Let&apos;s talk. <strong>Call (616) 260-9863</strong> or 
          <strong> email hello@cherrycapitalweb.com</strong> and let&apos;s build something that actually works. <em>Currently accepting new clients.</em>
        </p>
      </div>
    </section>
  );
}

export default AboutSection;
