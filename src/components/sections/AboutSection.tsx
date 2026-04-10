import React from "react";

function AboutSection() {
  return (
    <section className="px-4 border-x full-line-bottom relative">
      <h2 className="text-3xl font-semibold relative full-line-bottom ">
        About
      </h2>
      <div className="flex flex-col gap-4 py-4 font-mono text-sm ">
        <p className="tracking-wide">
          I run Cherry Capital out of Beulah, Michigan. Most of the people I
          work with are local business owners who are tired of sites that feel
          dated, load slowly, or never really explained what they do in the
          first place.
        </p>
        <p className="tracking-wide">
          My process is pretty simple. I learn the business, clean up the
          message, design something that actually feels like the owner behind
          it, and build it to be fast on phones and easy to update later. You
          are not getting passed between a sales person, a designer, and a dev.
          You are just working with me.
        </p>
        <p className="tracking-wide">
          If you want a website that feels more personal, looks more credible,
          and helps people contact you without fighting the layout, email
          <strong> scott@cherrycapitalweb.com</strong>.
        </p>
      </div>
    </section>
  );
}

export default AboutSection;
