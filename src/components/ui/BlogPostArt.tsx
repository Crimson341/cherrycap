import { cn } from "@/lib/utils";

export function BlogPostArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 450"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
    >
      {/* faint grid backdrop */}
      <g className="stroke-border/40" strokeWidth={1}>
        {[80, 160, 240, 320, 400, 480, 560, 640, 720].map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={450} />
        ))}
        {[90, 180, 270, 360].map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={800} y2={y} />
        ))}
      </g>

      {/* circuit traces + nodes */}
      <g className="stroke-primary/50" strokeWidth={2} strokeLinecap="round">
        <path d="M70 360 L70 300 L150 300 L150 250" />
        <path d="M730 90 L730 150 L650 150 L650 210" />
        <path d="M120 95 L200 95" />
        <path d="M600 360 L680 360" />
      </g>
      <g className="fill-background stroke-primary" strokeWidth={2}>
        <circle cx={70} cy={360} r={6} />
        <circle cx={150} cy={250} r={6} />
        <circle cx={730} cy={90} r={6} />
        <circle cx={650} cy={210} r={6} />
        <circle cx={200} cy={95} r={6} />
        <circle cx={680} cy={360} r={6} />
      </g>

      {/* floating pixel accents (matches the site's pixel motif) */}
      <g className="fill-primary/80">
        <rect x={108} y={150} width={12} height={12} />
        <rect x={124} y={150} width={12} height={12} />
        <rect x={108} y={166} width={12} height={12} />
        <rect x={690} y={280} width={12} height={12} />
        <rect x={690} y={296} width={12} height={12} />
        <rect x={706} y={296} width={12} height={12} />
      </g>

      {/* terminal / code window */}
      <g>
        <rect
          x={230}
          y={110}
          width={340}
          height={230}
          rx={12}
          className="fill-card stroke-border"
          strokeWidth={2}
        />
        {/* title bar */}
        <line x1={230} y1={146} x2={570} y2={146} className="stroke-border" strokeWidth={2} />
        <circle cx={254} cy={128} r={6} className="fill-primary" />
        <circle cx={276} cy={128} r={6} className="fill-muted-foreground/60" />
        <circle cx={298} cy={128} r={6} className="fill-border" />

        {/* prompt + code lines */}
        <g strokeLinecap="round">
          {/* line 1: prompt chevron + command */}
          <path d="M256 176 l10 8 l-10 8" className="stroke-primary" strokeWidth={3} fill="none" />
          <rect x={282} y={172} width={150} height={9} rx={4} className="fill-foreground/35" />
          {/* line 2 */}
          <rect x={256} y={204} width={70} height={9} rx={4} className="fill-primary/70" />
          <rect x={336} y={204} width={120} height={9} rx={4} className="fill-muted-foreground/45" />
          {/* line 3 (indented) */}
          <rect x={280} y={232} width={100} height={9} rx={4} className="fill-muted-foreground/45" />
          <rect x={390} y={232} width={64} height={9} rx={4} className="fill-primary/70" />
          {/* line 4 (indented) */}
          <rect x={280} y={260} width={130} height={9} rx={4} className="fill-foreground/35" />
          {/* line 5 */}
          <rect x={256} y={288} width={54} height={9} rx={4} className="fill-primary/70" />
          {/* blinking cursor block */}
          <rect x={322} y={284} width={14} height={16} className="fill-primary">
            <animate
              attributeName="opacity"
              values="1;1;0;0;1"
              keyTimes="0;0.4;0.5;0.9;1"
              dur="1.1s"
              repeatCount="indefinite"
            />
          </rect>
        </g>
      </g>

      {/* </> glyph */}
      <g className="stroke-primary" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M150 380 l-20 16 l20 16" />
        <path d="M650 38 l20 16 l-20 16" />
      </g>
    </svg>
  );
}
