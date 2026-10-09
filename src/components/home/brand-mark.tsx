/* The Tutors Academy lockup, redrawn as a crisp vector: the TA monogram
   in deep navy with a metallic gold bevel, the graduation cap and tassel
   atop the T, the open book nestled in the A's counter, and the golden
   orbital swoosh arching through the letters. */

export function BrandMark({ size = 40, withWordmark = false }: { size?: number; withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="ta-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#DFB15B" />
            <stop offset="0.5" stopColor="#C59A3F" />
            <stop offset="1" stopColor="#9A7424" />
          </linearGradient>
          <linearGradient id="ta-navy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B192C" />
            <stop offset="1" stopColor="#070F2B" />
          </linearGradient>
        </defs>
        {/* orbital swoosh behind the letters */}
        <path
          d="M14 62 C 34 30, 66 26, 86 40"
          stroke="url(#ta-gold)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* T */}
        <path d="M28 34 h28 v7 h-10.5 v38 h-7 V41 H28 Z" fill="url(#ta-navy)" stroke="url(#ta-gold)" strokeWidth="1.6" />
        {/* A */}
        <path d="M60 79 L71 45 h6 L88 79 h-7.4 l-2.6-8 H66.6 L64 79 Z M68.6 65 h7.2 L72.2 53.6 Z" fill="url(#ta-navy)" stroke="url(#ta-gold)" strokeWidth="1.6" />
        {/* open book in the A's counter */}
        <path d="M68 70 c2.4-2 4.6-2 6-0.8 c1.4-1.2 3.6-1.2 6 0.8 v4 c-2.4-1.6-4.6-1.6-6-0.6 c-1.4-1-3.6-1-6 0.6 Z" fill="url(#ta-gold)" />
        {/* graduation cap atop the T */}
        <path d="M42 12 L64 20 L42 28 L20 20 Z" fill="url(#ta-navy)" stroke="url(#ta-gold)" strokeWidth="1.6" />
        <path d="M32 24 v6 c0 3 6 5 10 5 s10-2 10-5 v-6" fill="url(#ta-navy)" stroke="url(#ta-gold)" strokeWidth="1.4" />
        {/* tassel */}
        <path d="M64 20 v10" stroke="url(#ta-gold)" strokeWidth="1.6" />
        <circle cx="64" cy="33" r="2.6" fill="url(#ta-gold)" />
        {/* swoosh front pass */}
        <path d="M10 70 C 30 44, 62 40, 88 52" stroke="url(#ta-gold)" strokeWidth="3.4" strokeLinecap="round" opacity="0.75" />
      </svg>
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span
            className="text-lg font-semibold tracking-[0.08em]"
            style={{ fontFamily: "var(--ta-font-display)", color: "#0A192F" }}
          >
            TUTORS
          </span>
          <span className="text-[0.6rem] font-medium tracking-[0.34em]" style={{ color: "#C5A059" }}>
            ACADEMY
          </span>
        </span>
      ) : null}
    </span>
  );
}
