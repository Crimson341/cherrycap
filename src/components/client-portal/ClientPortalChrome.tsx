import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";

export function ClientPortalChrome({
  children,
  eyebrow,
  title,
  description,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-[#f1eee7] text-[#171715]">
      <header className="border-b border-black/15 px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-[-0.03em]">
            <span className="grid size-9 place-items-center rounded-full bg-[#b82f35] text-white">
              C
            </span>
            <span>Cherry Capital</span>
          </Link>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-black/55">
            <LockKeyhole size={14} /> Secure client access
          </div>
        </div>
      </header>

      <section className="border-b border-black/15 px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-[#9d282e]">
              {eyebrow}
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] md:text-7xl">
              {title}
            </h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-black/62 md:text-lg">
            {description}
          </p>
        </div>
      </section>

      <section className="px-5 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-7xl">{children}</div>
      </section>

      <footer className="border-t border-black/15 px-5 py-6 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-black/55">
          <Link href="/" className="inline-flex items-center gap-2 hover:text-black">
            <ArrowLeft size={15} /> Back to the studio
          </Link>
          <Link href="/#contact" className="inline-flex items-center gap-2 hover:text-black">
            Need help? Contact Cherry Capital <ArrowRight size={15} />
          </Link>
        </div>
      </footer>
    </main>
  );
}

export function ClientAuthUnavailable() {
  return (
    <div className="grid overflow-hidden rounded-[2rem] border border-black/15 bg-[#181816] text-white lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-7 md:p-12">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
          Account access
        </p>
        <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.045em] md:text-5xl">
          The private client area is being prepared.
        </h2>
        <p className="mt-5 max-w-xl leading-7 text-white/62">
          Client accounts are not open yet. Existing projects are still handled directly,
          and no customer information is exposed while setup is in progress.
        </p>
      </div>
      <div className="border-t border-white/10 bg-[#b82f35] p-7 lg:border-l lg:border-t-0 md:p-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/65">
          Already working together?
        </p>
        <p className="mt-4 text-2xl font-medium tracking-[-0.035em]">
          Send a note and I’ll get you what you need.
        </p>
        <Link
          href="/#contact"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-[#181816]"
        >
          Contact the studio <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
