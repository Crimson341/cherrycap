import { BriefcaseBusiness, CodeXml, Mail, MapPin } from "lucide-react";
import React from "react";

function BioSection() {
  const bioData = [
    {
      icon: CodeXml,
      title: "Cherry Capital - Custom Website Studio",
      type: "text",
    },
    { icon: BriefcaseBusiness, title: "Cherry Capital", type: "text" },
    { icon: MapPin, title: "Beulah, Michigan", type: "text" },
    { icon: Mail, title: "scott@cherrycapitalweb.com", type: "link" },
  ];
  return (
    <section className="relative flex full-line-bottom h-auto border-x p-4 gap-2 flex-col items-center justify-center">
      {bioData.map((item, index) => (
        <div
          key={index}
          className="w-full flex items-center justify-start gap-4 font-mono text-sm "
        >
          <div className="bg-muted shrink-0  text-muted-foreground size-6 flex items-center justify-center rounded-sm ">
            <item.icon className="size-4" />
          </div>{" "}
          {item.type === "link" ? (
            <a
              target="_blank"
              href={
                item.title.includes("@")
                  ? `mailto:${item.title}`
                  : `https://${item.title}`
              }
              className="text-balance  hover:underline"
            >
              {item.title}
            </a>
          ) : (
            <span className="text-balance">{item.title}</span>
          )}
        </div>
      ))}
    </section>
  );
}

export default BioSection;
