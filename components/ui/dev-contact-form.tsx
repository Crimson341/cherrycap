"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, CheckCircle, Code2, Globe, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

// Typewriter effect component
function Typewriter({
  text,
  speed = 60,
  cursor = "|",
  className,
}: {
  text: string;
  speed?: number;
  cursor?: string;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

interface FormData {
  name: string;
  email: string;
  company: string;
  platform: "wordpress" | "shopify" | "both" | "";
  projectType: string;
  message: string;
}

export function DevContactForm({ className }: { className?: string }) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    platform: "",
    projectType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.name.split(" ")[0] || formData.name,
          lastName: formData.name.split(" ").slice(1).join(" ") || "",
          email: formData.email,
          subject: `[Development Inquiry] ${formData.platform.toUpperCase()} - ${formData.projectType}`,
          message: `
Company: ${formData.company || "Not specified"}
Platform: ${formData.platform}
Project Type: ${formData.projectType}

Message:
${formData.message}
          `.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        company: "",
        platform: "",
        projectType: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("w-full min-h-[600px] grid md:grid-cols-2 rounded-2xl overflow-hidden border border-border", className)}>
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-sm">
          {submitStatus === "success" ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
              <p className="text-muted-foreground text-sm">
                We'll review your project and get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitStatus("idle")}
                className="mt-6 text-sm text-rose-500 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                <h3 className="text-xl font-bold">Start Your Project</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us about what you need built
                </p>
              </div>

              {submitStatus === "error" && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="company" className="text-sm font-medium">
                  Company <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="platform" className="text-sm font-medium">
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  required
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="">Select a platform</option>
                  <option value="wordpress">WordPress</option>
                  <option value="shopify">Shopify</option>
                  <option value="both">Both / Not Sure</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="projectType" className="text-sm font-medium">
                  Project Type
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  required
                  value={formData.projectType}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="">What do you need?</option>
                  <option value="plugin">Custom Plugin / App</option>
                  <option value="theme">Theme Development</option>
                  <option value="integration">API Integration</option>
                  <option value="modification">Existing Site Modification</option>
                  <option value="other">Other / Not Sure</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Project Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Describe what you're looking to build..."
                  required
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree to our{" "}
                <a href="/privacy" className="text-rose-500 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden md:flex relative bg-gradient-to-br from-rose-500/10 via-background to-orange-500/10 flex-col items-center justify-center p-8">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          {/* Platform icons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Globe className="w-7 h-7 text-blue-500" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-rose-500" />
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-green-500" />
            </div>
          </div>

          <blockquote className="space-y-3">
            <p className="text-lg font-medium text-foreground">
              "<Typewriter
                text="Let's build something great together."
                speed={50}
              />"
            </p>
            <cite className="block text-sm text-muted-foreground not-italic">
              — CherryCap Development Team
            </cite>
          </blockquote>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">50+</div>
              <div className="text-xs text-muted-foreground">Plugins Built</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">24hr</div>
              <div className="text-xs text-muted-foreground">Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
