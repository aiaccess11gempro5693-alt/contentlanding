import { useId } from "react";
import { seeded } from "@/lib/random";

/** Лёгкие SVG-иллюстрации для карточек направлений (без WebGL). */
export function DirectionArt({ id }: { id: "visual" | "motion" | "interactive" | "humans" }) {
  const uid = useId().replace(/:/g, "");
  const svg = "absolute inset-0 h-full w-full overflow-visible";
  if (id === "visual") {
    return (
      <svg viewBox="0 0 240 170" className={svg} aria-hidden>
        <defs>
          <radialGradient id={`sph${uid}`} cx="38%" cy="32%" r="70%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.25" stopColor="#8FB3FF" />
            <stop offset="0.7" stopColor="#246BFD" />
            <stop offset="1" stopColor="#0F2F8F" />
          </radialGradient>
          <radialGradient id={`sh${uid}`}>
            <stop offset="0" stopColor="#1d3c8a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#1d3c8a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g stroke="#246BFD" strokeOpacity="0.25" fill="none">
          <ellipse cx="150" cy="88" rx="80" ry="26" transform="rotate(-14 150 88)" />
          <ellipse cx="150" cy="88" rx="58" ry="58" strokeDasharray="2 5" />
          <path d="M70 88h160M150 10v156" strokeOpacity="0.15" />
        </g>
        <ellipse cx="150" cy="150" rx="40" ry="7" fill={`url(#sh${uid})`} />
        <circle cx="150" cy="88" r="30" fill={`url(#sph${uid})`} />
        <circle cx="140" cy="77" r="6" fill="#fff" opacity="0.7" />
        <circle cx="222" cy="70" r="3.5" fill="#8D5CFF" />
        <circle cx="82" cy="108" r="2.5" fill="#20C7B7" />
      </svg>
    );
  }
  if (id === "motion") {
    const paths = Array.from({ length: 9 }, (_, i) => {
      const o = i * 6;
      return `M20 ${130 - o} C 70 ${40 - o}, 120 ${170 - o}, 170 ${80 - o} S 230 ${30 + o}, 240 ${60 + o * 0.5}`;
    });
    return (
      <svg viewBox="0 0 240 170" className={svg} aria-hidden>
        <defs>
          <linearGradient id={`rb${uid}`} x1="0" x2="1">
            <stop offset="0" stopColor="#246BFD" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="#5B7CFF" stopOpacity="0.9" />
            <stop offset="1" stopColor="#8D5CFF" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={`url(#rb${uid})`} strokeWidth={i === 4 ? 2.4 : 1} opacity={0.35 + (i % 3) * 0.2} />
        ))}
        <path d={paths[4]} fill="none" stroke="#fff" strokeWidth="6" opacity="0.5" />
        {[0.2, 0.45, 0.7].map((t, i) => (
          <circle key={i} cx={20 + 220 * t} cy={[92, 104, 60][i]} r="3" fill="#246BFD" />
        ))}
      </svg>
    );
  }
  if (id === "interactive") {
    return (
      <svg viewBox="0 0 240 170" className={svg} aria-hidden>
        <defs>
          <radialGradient id={`glow${uid}`}>
            <stop offset="0" stopColor="#20C7B7" stopOpacity="0.9" />
            <stop offset="1" stopColor="#20C7B7" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[62, 46, 32, 20].map((r, i) => (
          <circle key={r} cx="150" cy="86" r={r} fill="none" stroke="#20C7B7" strokeOpacity={0.15 + i * 0.15} />
        ))}
        <circle cx="150" cy="86" r="26" fill={`url(#glow${uid})`} />
        <circle cx="150" cy="86" r="6" fill="#fff" stroke="#20C7B7" strokeWidth="2" />
        <path
          d="M156 92 l0 44 l11 -11 l9 20 l8 -4 l-9 -19 l15 0 Z"
          fill="#fff"
          stroke="#18202A"
          strokeOpacity="0.5"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <g stroke="#18202A" strokeOpacity="0.12">
          <path d="M40 30h60M40 42h40M40 54h50" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  // humans — профиль из точек + звуковая волна
  const rnd = seeded(7);
  const dots: [number, number, number][] = [];
  for (let x = 118; x < 240; x += 4.2)
    for (let y = 8; y < 170; y += 4.2) dots.push([x + (rnd() - 0.5) * 2.4, y + (rnd() - 0.5) * 2.4, rnd()]);
  return (
    <svg viewBox="0 0 240 170" className={svg} aria-hidden>
      <defs>
        <clipPath id={`head${uid}`}>
          <path d="M222 170 C222 150 236 128 236 100 C238 56 214 16 176 12 C152 10 138 24 136 46 C135 54 132 60 128 68 C124 76 118 84 122 88 C126 91 132 90 133 94 C130 98 132 102 136 104 C133 108 134 112 138 114 C140 122 146 128 156 128 C164 128 166 140 164 170 Z" />
        </clipPath>
        <linearGradient id={`hg${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#8D5CFF" />
          <stop offset="1" stopColor="#246BFD" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#head${uid})`}>
        {dots.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={0.7 + r * 1.1} fill={`url(#hg${uid})`} opacity={0.3 + r * 0.65} />
        ))}
      </g>
      <g stroke="#8D5CFF" strokeLinecap="round" strokeWidth="3">
        {[10, 24, 16, 34, 20, 40, 18, 28, 12, 22, 8].map((h, i) => (
          <line key={i} x1={20 + i * 9} x2={20 + i * 9} y1={100 - h / 2} y2={100 + h / 2} strokeOpacity={0.3 + (i % 4) * 0.15} />
        ))}
      </g>
    </svg>
  );
}
