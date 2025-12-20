"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/ui/vercel-navbar";
import { Footer } from "@/components/blocks/footer-section";
import { Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/seo-config";
import { JsonLd } from "@/components/seo/json-ld";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: siteConfig.business.email,
    href: `mailto:${siteConfig.business.email}`,
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Traverse City, Michigan",
    href: null,
  },
  {
    icon: Clock,
    title: "Response Time",
    value: "Usually within 24 hours",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd type="LocalBusiness" />
      <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to bring your project to life? We&apos;d love to hear from you.
              Based in Traverse City, serving all of Northern Michigan.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-muted-foreground">{item.value}</p>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card border rounded-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Send us an email and tell us about your project. We&apos;ll get back
              to you with ideas and a free consultation.
            </p>
            <Button asChild size="lg">
              <a href={`mailto:${siteConfig.business.email}`}>
                <Send className="w-4 h-4 mr-2" />
                Email Us
              </a>
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}
