"use client";

import { useState } from "react";
import { Mail, Globe, Send, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

interface Contact2Props {
  title?: string;
  description?: string;
  email?: string;
  web?: { label: string; url: string };
}

export const Contact2 = ({
  title = "Contact Us",
  description = "Have a question or want to get started? Fill out the form below and we'll get back to you within 24 hours.",
  email = "hello@cherrycap.com",
  web = { label: "cherrycap.com", url: "https://cherrycap.com" },
}: Contact2Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className={cn("relative py-32 overflow-hidden bg-[#060606]", inter.className)}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-neutral-500/5 via-neutral-400/3 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-6 mx-auto">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-16 lg:flex-row lg:gap-20">
          {/* Left Side - Contact Info */}
          <motion.div
            className="mx-auto flex max-w-md flex-col justify-between gap-10 lg:mx-0"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center lg:text-left text-balance">
              <h2 className="mb-4 text-[42px] font-bold text-[#C8C8C8] tracking-tight leading-tight">
                {title.split(" ")[0]}{" "}
                <span className="text-[#C8C8C8]">
                  {title.split(" ").slice(1).join(" ")}
                </span>
              </h2>
              <p className="text-[17px] font-medium text-[#BFBFBF] leading-relaxed max-w-[400px]">
                {description}
              </p>
            </div>

            <div className="mx-auto w-full lg:mx-0">
              <h3 className="mb-6 text-center text-[15px] font-medium text-[#6A6A6A] lg:text-left">
                Contact Details
              </h3>
              <div className="space-y-4">
                <motion.a
                  href={`mailto:${email}`}
                  className="flex items-center gap-4 p-4 rounded-[15px] bg-[#1D1D1D] border border-[#191919] hover:bg-[#252525] transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#060606] border border-[#191919] flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#BBBBBB]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#B6B6B5] uppercase tracking-wide">Email</p>
                    <p className="text-[14px] font-medium text-[#C8C8C8] hover:text-white transition-colors">{email}</p>
                  </div>
                </motion.a>

                <motion.a
                  href={web.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-[15px] bg-[#1D1D1D] border border-[#191919] hover:bg-[#252525] transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#060606] border border-[#191919] flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#BBBBBB]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#B6B6B5] uppercase tracking-wide">Website</p>
                    <p className="text-[14px] font-medium text-[#C8C8C8] hover:text-white transition-colors">{web.label}</p>
                  </div>
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Contact Form (Resend UI Style) */}
          <motion.div
            className="mx-auto w-full max-w-lg lg:max-w-[480px]"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-[15px] border border-[#191919] bg-[#1D1D1D] p-8 shadow-2xl">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#060606] border border-[#191919] flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-8 h-8 text-[#BBBBBB]" />
                    </div>
                    <h3 className="text-[18px] font-medium text-[#C8C8C8] mb-2">Message Sent</h3>
                    <p className="text-[15px] text-[#6A6A6A] max-w-[280px]">
                      Thanks for reaching out! We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
                      }}
                      className="mt-8 px-6 py-2.5 rounded-[15px] bg-[#060606] border border-[#191919] text-[14px] font-medium text-[#BBBBBB] hover:bg-[#151515] transition-colors focus:outline-offset-2 focus:outline-2 focus:outline-[#5E6AD2]"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-[12px] font-medium text-[#BBBBBB]">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full rounded-[15px] border border-[#191919] bg-[#060606] px-4 py-2.5 text-[14px] text-[#C8C8C8] placeholder-[#666666] focus:outline-offset-2 focus:outline-2 focus:outline-[#5E6AD2] transition-colors"
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-[12px] font-medium text-[#BBBBBB]">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full rounded-[15px] border border-[#191919] bg-[#060606] px-4 py-2.5 text-[14px] text-[#C8C8C8] placeholder-[#666666] focus:outline-offset-2 focus:outline-2 focus:outline-[#5E6AD2] transition-colors"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-[12px] font-medium text-[#BBBBBB]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-[15px] border border-[#191919] bg-[#060606] px-4 py-2.5 text-[14px] text-[#C8C8C8] placeholder-[#666666] focus:outline-offset-2 focus:outline-2 focus:outline-[#5E6AD2] transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="block text-[12px] font-medium text-[#BBBBBB]">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full rounded-[15px] border border-[#191919] bg-[#060606] px-4 py-2.5 text-[14px] text-[#C8C8C8] placeholder-[#666666] focus:outline-offset-2 focus:outline-2 focus:outline-[#5E6AD2] transition-colors"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-[12px] font-medium text-[#BBBBBB]">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full resize-none rounded-[15px] border border-[#191919] bg-[#060606] px-4 py-3 text-[14px] text-[#C8C8C8] placeholder-[#666666] focus:outline-offset-2 focus:outline-2 focus:outline-[#5E6AD2] transition-colors"
                        placeholder="Tell us a little about your project or needs..."
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-[15px] bg-[#1D1D1D] border border-red-900/30 text-red-500 text-[13px]">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[15px] bg-[#C8C8C8] hover:bg-white text-[#060606] text-[14px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-offset-2 focus:outline-2 focus:outline-[#5E6AD2]"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#060606]" />
                      ) : (
                        <>
                          Send Message
                          <Send className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact2;
