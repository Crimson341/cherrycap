"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ExternalLink,
  Mail,
  Menu,
  MousePointer2,
  Sparkles,
  X,
} from "lucide-react";

const work = [
  {
    name: "Hill Top Soda Shoppe",
    label: "Hospitality · Benzonia",
    description:
      "A joyful digital storefront for a beloved local destination—built to turn summer searches into visits.",
    href: "https://www.hilltopsodashoppe.com/",
    image: "/client-logos/hill-top.png",
    tone: "coral",
    number: "01",
  },
  {
    name: "Lynn & Perin",
    label: "Retail · Northern Michigan",
    description:
      "An elegant home for an artisanal mercantile, designed around quality, story, and effortless discovery.",
    href: "https://www.lynnandperin.com/",
    image: "/client-logos/lynn-perin.png",
    tone: "sage",
    number: "02",
  },
  {
    name: "Victoria’s Floral",
    label: "Weddings · Traverse City",
    description:
      "A romantic, image-led experience that gives an award-winning floral studio the stage its work deserves.",
    href: "https://www.victoriasfloralweddings.com/",
    image: "/client-logos/victorias-floral-weddings.png",
    tone: "lavender",
    number: "03",
  },
];

const services = [
  {
    number: "01",
    title: "Positioning & strategy",
    text: "We get clear on who you serve, what makes you different, and what your website needs to accomplish before touching the design.",
  },
  {
    number: "02",
    title: "Web design",
    text: "A completely custom visual system that feels like your business—not a theme wearing your logo.",
  },
  {
    number: "03",
    title: "Development",
    text: "Fast, responsive, accessible builds engineered for real phones, real customers, and modern search.",
  },
  {
    number: "04",
    title: "Launch & support",
    text: "A clean handoff, practical guidance, and a direct line when your business needs the site to evolve.",
  },
];

type FormState = "idle" | "sending" | "success" | "error";

