"use client";

import { BUSINESS_INFO, FOOTER_LINKS } from "@/utils/constants";

export function Footer() {
  return (
    <footer className="relative z-20 bg-black border-t border-white/10 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-xl" />
                <div className="absolute inset-[2px] bg-black rounded-[9px] flex items-center justify-center">
                  <span className="text-lg font-black bg-gradient-to-br from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {BUSINESS_INFO.name.charAt(0)}
                  </span>
                </div>
              </div>
              <span className="text-lg font-bold">{BUSINESS_INFO.name}</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              {BUSINESS_INFO.description}
            </p>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-4 text-white">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            {BUSINESS_INFO.copyright}
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Privacy</a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

