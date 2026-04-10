"use client";
import React from "react";
import { Calendar, Code, Building, Heart } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

function ExperienceSection() {
  return (
    <section className="border-x full-line-bottom relative">
      <h2 className="pl-4 text-3xl font-semibold relative full-line-bottom">
        Experience & Journey
      </h2>
      <div className="relative ">
        <Accordion type="single" collapsible className="w-full">
          {experienceData.map((experience) => (
            <AccordionItem key={experience.id} value={`item-${experience.id}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 p-4 w-full">
                  <div className="flex flex-1 flex-col gap-2 text-left">
                    <div className="flex items-center gap-2">
                      <experience.icon className="size-5 text-primary" />
                      <h3 className="text-xl font-semibold">{experience.title}</h3>
                      {experience.current && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {experience.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>{experience.duration}</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      {experience.overview}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Key Achievements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {experience.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Technologies & Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {experience.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {experience.impact && (
                    <div>
                      <h4 className="font-medium mb-2">Impact & Results</h4>
                      <p className="text-sm text-muted-foreground">
                        {experience.impact}
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

export default ExperienceSection;

const experienceData = [
  {
    id: 1,
    title: "Founder & Developer - Cherry Capital",
    icon: Building,
    current: true,
    duration: "2024 - Present",
    description: "Building modern web solutions for local businesses in Northern Michigan, outperforming WordPress competitors.",
    overview: "Founded Cherry Capital to provide modern, custom web development services to local businesses. Focused on delivering superior performance and user experience compared to traditional WordPress solutions commonly used by competitors in the area.",
    achievements: [
      "Successfully launched 5+ client websites for local businesses",
      "Established strong reputation in Beulah/Benzonia area",
      "Delivered modern Next.js solutions while competitors use WordPress",
      "Built responsive, fast-loading sites with superior user experience",
      "Created lasting business relationships with local entrepreneurs",
      "Developed efficient workflows for rapid project delivery"
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Vercel",
      "Client Management",
      "Local SEO",
      "Performance Optimization"
    ],
    impact: "Established Cherry Capital as the go-to modern web development service in Northern Michigan, helping local businesses compete effectively online with cutting-edge technology."
  },
  {
    id: 2,
    title: "Self-Taught Developer Journey",
    icon: Code,
    current: false,
    duration: "2021 - 2024 (3 Years)",
    description: "Intensive self-directed learning journey while working full-time, mastering modern web development through hands-on projects.",
    overview: "Dedicated 3 years to learning web development while maintaining full-time employment. Focused on modern JavaScript ecosystem, React, and Next.js through practical projects and real-world application.",
    achievements: [
      "Learned modern web development stack from scratch",
      "Built multiple personal projects to master core concepts",
      "Developed strong problem-solving and debugging skills",
      "Mastered responsive design and user experience principles",
      "Gained expertise in modern deployment and hosting platforms",
      "Built solid foundation in web performance optimization",
      "Learned to read documentation and implement new technologies"
    ],
    technologies: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "Git",
      "Node.js",
      "Self-Learning"
    ],
    impact: "Successfully transitioned from complete beginner to professional developer, demonstrating strong self-motivation and ability to learn complex technical skills independently."
  },
  {
    id: 3,
    title: "Open Source Contributor",
    icon: Heart,
    current: true,
    duration: "2022 - Present",
    description: "Active contributor to various open source projects found on GitHub, gaining real-world development experience.",
    overview: "Regularly contribute to interesting open source projects discovered on GitHub. This hands-on experience has been crucial for understanding code collaboration, best practices, and working with existing codebases.",
    achievements: [
      "Contributed to multiple open source repositories",
      "Gained experience with collaborative development workflows",
      "Learned to read and understand large existing codebases",
      "Practiced Git workflows and pull request processes",
      "Developed skills in code review and quality standards",
      "Built understanding of software documentation practices",
      "Connected with developer community and learned from peers"
    ],
    technologies: [
      "Git & GitHub",
      "Code Review",
      "Documentation",
      "Issue Tracking",
      "Pull Requests",
      "Team Collaboration",
      "Testing",
      "Code Quality"
    ],
    impact: "Open source contributions provided invaluable real-world development experience and helped build the skills needed to work professionally with complex codebases and development teams."
  }
];
