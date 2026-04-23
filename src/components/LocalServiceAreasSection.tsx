import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { localServiceAreas } from "@/lib/localSeo";

export function LocalServiceAreasSection() {
  return (
    <section className="relative border-x full-line-bottom">
      <div className="relative full-line-bottom p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Local search focus
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Web design where Northern Michigan businesses are actually searching
        </h2>
        <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed tracking-wide text-muted-foreground">
          These pages target the local searches competitors are showing up for:
          website designer near me, web developer near me, Frankfort web design,
          Traverse City web design, and Benzie County website help.
        </p>
      </div>
      <ul>
        {localServiceAreas.map((area) => (
          <li key={area.slug} className="relative full-line-bottom last:after:hidden">
            <Link
              href={`/${area.slug}`}
              className="group flex flex-col gap-2 p-4 transition-colors hover:bg-secondary/30"
            >
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <MapPin className="size-3" />
                {area.city}, {area.region}
              </span>
              <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                {area.title}
              </h3>
              <p className="font-mono text-sm leading-relaxed tracking-wide text-muted-foreground">
                {area.description}
              </p>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                View local page
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
