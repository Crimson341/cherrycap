import Link from "next/link";
import Image from "next/image";

const projects = [
  {
    name: "Hill Top Soda Shoppe",
    place: "Benzonia",
    href: "https://www.hilltopsodashoppe.com/",
    image: "/client-logos/hill-top.webp",
    imageClass: "object-cover object-top",
  },
  {
    name: "Lynn & Perin",
    place: "Mercantile",
    href: "https://www.lynnandperin.com/",
    image: "/client-logos/lynn-perin.webp",
    imageClass: "object-contain p-8",
  },
  {
    name: "Victoria's Floral",
    place: "Weddings",
    href: "https://www.victoriasfloralweddings.com/",
    image: "/client-logos/victorias-floral-weddings.webp",
    imageClass: "object-cover",
  },
  {
    name: "Petals & Perks",
    place: "Frankfort",
    href: "https://www.petalsandperks.com/",
    image: null,
  },
];

export function HomeWork() {
  return (
    <section
      id="work"
      data-gsap="section"
      className="border-b border-black/10 bg-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 md:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p
              data-gsap="section-heading"
              className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-black/40"
            >
              Work
            </p>
            <h2
              data-gsap="section-heading"
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Sites I&apos;ve built
            </h2>
          </div>
          <Link
            data-gsap="reveal"
            href="/#contact"
            className="text-sm font-medium underline decoration-black/30 underline-offset-4 transition-colors hover:decoration-black"
          >
            Start a project →
          </Link>
        </div>

        <div className="grid gap-px bg-black/10 sm:grid-cols-2">
          {projects.map((project) => (
            <a
              key={project.name}
              data-gsap="card"
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex min-h-64 flex-col justify-between bg-white p-6 transition-colors hover:bg-[#fafafa]"
            >
              <div className="relative mb-6 flex h-40 items-center justify-center overflow-hidden border border-black/10 bg-[#f4f4f4]">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 40vw, 90vw"
                    className={project.imageClass}
                  />
                ) : (
                  <span className="font-serif text-3xl italic text-[#6f4d38]">
                    Petals &amp; Perks
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {project.name}
                  </h3>
                  <p className="text-sm text-black/50">{project.place}</p>
                </div>
                <span
                  className="text-black/30 transition-colors group-hover:text-black"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
