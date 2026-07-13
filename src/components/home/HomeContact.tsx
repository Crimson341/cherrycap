"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { portfolioConfig } from "@/lib/portfolioConfig";

const stripControlChars = (value: string) =>
  value.replace(/[\u0000-\u001F\u007F]/g, "").trim();

const FormSchema = z.object({
  name: z
    .string()
    .transform(stripControlChars)
    .pipe(
      z
        .string()
        .min(2, { message: "Name needs at least 2 characters." })
        .max(100),
    ),
  email: z
    .string()
    .transform(stripControlChars)
    .pipe(z.string().min(1).max(254).email("Enter a valid email.")),
  message: z
    .string()
    .transform((value) => value.replace(/\r\n/g, "\n").trim())
    .pipe(z.string().min(2, { message: "Write a short message." }).max(5000)),
  website: z.string().max(0).optional().or(z.literal("")),
});

type HomeContactProps = {
  eyebrow?: string;
  heading?: React.ReactNode;
  subcopy?: React.ReactNode;
  messagePlaceholder?: string;
  subjectPrefix?: string;
};

export function HomeContact({
  eyebrow = "Contact",
  heading = (
    <>
      Tell me about
      <br />
      the project.
    </>
  ),
  subcopy,
  messagePlaceholder = "What do you need?",
  subjectPrefix = "Website contact",
}: HomeContactProps = {}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", email: "", message: "", website: "" },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setSubmitError(false);
    if (data.website) {
      setSubmitted(true);
      return;
    }

    try {
      const safeName = data.name.slice(0, 100).replace(/[\r\n]/g, " ");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: safeName,
          email: data.email.slice(0, 254),
          message: data.message.slice(0, 5000),
          subjectPrefix,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    }
  }

  return (
    <section
      id="contact"
      data-gsap="section"
      data-gsap-contact=""
      className="border-b border-black/10 bg-white"
    >
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-8 md:grid-cols-2 md:py-28">
        <div>
          <p
            data-gsap="section-heading"
            className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-black/40"
          >
            {eyebrow}
          </p>
          <h2
            data-gsap="section-heading"
            className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {heading}
          </h2>
          <p
            data-gsap="reveal"
            className="mb-8 max-w-sm text-sm leading-relaxed text-black/60"
          >
            {subcopy ?? (
              <>
                Or skip the form and email{" "}
                <a
                  href={`mailto:${portfolioConfig.email}`}
                  className="font-medium text-black underline decoration-black/25 underline-offset-4"
                >
                  {portfolioConfig.email}
                </a>
                .
              </>
            )}
            {subcopy ? (
              <>
                {" "}
                Email{" "}
                <a
                  href={`mailto:${portfolioConfig.email}`}
                  className="font-medium text-black underline decoration-black/25 underline-offset-4"
                >
                  {portfolioConfig.email}
                </a>{" "}
                anytime.
              </>
            ) : null}
          </p>
          <div
            data-gsap="reveal"
            className="space-y-2 border-l-2 border-[#F5E642] pl-4 text-sm text-black/50"
          >
            <p>{portfolioConfig.location}</p>
            <p>Usually reply within a business day.</p>
          </div>
        </div>

        <div>
          {submitted ? (
            <div
              data-gsap="form-field"
              className="flex min-h-64 items-center border border-black/10 bg-[#fafafa] p-8"
              role="status"
            >
              <div>
                <p className="mb-2 text-lg font-semibold">Got it.</p>
                <p className="text-sm text-black/60">
                  I&apos;ll get back to you soon.
                </p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem data-gsap="form-field">
                      <FormLabel className="text-xs uppercase tracking-wider text-black/50">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-none border-black/15 bg-white shadow-none focus-visible:border-black focus-visible:ring-0"
                          placeholder="Your name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem data-gsap="form-field">
                      <FormLabel className="text-xs uppercase tracking-wider text-black/50">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          className="rounded-none border-black/15 bg-white shadow-none focus-visible:border-black focus-visible:ring-0"
                          placeholder="you@business.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem data-gsap="form-field">
                      <FormLabel className="text-xs uppercase tracking-wider text-black/50">
                        Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-32 rounded-none border-black/15 bg-white shadow-none focus-visible:border-black focus-visible:ring-0"
                          placeholder={messagePlaceholder}
                          maxLength={5000}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
                      <FormControl>
                        <Input
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <button
                  data-gsap="form-field"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="h-12 w-full bg-black text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-10"
                >
                  {form.formState.isSubmitting ? "Sending…" : "Send message"}
                </button>
                {submitError && (
                  <p role="alert" className="text-sm text-red-600">
                    Something went wrong. Try again or email{" "}
                    {portfolioConfig.email}.
                  </p>
                )}
              </form>
            </Form>
          )}
        </div>
      </div>
    </section>
  );
}
