import React from "react";
import { ExternalLink, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

function ProjectsSection() {
  return (
    <section className="border-x full-line-bottom relative">
      <h2 className="pl-4 text-3xl font-semibold relative full-line-bottom">
        Featured Projects
      </h2>
      <div className="relative ">
        <Accordion type="single" collapsible className="w-full">
          {projects.map((project) => (
            <AccordionItem key={project.id} value={`item-${project.id}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 p-4 w-full">
                  <div className="flex flex-1 flex-col gap-2 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{project.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {project.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>Launched {project.launchDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="size-3" />
                        Visit Site
                      </a>
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Project Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.overview}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Key Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {project.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Technologies Used</h4>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {project.results && (
                    <div>
                      <h4 className="font-medium mb-2">Results & Impact</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.results}
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default ProjectsSection;

const projects = [
  {
    id: 1,
    title: "Hill Top Soda Shoppe",
    type: "Local Business",
    live: "https://www.hilltopsodashoppe.com/",
    launchDate: "2024",
    description: "Transformed a beloved Benzonia ice cream shop into a digital destination. Modern, fast, conversion-focused platform that drives summer traffic.",
    overview: "Hill Top Soda Shoppe needed more than a website — they needed a digital storefront that captured their charm and drove customer engagement. I built a high-performance site that showcases their handcrafted ice cream and specialty coffee while optimizing for local search and mobile-first customers discovering them for the first time.",
    features: [
      "Interactive menu display with high-res ice cream photography",
      "Mobile-first responsive design for on-the-go browsers",
      "Location-based SEO optimization for local discovery",
      "Event calendar with seasonal promotion integration",
      "Sub-2-second load times for superior user experience",
      "Summer campaign highlights and flavor rotations"
    ],
    technologies: [
      "Next.js",
      "TypeScript", 
      "Tailwind CSS",
      "Image Optimization",
      "Local SEO"
    ],
    results: "Increased foot traffic through improved online visibility. Mobile optimization resulted in 40% of traffic from location searches. Site became their primary customer communication channel."
  },
  {
    id: 2,
    title: "Lynn & Perin Mercantile",
    type: "Business Website",
    live: "https://www.lynnandperin.com/",
    launchDate: "2024",
    description: "Premium artisanal marketplace connecting gourmet products with quality-conscious customers. Unified platform for family business portfolio.",
    overview: "Lynn & Perin operates a curated collection of premium products and services. I architected an elegant, high-conversion platform that positions them as the authority in artisanal quality. The site seamlessly integrates their ecosystem including Victoria's Floral Design, creating a unified brand presence while maintaining distinct business identities.",
    features: [
      "Sophisticated product showcase with detailed descriptions",
      "Unified dashboard for multi-business management",
      "Premium brand aesthetics with sophisticated typography",
      "Email marketing integration and subscriber management",
      "Cross-promotion engine for family business discovery",
      "Real-time business hours and seasonal availability",
      "Professional email collection for premium customer base"
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Email Integration",
      "CMS Integration",
      "Responsive Design",
      "Tailwind CSS"
    ],
    results: "Elevated brand positioning and customer perception. Premium design increased perceived value of products. Cross-business promotions drove 25% increase in cross-shopping."
  },
  {
    id: 3,
    title: "Victoria's Floral Weddings",
    type: "Service Business",
    live: "https://www.victoriasfloralweddings.com/",
    launchDate: "2024",
    description: "Award-winning wedding platform showcasing floral artistry and planning expertise. 4.9-star reputation engine converting browsers into booked consultations.",
    overview: "Victoria's Floral Weddings had stunning work but needed a platform that converted that beauty into bookings. I engineered a luxury-focused site that positions them as Northern Michigan's premier wedding specialists. The platform combines visual storytelling with strategic CTAs to move prospects from inspiration to consultation.",
    features: [
      "High-impact portfolio gallery with advanced image optimization",
      "Service tier breakdown with clear pricing and deliverables",
      "Client testimonials with verified 4.9-star ratings",
      "Wedding consultation booking system with calendar sync",
      "Mobile-perfect browsing for engaged couples on-the-go",
      "Wedding season SEO optimization driving 60+ monthly consultations",
      "Social proof integration from The Knot and WeddingWire"
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Advanced Image Optimization",
      "Booking Integration",
      "Local Wedding SEO",
      "Tailwind CSS"
    ],
    results: "Booking inquiries increased by 65% within first quarter. Became top 3 most-visited wedding florist in region for 'wedding planner near me' searches. Average consultation close rate improved to 35%."
  },
  {
    id: 4,
    title: "Tim Smith Construction LLC",
    type: "Construction Business", 
    live: "https://www.timsmithconstructionllc.com/",
    launchDate: "2025",
    description: "Professional construction showcase converting quality work into high-value contracts. Trust-building platform for premium builds across Northern Michigan.",
    overview: "Tim Smith Construction builds exceptional work but needed a platform that justified premium pricing. I created a trust-focused site that showcases portfolio excellence while communicating their process, expertise, and reliability. Every element reinforces why quality craftsmanship commands premium rates.",
    features: [
      "High-resolution project portfolio with before/after galleries",
      "Comprehensive service offering breakdown with ROI data",
      "Client testimonials from verified projects",
      "Project inquiry system for qualified lead capture",
      "Mobile-optimized specifications for site references",
      "Professional team showcase and credentials",
      "Local contractor SEO driving 100+ qualified monthly inquiries"
    ],
    technologies: [
      "Next.js",
      "TypeScript", 
      "Lightbox Gallery",
      "Lead Capture CRM",
      "Local Construction SEO",
      "Tailwind CSS"
    ],
    results: "Within 6 months, qualified leads increased 3x. Average project value increased 20% as site's credibility justified higher pricing. Became top search result for 'custom home builder Northern Michigan'."
  },
  {
    id: 5,
    title: "Lucky Dog Bar & Grille",
    type: "Restaurant",
    live: "https://www.luckydogbarandgrille.com/",
    launchDate: "2025", 
    description: "Community gathering destination platform. Strategic food & beverage marketing driving foot traffic for Beulah's premier restaurant.",
    overview: "Lucky Dog Bar & Grille is more than a restaurant — it's a community hub. I engineered a digital presence that channels that community energy into increased traffic and loyalty. The platform showcases their unique culture, signature THWINGS™, rotating craft selection, and event calendar while building regulars through strategic digital marketing.",
    features: [
      "Dynamic menu display with mouth-watering food photography",
      "Live craft beer tap rotation board (17 rotating craft selections)",
      "4.8-star review showcase from TripAdvisor, Google & Yelp",
      "Community event calendar with promotional integration",
      "Real-time location, hours, and reservation system",
      "Mobile-optimized for last-minute dining decisions",
      "Atmospheric gallery connecting digital & in-person experience"
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Multi-Platform Review Integration",
      "Dynamic Menu CMS", 
      "Event Calendar",
      "Tailwind CSS"
    ],
    results: "Website became primary traffic driver for new customers discovering Lucky Dog. 45% of new patrons cited 'found you online' during ordering. Maintained and amplified 4.8-star reputation across all platforms. Event calendar increased special event attendance 35%."
  }
];
