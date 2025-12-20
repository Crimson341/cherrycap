"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        className="max-w-4xl mx-auto px-6 py-12 md:py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: December 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Plain English Version</h2>
            <p className="text-muted-foreground leading-relaxed">
              We build websites and provide digital services. You pay us, we do the work. We both act like professionals. If something goes wrong, we talk it out like adults. That's basically it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed">
              CherryCap is a web design and development company based in Traverse City, Michigan. These terms apply when you use our website or hire us for a project.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Using Our Website</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our website is here to show you what we do and let you get in touch. Pretty simple. Here's what we ask:
            </p>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              <li>Don't try to break our site or do anything illegal with it</li>
              <li>Don't pretend to be someone else when contacting us</li>
              <li>Don't scrape our content or use bots without permission</li>
              <li>Be a decent human being (you'd be surprised how far this goes)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">If You Hire Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you become a client, we'll have a separate agreement that covers the specifics of your project. But here's how we generally work:
            </p>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              <li>
                <strong className="text-foreground">We agree on scope first</strong> — Before we start, we'll be clear about what we're building, how long it'll take, and what it costs. No surprises.
              </li>
              <li>
                <strong className="text-foreground">You pay on time</strong> — We typically require a deposit to start, with the rest due at milestones or completion. Late payments delay projects.
              </li>
              <li>
                <strong className="text-foreground">You give us what we need</strong> — Content, images, feedback, approvals. Projects stall when we're waiting on stuff.
              </li>
              <li>
                <strong className="text-foreground">Revisions are included, but within reason</strong> — We're not going to nickel and dime you, but "make it pop more" for the 47th time isn't covered.
              </li>
              <li>
                <strong className="text-foreground">You own your site when it's done</strong> — Once you've paid in full, the website is yours. We'll hand over everything you need.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The CherryCap name, logo, and original content on this website belong to us. You can't use them without permission. However, any custom work we create specifically for your project belongs to you after payment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Stuff</h2>
            <p className="text-muted-foreground leading-relaxed">
              We might recommend or use third-party tools, hosting, or services for your project. Those have their own terms, and we're not responsible for them. We'll always try to use reputable services, but if Cloudflare goes down, that's not on us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Here's where the lawyer stuff kicks in: We do our best, but we can't guarantee your website will make you a millionaire or that nothing will ever go wrong. Our liability is limited to the amount you paid us for the service in question. We're not responsible for lost profits, data, or opportunities. We know that sounds harsh, but every business has to say this.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">If Things Go Sideways</h2>
            <p className="text-muted-foreground leading-relaxed">
              If there's a dispute, let's talk about it first. Seriously. Most problems can be solved with a phone call. If we really can't work it out, we'll handle it under Michigan law, and any legal proceedings would happen in Grand Traverse County courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cancellations & Refunds</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Life happens. Here's how we handle it:
            </p>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              <li>
                <strong className="text-foreground">Before work starts:</strong> Full refund of any deposit, no hard feelings.
              </li>
              <li>
                <strong className="text-foreground">Work in progress:</strong> You pay for work completed. We'll give you whatever we've built so far.
              </li>
              <li>
                <strong className="text-foreground">After completion:</strong> No refunds, but we'll make it right if something's genuinely wrong.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We might update these terms occasionally. If we make big changes, we'll update the date at the top. For active clients, your project agreement takes precedence over these general terms anyway.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If anything here doesn't make sense or you have questions, just ask:
            </p>
            <div className="mt-4 p-6 bg-muted/50 rounded-xl border border-border">
              <p className="text-foreground font-medium">CherryCap</p>
              <p className="text-muted-foreground">Traverse City, Michigan</p>
              <p className="text-muted-foreground">hello@cherrycap.com</p>
              <p className="text-muted-foreground">(231) 555-0123</p>
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
}
