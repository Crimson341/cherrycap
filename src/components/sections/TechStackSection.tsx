import Image from "next/image";
import React from "react";

type ImageClient = {
  name: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imageClassName: string;
  wordmark?: false;
};

type WordmarkClient = {
  name: string;
  href: string;
  wordmark: true;
};

const featuredClients: Array<ImageClient | WordmarkClient> = [
  {
    name: "Hill Top Soda Shoppe",
    href: "https://www.hilltopsodashoppe.com/",
    imageSrc: "/client-logos/hill-top.png",
    imageAlt: "Hill Top Soda Shoppe brand image",
    imageClassName: "object-cover object-top",
  },
  {
    name: "Lynn & Perin",
    href: "https://www.lynnandperin.com/",
    imageSrc: "/client-logos/lynn-perin.png",
    imageAlt: "Lynn & Perin logo",
    imageClassName: "object-contain p-6",
  },
  {
    name: "Petals & Perks",
    href: "https://www.petalsandperks.com/",
    wordmark: true,
  },
  {
    name: "Victoria's Floral Weddings",
    href: "https://www.victoriasfloralweddings.com/",
    imageSrc: "/client-logos/victorias-floral-weddings.png",
    imageAlt: "Victoria's Floral Weddings logo",
    imageClassName: "object-cover",
  },
];

function TechStackSection() {
  return (
    <section className="z-10 border-x full-line-bottom relative">
      <h2 className="pl-4 text-3xl font-semibold relative full-line-bottom">
        Client Work
      </h2>
      <div className="grid gap-px bg-border md:grid-cols-2">
        {featuredClients.map((client) => (
          <a
            key={client.name}
            href={client.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-background p-6 transition-colors hover:bg-muted/30"
          >
            <div className="flex min-h-56 flex-col justify-between gap-6">
              <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-lg border bg-white">
                {client.wordmark ? (
                  <div className="flex h-full w-full items-center justify-center bg-[#f7f1e8] px-6 text-center">
                    <div>
                      <p className="font-serif text-4xl italic tracking-tight text-[#6f4d38]">
                        Petals &amp; Perks
                      </p>
                      <p className="mt-2 font-mono text-xs uppercase tracking-[0.28em] text-[#8a6d56]">
                        Frankfort, Michigan
                      </p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={client.imageSrc}
                    alt={client.imageAlt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className={`transition-transform duration-300 group-hover:scale-[1.02] ${client.imageClassName}`}
                  />
                )}
              </div>

              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Featured site
                </p>
                <h3 className="text-xl font-semibold">{client.name}</h3>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default TechStackSection;
