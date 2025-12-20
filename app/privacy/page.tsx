"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: December 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">The Short Version</h2>
            <p className="text-muted-foreground leading-relaxed">
              We're not in the business of selling your data. We collect what we need to run our website and serve you better—nothing more. We don't sell your information to anyone, period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed">
              CherryCap is a web design and development company based in Traverse City, Michigan. When we say "we," "us," or "our," we mean CherryCap. When we say "you," we mean you—the person visiting our website or using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Here's what we might collect and why:
            </p>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              <li>
                <strong className="text-foreground">Contact info you give us</strong> — When you fill out a form, email us, or call us, we keep that info so we can actually get back to you. Pretty straightforward.
              </li>
              <li>
                <strong className="text-foreground">Basic analytics</strong> — We use privacy-friendly analytics to see how people use our site. We can see things like which pages are popular, but we can't identify you personally. No creepy tracking.
              </li>
              <li>
                <strong className="text-foreground">Cookies</strong> — We use a few essential cookies to make the site work properly. We're not tracking you across the internet.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What We Don't Do</h2>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              <li>Sell your data to anyone</li>
              <li>Share your info with advertisers</li>
              <li>Track you across the internet</li>
              <li>Send you spam</li>
              <li>Use your data for anything sketchy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">If You're Our Client</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you work with us on a project, we'll obviously need more information—business details, login credentials for various services, content for your website, etc. All of that is kept confidential and only used to complete your project. We don't share your business information with anyone else.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use a few services to run our business (hosting, email, analytics). These services have their own privacy policies, and we only work with companies that take privacy seriously. We don't use services that are known for aggressive data collection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              <li>Ask what data we have about you</li>
              <li>Ask us to delete your data</li>
              <li>Ask us to correct any wrong information</li>
              <li>Opt out of any marketing emails (there's always an unsubscribe link)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Just email us and we'll take care of it. No hoops to jump through.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use industry-standard security measures to protect your data. Our site uses HTTPS, we keep our software updated, and we don't store sensitive information we don't need. That said, no system is 100% secure, so we can't make absolute guarantees—but we do take it seriously.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              If we make significant changes to this policy, we'll update the date at the top. We're not going to suddenly start selling your data—that's not who we are.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this privacy policy or how we handle your data, just reach out:
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
