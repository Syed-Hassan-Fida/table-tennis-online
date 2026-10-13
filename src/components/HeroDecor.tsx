/**
 * Decorative table-tennis art — static SVG + CSS motion only.
 * No client JS, no animation libraries, no heavy images.
 */
export function HeroDecor() {
  return (
    <div className="hero-decor" aria-hidden="true">
      <div className="hero-decor-glow" />

      <svg
        className="hero-decor-table"
        viewBox="0 0 320 200"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <defs>
          <linearGradient id="felt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f8f6a" />
            <stop offset="100%" stopColor="#0a5c48" />
          </linearGradient>
        </defs>
        <rect x="16" y="28" width="288" height="144" rx="10" fill="url(#felt)" />
        <rect
          x="16"
          y="28"
          width="288"
          height="144"
          rx="10"
          fill="none"
          stroke="rgba(244,245,240,0.35)"
          strokeWidth="3"
        />
        <line
          x1="160"
          y1="28"
          x2="160"
          y2="172"
          stroke="rgba(244,245,240,0.7)"
          strokeWidth="3"
        />
        <line
          x1="16"
          y1="100"
          x2="304"
          y2="100"
          stroke="rgba(244,245,240,0.28)"
          strokeWidth="2"
          strokeDasharray="6 8"
        />
      </svg>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="hero-decor-paddle hero-decor-paddle-left"
        src="/decor/paddle.svg"
        alt=""
        width={100}
        height={134}
        decoding="async"
        fetchPriority="low"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="hero-decor-paddle hero-decor-paddle-right"
        src="/decor/paddle.svg"
        alt=""
        width={120}
        height={160}
        decoding="async"
        fetchPriority="low"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="hero-decor-ball"
        src="/decor/ball.svg"
        alt=""
        width={56}
        height={56}
        decoding="async"
        fetchPriority="low"
      />

      <span className="hero-decor-streak hero-decor-streak-a" />
      <span className="hero-decor-streak hero-decor-streak-b" />
      <span className="hero-decor-orbit" />
    </div>
  );
}
