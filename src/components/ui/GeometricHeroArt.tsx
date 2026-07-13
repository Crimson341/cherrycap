import { cn } from "@/lib/utils";

export function BlueGeometry({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="bgPanel" x1="80" y1="40" x2="340" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9EC9E0" />
          <stop offset="0.35" stopColor="#4A8FB8" />
          <stop offset="0.7" stopColor="#1F5F8A" />
          <stop offset="1" stopColor="#0F3A5C" />
        </linearGradient>
        <linearGradient id="bgSphereA" x1="130" y1="210" x2="200" y2="290" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6BA8C9" />
          <stop offset="0.5" stopColor="#1A4D70" />
          <stop offset="1" stopColor="#0A2840" />
        </linearGradient>
        <linearGradient id="bgSphereB" x1="155" y1="250" x2="215" y2="310" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7BB5D4" />
          <stop offset="1" stopColor="#0D3555" />
        </linearGradient>
        <linearGradient id="bgRod" x1="120" y1="200" x2="300" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="#061F33" />
          <stop offset="0.4" stopColor="#163D5C" />
          <stop offset="1" stopColor="#2E6A94" />
        </linearGradient>
        <filter id="bgSoft" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="4" dy="14" stdDeviation="12" floodColor="#000" floodOpacity="0.22" />
        </filter>
        <filter id="bgSphereShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main tilted blue plane (parallelogram-ish) */}
      <g filter="url(#bgSoft)" transform="translate(20 10) rotate(-22 200 230)">
        <path d="M70 30 L350 8 L390 340 L40 390 Z" fill="url(#bgPanel)" />
        {/* subtle face highlight */}
        <path d="M70 30 L350 8 L360 90 L90 120 Z" fill="white" fillOpacity="0.12" />
        <path d="M40 390 L390 340 L370 390 L55 420 Z" fill="#0A2A45" fillOpacity="0.25" />
      </g>

      {/* Tall white spike / triangle */}
      <path
        d="M118 20 L158 20 L195 400 L78 400 Z"
        fill="#FFFFFF"
        transform="rotate(-14 136 210)"
      />
      <path
        d="M125 40 L150 40 L175 380 L95 380 Z"
        fill="#F0F4F7"
        fillOpacity="0.55"
        transform="rotate(-14 136 210)"
      />

      {/* Stacked spheres */}
      <g filter="url(#bgSphereShadow)">
        <ellipse cx="155" cy="248" rx="48" ry="46" fill="url(#bgSphereA)" />
        <ellipse cx="148" cy="228" rx="22" ry="12" fill="white" fillOpacity="0.22" />
        <ellipse cx="178" cy="278" rx="38" ry="36" fill="url(#bgSphereB)" />
        <ellipse cx="172" cy="262" rx="16" ry="9" fill="white" fillOpacity="0.18" />
      </g>

      {/* Diagonal cylinder / rod */}
      <g transform="rotate(32 200 250)" filter="url(#bgSphereShadow)">
        <rect x="95" y="228" width="210" height="36" rx="18" fill="url(#bgRod)" />
        <ellipse cx="95" cy="246" rx="12" ry="18" fill="#0A2035" />
        <ellipse cx="305" cy="246" rx="12" ry="18" fill="#3A7AA3" />
        <rect x="110" y="234" width="50" height="8" rx="4" fill="white" fillOpacity="0.15" />
      </g>
    </svg>
  );
}

/** Bottom-left black composition */
export function BlackGeometry({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="bkSoft" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodOpacity="0.15" />
        </filter>
      </defs>
      <g filter="url(#bkSoft)" transform="rotate(-14 200 180)">
        {/* main black mass */}
        <path
          d="M10 55 L360 15 L400 235 L55 295 Z"
          fill="#0A0A0A"
        />
        {/* white triangular cut */}
        <path d="M95 145 L255 105 L115 235 Z" fill="#FFFFFF" />
        {/* diagonal score lines bottom-left of form */}
        <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.9">
          <line x1="95" y1="210" x2="155" y2="252" />
          <line x1="108" y1="198" x2="170" y2="242" />
          <line x1="122" y1="186" x2="185" y2="232" />
          <line x1="136" y1="174" x2="198" y2="220" />
        </g>
      </g>
    </svg>
  );
}

/** Yellow brand mark — double ring + center on yellow disc (like reference) */
export function YellowRingMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      className={cn("size-11 shrink-0 md:size-14", className)}
      aria-hidden="true"
    >
      <circle cx="28" cy="28" r="26" fill="#F4E44A" />
      <circle
        cx="28"
        cy="28"
        r="14"
        fill="none"
        stroke="#111111"
        strokeWidth="3.5"
      />
      <circle
        cx="28"
        cy="28"
        r="6.5"
        fill="none"
        stroke="#111111"
        strokeWidth="2.5"
      />
      {/* tiny C-like notch for logo feel */}
      <path
        d="M34 22.5 A9 9 0 1 1 34 33.5"
        fill="none"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Black square + taller yellow bar before third line */
export function AccentBars({ className }: { className?: string }) {
  return (
    <span
      className={cn("mb-1 inline-flex items-end gap-[3px]", className)}
      aria-hidden="true"
    >
      <span className="block size-[0.72em] bg-black" />
      <span className="block h-[1.15em] w-[0.72em] bg-[#F4E44A]" />
    </span>
  );
}

export function GlyphRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} aria-hidden="true">
      <span className="size-3 rounded-full border-[1.5px] border-black" />
      <span className="size-3 rounded-full border-[1.5px] border-black" />
      <span className="relative size-3.5">
        <span className="absolute inset-0 rotate-45 bg-black" />
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-px rotate-45 bg-black" />
      </span>
      <span className="size-3 rotate-45 border-[1.5px] border-black" />
      <span className="size-3 rotate-45 border-[1.5px] border-black" />
    </div>
  );
}

export function RuleStack({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-11 flex-col gap-[7px]", className)} aria-hidden="true">
      <span className="h-px w-full bg-black" />
      <span className="h-px w-full bg-black" />
      <span className="h-px w-full bg-black" />
    </div>
  );
}
