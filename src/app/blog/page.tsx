import Link from "next/link";
import { ArrowDownRight, ArrowRight, Clock } from "lucide-react";
import { BlogStructuredData } from "@/components/BlogStructuredData";
import { BlogBrandFooter, BlogBrandHeader } from "@/components/blog/BlogBrandChrome";
import { publishedBlogPosts } from "@/lib/blogPosts";

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPage() {
  const posts = [...publishedBlogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const latest = posts[0];
  const archive = posts.slice(1);

  return (
    <div className="cc-page cc-blog-page">
      <BlogStructuredData />
      <a className="cc-skip" href="#journal-content">Skip to journal</a>
      <BlogBrandHeader />

      <main id="journal-content">
        <section className="cc-journal-hero">
          <div className="cc-journal-edition">
            <span>Vol. 01</span>
            <span>Beulah, Michigan</span>
            <span>Ideas for the independent web</span>
          </div>
          <div className="cc-journal-title">
            <p className="cc-eyebrow">The Cherry Capital journal</p>
            <h1>Field<br /><em>Notes.</em></h1>
          </div>
          <div className="cc-journal-intro">
            <p>
              Practical ideas on better websites, sharper brands, local growth,
              and the work behind building things that last.
            </p>
            <a href="#latest">Read the latest <ArrowDownRight size={17} /></a>
          </div>
          <div className="cc-journal-seal" aria-hidden="true">
            <span>CC</span><small>Journal<br />Est. 2024</small>
          </div>
        </section>

        <section className="cc-journal-topics" aria-label="Journal topics">
          <span>Design direction</span><i>✦</i>
          <span>Modern development</span><i>✦</i>
          <span>Local business</span><i>✦</i>
          <span>Behind the build</span>
        </section>

        {latest && (
          <section className="cc-journal-latest cc-section" id="latest">
            <div className="cc-journal-section-label">
              <span>Latest dispatch</span>
              <span>{formatDate(latest.publishedAt)}</span>
            </div>
            <Link href={`/blog/${latest.slug}`} className="cc-feature-story">
              <div className="cc-feature-art" aria-hidden="true">
                <div className="cc-feature-art-grid" />
                <span className="cc-feature-issue">Issue No. 01</span>
                <div className="cc-feature-window">
                  <span /><span /><span />
                  <strong>Ideas<br />into<br /><em>impact.</em></strong>
                </div>
                <span className="cc-feature-arrow"><ArrowRight /></span>
              </div>
              <div className="cc-feature-copy">
                <div className="cc-story-meta">
                  <span>{latest.category}</span>
                  <span><Clock size={13} /> {latest.readTime}</span>
                </div>
                <h2>{latest.title}</h2>
                <p>{latest.excerpt}</p>
                <div className="cc-story-tags">
                  {latest.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <span className="cc-read-story">Read the story <ArrowRight size={18} /></span>
              </div>
            </Link>
          </section>
        )}

        <section className="cc-journal-manifesto">
          <p className="cc-eyebrow">Why write it down?</p>
          <div>
            <h2>The work gets better when the thinking is visible.</h2>
            <p>
              This journal is where I unpack real decisions from real projects:
              the parts that worked, the parts I would change, and the useful
              lessons hiding between design and launch.
            </p>
          </div>
          <ol>
            <li><span>01</span><strong>Real projects</strong><p>Notes pulled from work actually being designed and built.</p></li>
            <li><span>02</span><strong>Plain language</strong><p>No jargon wall between a good idea and the person who needs it.</p></li>
            <li><span>03</span><strong>One perspective</strong><p>Directly from the person doing the strategy, design, and code.</p></li>
          </ol>
        </section>

        <section className="cc-journal-archive cc-section">
          <div className="cc-archive-heading">
            <p className="cc-eyebrow">From the archive</p>
            <h2>More to<br /><em>explore.</em></h2>
          </div>
          <div className="cc-archive-list">
            {archive.length ? archive.map((post, index) => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <span className="cc-archive-number">{String(index + 2).padStart(2, "0")}</span>
                <div>
                  <p>{post.category} · {formatDate(post.publishedAt)}</p>
                  <h3>{post.title}</h3>
                  <span>{post.excerpt}</span>
                </div>
                <span className="cc-archive-read">{post.readTime} <ArrowRight size={18} /></span>
              </Link>
            )) : (
              <p className="cc-archive-empty">More field notes are on the way.</p>
            )}
          </div>
        </section>

        <section className="cc-journal-cta">
          <p className="cc-eyebrow">Have a project in mind?</p>
          <h2>Let’s make the next<br />good thing <em>real.</em></h2>
          <Link href="/#contact">Start a conversation <ArrowRight size={19} /></Link>
        </section>
      </main>

      <BlogBrandFooter />
    </div>
  );
}