export default function CherryCapitalLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Lead submission failed");
      form.reset();
      setFormState("success");
    } catch {
      setFormState("error");
    }
  }

  return (
    <div className="cc-page">
      <a className="cc-skip" href="#content">
        Skip to content
      </a>

      <header className="cc-header">
        <Link href="/" className="cc-brand" aria-label="Cherry Capital home">
          <span className="cc-brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span>Cherry Capital</span>
        </Link>

        <nav className="cc-nav" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#about">Studio</a>
          <Link href="/blog">Journal</Link>
        </nav>

        <a className="cc-header-cta" href="#contact">
          Start a project <ArrowDownRight size={17} />
        </a>

        <button
          className="cc-menu-button"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        {menuOpen && (
          <nav className="cc-mobile-nav" aria-label="Mobile navigation">
            <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>Studio</a>
            <Link href="/blog" onClick={() => setMenuOpen(false)}>Journal</Link>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Start a project</a>
          </nav>
        )}
      </header>

      <main id="content">
        <section className="cc-hero">
          <div className="cc-hero-copy">
            <p className="cc-kicker">
              <span /> Independent web studio · Beulah, Michigan
            </p>
            <h1>
              Your business is
              <span>worth the visit.</span>
            </h1>
            <p className="cc-hero-intro">
              Distinctive websites for Northern Michigan businesses that want
              to look established, get found, and turn more visitors into
              customers.
            </p>
            <div className="cc-hero-actions">
              <a className="cc-button cc-button-dark" href="#contact">
                Let’s build yours <ArrowRight size={18} />
              </a>
              <a className="cc-text-link" href="#work">
                See selected work <ArrowDownRight size={17} />
              </a>
            </div>
          </div>

          <div className="cc-hero-art" aria-label="Cherry Capital design studio">
            <div className="cc-art-orbit cc-art-orbit-one" />
            <div className="cc-art-orbit cc-art-orbit-two" />
            <div className="cc-art-card cc-art-card-top">
              <Sparkles size={16} />
              <span>Strategy first</span>
            </div>
            <div className="cc-art-center">
              <span className="cc-art-small">Made locally</span>
              <strong>Built to<br />stand out.</strong>
              <span className="cc-art-place">44.6° N · 86.1° W</span>
            </div>
            <div className="cc-art-card cc-art-card-bottom">
              <MousePointer2 size={16} />
              <span>Designed to convert</span>
            </div>
            <div className="cc-cherry cc-cherry-one" />
            <div className="cc-cherry cc-cherry-two" />
          </div>

          <div className="cc-hero-proof">
            <div><strong>100%</strong><span>custom design</span></div>
            <div><strong>5+</strong><span>local launches</span></div>
            <div><strong>1:1</strong><span>founder access</span></div>
          </div>
        </section>

        <section className="cc-marquee" aria-label="Businesses we work with">
          <div>
            <span>Restaurants</span><i>✦</i><span>Retailers</span><i>✦</i>
            <span>Builders</span><i>✦</i><span>Hospitality</span><i>✦</i>
            <span>Creative studios</span><i>✦</i><span>Local legends</span>
          </div>
        </section>

        <section className="cc-work cc-section" id="work">
          <div className="cc-section-heading">
            <p className="cc-eyebrow">Selected work</p>
            <h2>Built for businesses<br />with somewhere to go.</h2>
            <p>
              Every engagement starts from a blank page. The result is a site
              that feels unmistakably like the business behind it.
            </p>
          </div>

          <div className="cc-work-list">
            {work.map((project) => (
              <a
                className={`cc-work-card cc-work-${project.tone}`}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                key={project.name}
              >
                <div className="cc-work-visual">
                  <span className="cc-work-number">{project.number}</span>
                  <div className="cc-work-logo">
                    <Image
                      src={project.image}
                      alt={`${project.name} logo`}
                      width={560}
                      height={320}
                      loading="eager"
                    />
                  </div>
                  <span className="cc-work-open"><ExternalLink size={18} /></span>
                </div>
                <div className="cc-work-content">
                  <p>{project.label}</p>
                  <h3>{project.name}</h3>
                  <span>{project.description}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="cc-statement">
          <div className="cc-statement-mark">“</div>
          <p>
            The best local websites don’t feel local in the small sense.
            <em> They feel specific, credible, and impossible to confuse.</em>
          </p>
        </section>

        <section className="cc-services cc-section" id="services">
          <div className="cc-services-intro">
            <p className="cc-eyebrow">What we do</p>
            <h2>One studio.<br />The whole website.</h2>
            <p>
              No handoff chain. No bloated agency process. Strategy, design,
              writing support, and development all stay connected from first
              conversation to launch.
            </p>
            <a className="cc-text-link cc-text-link-light" href="#contact">
              Tell us what you’re building <ArrowRight size={17} />
            </a>
          </div>

          <div className="cc-services-list">
            {services.map((service) => (
              <article key={service.number}>
                <span>{service.number}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cc-about cc-section" id="about">
          <div className="cc-about-image">
            <Image
              src="/myImage.png"
              alt="Scott, founder of Cherry Capital"
              fill
              sizes="(max-width: 800px) 100vw, 42vw"
              loading="eager"
            />
            <span>Founder-led in Beulah, MI</span>
          </div>
          <div className="cc-about-copy">
            <p className="cc-eyebrow">A small studio on purpose</p>
            <h2>Direct collaboration makes better work.</h2>
            <p className="cc-about-lead">
              I’m Scott, the designer and developer behind Cherry Capital. You
              work with me from the first sketch to the final launch.
            </p>
            <p>
              I built this studio for business owners who care about their
              reputation and are tired of websites that feel dated, generic,
              or harder to use than they should be. The process is plainspoken,
              collaborative, and focused on making the business look as good
              online as it is in real life.
            </p>
            <div className="cc-about-checks">
              <span><Check size={16} /> No page-builder templates</span>
              <span><Check size={16} /> Mobile-first and search-ready</span>
              <span><Check size={16} /> A real person after launch</span>
            </div>
          </div>
        </section>

        <section className="cc-process cc-section">
          <div className="cc-section-heading cc-process-heading">
            <p className="cc-eyebrow">The process</p>
            <h2>Clear from kickoff<br />to launch day.</h2>
          </div>
          <ol>
            <li><span>01</span><strong>Discover</strong><p>Goals, audience, content, and the real business story.</p></li>
            <li><span>02</span><strong>Direct</strong><p>A focused creative direction before the details multiply.</p></li>
            <li><span>03</span><strong>Design + build</strong><p>The full responsive experience, built as it’s designed.</p></li>
            <li><span>04</span><strong>Launch</strong><p>Final polish, domain setup, analytics, and a confident handoff.</p></li>
          </ol>
        </section>

        <section className="cc-contact" id="contact">
          <div className="cc-contact-intro">
            <p className="cc-eyebrow">Start a project</p>
            <h2>Ready for a site that finally fits?</h2>
            <p>
              Tell me a little about the business and what is—or isn’t—working
              today. I’ll reply personally with a practical next step.
            </p>
            <a href="mailto:scott@cherrycapitalweb.com">
              <Mail size={18} /> scott@cherrycapitalweb.com
            </a>
          </div>

          {formState === "success" ? (
            <div className="cc-contact-success" role="status">
              <span><Check /></span>
              <h3>Message received.</h3>
              <p>Thanks for reaching out. I’ll get back to you personally soon.</p>
              <button type="button" onClick={() => setFormState("idle")}>Send another note</button>
            </div>
          ) : (
            <form className="cc-contact-form" onSubmit={submitLead}>
              <div className="cc-honeypot" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="cc-field cc-field-wide">
                <label htmlFor="name">Your name</label>
                <input id="name" name="name" type="text" placeholder="Jane Smith" minLength={2} required />
              </div>
              <div className="cc-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="jane@business.com" required />
              </div>
              <div className="cc-field">
                <label htmlFor="phone">Phone <span>Optional</span></label>
                <input id="phone" name="phone" type="tel" placeholder="(231) 555-0123" />
              </div>
              <div className="cc-field cc-field-wide">
                <label htmlFor="company">Business name <span>Optional</span></label>
                <input id="company" name="company" type="text" placeholder="Your business" />
              </div>
              <div className="cc-field cc-field-wide">
                <label htmlFor="message">What can I help with?</label>
                <textarea id="message" name="message" placeholder="A new website, a redesign, better search visibility..." minLength={2} required />
              </div>
              <button className="cc-submit" type="submit" disabled={formState === "sending"}>
                {formState === "sending" ? "Sending…" : "Send project details"}
                {formState !== "sending" && <ArrowRight size={18} />}
              </button>
              {formState === "error" && (
                <p className="cc-form-error" role="alert">
                  Something went wrong. Please try again or email me directly.
                </p>
              )}
            </form>
          )}
        </section>
      </main>

      <footer className="cc-footer">
        <div className="cc-footer-top">
          <Link href="/" className="cc-brand cc-brand-footer">
            <span className="cc-brand-mark" aria-hidden="true"><span /><span /></span>
            <span>Cherry Capital</span>
          </Link>
          <p>Distinctive websites for good businesses<br />in Northern Michigan and beyond.</p>
          <a href="#content" className="cc-back-top">Back to top <ArrowRight size={16} /></a>
        </div>
        <div className="cc-footer-bottom">
          <span>© {new Date().getFullYear()} Cherry Capital</span>
          <span>Beulah, Michigan</span>
          <div>
            <a href="https://www.facebook.com/profile.php?id=61571003491816" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://www.linkedin.com/company/cherry-capital/" target="_blank" rel="noreferrer">LinkedIn</a>
            <Link href="/portal">Client portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
