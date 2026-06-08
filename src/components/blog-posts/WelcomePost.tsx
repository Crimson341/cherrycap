import React from 'react';
import { BlogContent, BlogHeading, BlogParagraph } from '@/components/BlogContent';

export function WelcomePost() {
  return (
    <BlogContent>
      <BlogParagraph>
        Welcome to Cherry Capital Web. I&apos;ve spent a lot of time building cool
        things — websites, apps, little projects that started as &ldquo;I wonder if I
        could&hellip;&rdquo; — and somewhere along the way I realized I needed a place
        to actually write the thinking down. So I made this. A blog. A home for the
        thoughts behind the work.
      </BlogParagraph>

      <BlogHeading>What this place is</BlogHeading>

      <BlogParagraph>
        Now that it&apos;s up and finalized, this is where I&apos;ll start sharing tips,
        breakdowns, and notes from the things I build — the kind of posts I&apos;d have
        loved to read when I was figuring it all out. Stick around, read a few, and get a
        feel for how I approach a project.
      </BlogParagraph>

      <BlogHeading>Why Cherry Capital is different</BlogHeading>

      <BlogParagraph>
        The short version is that I&apos;m a solo developer. I work on my own, so when you
        hire Cherry Capital you&apos;re talking straight to the person who actually builds
        your project. That&apos;s me. You get to know who you&apos;re working with, and I
        get to really understand what you&apos;re after, instead of it getting lost
        somewhere between a salesperson and whoever ends up writing the code.
      </BlogParagraph>

      <BlogHeading>If you want to work together</BlogHeading>

      <BlogParagraph>
        Once you&apos;ve had a look around and you&apos;re thinking about making the switch
        — hopefully to us — the next step is easy. We have a conversation. We talk through
        what you&apos;re trying to build, figure out the scope, and land on pricing that
        actually fits the project.
      </BlogParagraph>

      <BlogParagraph>
        And it doesn&apos;t have to be a website. It could be an app, a tool, or something
        nobody&apos;s built yet. If you&apos;ve got an idea, reach out and let&apos;s talk
        about it.
      </BlogParagraph>
    </BlogContent>
  );
}
