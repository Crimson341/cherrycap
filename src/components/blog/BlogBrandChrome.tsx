import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BlogBrandHeader() {
  return (
    <header className="cc-header cc-blog-header">
      <Link href="/" className="cc-brand" aria-label="Cherry Capital home">
        <span className="cc-brand-mark" aria-hidden="true"><span /><span /></span>
        <span>Cherry Capital</span>
      </Link>
      <nav className="cc-nav cc-blog-nav" aria-label="Journal navigation">
        <Link href="/">Studio</Link>
        <Link href="/#work">Work</Link>
        <Link href="/blog">Journal</Link>
      </nav>
      <Link className="cc-header-cta cc-blog-header-cta" href="/#contact">
        Start a project <ArrowRight size={16} />
      </Link>
    </header>
  );
}

export function BlogBrandFooter() {
  return (
    <footer className="cc-footer cc-blog-footer">
      <div className="cc-footer-top">
        <Link href="/" className="cc-brand cc-brand-footer">
          <span className="cc-brand-mark" aria-hidden="true"><span /><span /></span>
          <span>Cherry Capital</span>
        </Link>
        <p>Field notes from an independent web studio<br />in Northern Michigan.</p>
        <Link href="/#contact" className="cc-back-top">Start a project <ArrowRight size={16} /></Link>
      </div>
      <div className="cc-footer-bottom">
        <span>© {new Date().getFullYear()} Cherry Capital</span>
        <span>Beulah, Michigan</span>
        <div>
          <Link href="/">Studio</Link>
          <Link href="/blog">Journal</Link>
          <Link href="/portal">Client portal</Link>
        </div>
      </div>
    </footer>
  );
}
