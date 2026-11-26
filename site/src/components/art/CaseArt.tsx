import { useId, useMemo } from "react";
import { seeded } from "@/lib/random";

/**
 * Процедурные «кадры» 3D-роликов для витрины работ.
 * Это SVG-заглушки — замените на реальные стоп-кадры (<img>), когда они появятся.
 */
export type CaseKind = "molecule" | "micro" | "brand" | "packshot";

export function CaseArt({ kind }: { kind: CaseKind }) {
  const uid = useId().replace(/:/g, "");
  switch (kind) {
    case "molecule":
      return <Molecule uid={uid} />;
    case "micro":
      return <Micro uid={uid} />;
    case "brand":
      return <Brand uid={uid} />;
    default:
      return <Packshot uid={uid} />;
  }
}

const svgProps = {
  viewBox: "0 0 400 300",
  preserveAspectRatio: "xMidYMid slice",
  className: "h-full w-full",
  "aria-hidden": true,
} as const;

/** Молекула встраивается в карман белка: глянцевая «пузырчатая» поверхность. */
function Molecule({ uid }: { uid: string }) {
  const blobs = useMemo(() => {
    const rnd = seeded(11);
    const out: { x: number; y: number; r: number; depth: number }[] = [];
    let guard = 0;
    while (out.length < 150 && guard++ < 4000) {
      const x = rnd() * 440 - 20;
      const y = rnd() * 340 - 20;
      // карман в центре
      const dx = (x - 215) / 120;
      const dy = (y - 140) / 75;
      if (dx * dx + dy * dy < 1) continue;
      out.push({ x, y, r: 10 + rnd() * 22, depth: rnd() });
    }
    return out.sort((a, b) => a.depth - b.depth);
  }, []);
  const atoms: [number, number][] = [
    [170, 120], [190, 108], [212, 120], [212, 145], [190, 157], [170, 145],
    [234, 108], [256, 120], [256, 145], [234, 157],
    [150, 108], [278, 108], [278, 160], [128, 120],
  ];
  const bonds: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [2, 6], [6, 7], [7, 8], [8, 9], [9, 3], [0, 10], [7, 11], [8, 12], [10, 13],
  ];
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B0A2B" />
          <stop offset="1" stopColor="#24186A" />
        </linearGradient>
        <radialGradient id={`blob${uid}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#D9CCFF" />
          <stop offset="0.25" stopColor="#8D6BFF" />
          <stop offset="0.7" stopColor="#3B2AA8" />
          <stop offset="1" stopColor="#140E4A" />
        </radialGradient>
        <radialGradient id={`blob2${uid}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#BFD4FF" />
          <stop offset="0.3" stopColor="#4C7BFF" />
          <stop offset="1" stopColor="#0F1C66" />
        </radialGradient>
        <radialGradient id={`pocket${uid}`} cx="50%" cy="48%" r="50%">
          <stop offset="0" stopColor="#7C5CFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7C5CFF" stopOpacity="0" />
        </radialGradient>
        <filter id={`blur${uid}`}>
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id={`glow${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="300" fill={`url(#bg${uid})`} />
      <ellipse cx="215" cy="138" rx="150" ry="100" fill={`url(#pocket${uid})`} />
      {blobs.map((b, i) => (
        <circle
          key={i}
          cx={b.x}
          cy={b.y}
          r={b.r * (0.6 + b.depth * 0.6)}
          fill={`url(#${i % 4 === 0 ? "blob2" : "blob"}${uid})`}
          opacity={0.45 + b.depth * 0.55}
          filter={b.depth < 0.35 ? `url(#blur${uid})` : undefined}
        />
      ))}
      <g filter={`url(#glow${uid})`}>
        {bonds.map(([a, b], i) => (
          <line key={i} x1={atoms[a][0]} y1={atoms[a][1]} x2={atoms[b][0]} y2={atoms[b][1]} stroke="#F2EDFF" strokeWidth="3" strokeLinecap="round" />
        ))}
        {atoms.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i > 9 ? 6 : 4.5} fill={i === 11 || i === 13 ? "#FF7A9A" : i === 12 ? "#7FF0E6" : "#FFFFFF"} />
        ))}
      </g>
    </svg>
  );
}

/** Микромир: нити фибрина и эритроциты с глубиной резкости. */
function Micro({ uid }: { uid: string }) {
  const { fibers, cells } = useMemo(() => {
    const rnd = seeded(23);
    const fibers = Array.from({ length: 46 }, () => {
      const x1 = rnd() * 400;
      const y1 = rnd() * 300;
      const a = rnd() * Math.PI;
      const len = 120 + rnd() * 260;
      const x2 = x1 + Math.cos(a) * len;
      const y2 = y1 + Math.sin(a) * len;
      const cx = (x1 + x2) / 2 + (rnd() - 0.5) * 80;
      const cy = (y1 + y2) / 2 + (rnd() - 0.5) * 80;
      return { d: `M${x1 - Math.cos(a) * 200} ${y1 - Math.sin(a) * 200} Q${cx} ${cy} ${x2} ${y2}`, w: 0.4 + rnd() * 1.4, o: 0.2 + rnd() * 0.5 };
    });
    const cells = [
      { x: 70, y: 70, r: 44, blur: 0 },
      { x: 300, y: 205, r: 58, blur: 5 },
      { x: 205, y: 120, r: 30, blur: 0 },
      { x: 120, y: 220, r: 26, blur: 1.5 },
      { x: 340, y: 60, r: 22, blur: 2 },
      { x: 250, y: 40, r: 14, blur: 2.5 },
      { x: 30, y: 180, r: 18, blur: 3 },
      { x: 175, y: 260, r: 40, blur: 6 },
    ];
    return { fibers, cells };
  }, []);
  return (
    <svg {...svgProps}>
      <defs>
        <radialGradient id={`bg${uid}`} cx="40%" cy="40%" r="80%">
          <stop offset="0" stopColor="#2C4352" />
          <stop offset="0.6" stopColor="#14222E" />
          <stop offset="1" stopColor="#090F16" />
        </radialGradient>
        <radialGradient id={`cell${uid}`} cx="45%" cy="42%" r="55%">
          <stop offset="0" stopColor="#7E1426" />
          <stop offset="0.45" stopColor="#B8293F" />
          <stop offset="0.75" stopColor="#E9566C" />
          <stop offset="0.92" stopColor="#B32A3F" />
          <stop offset="1" stopColor="#5E0C18" />
        </radialGradient>
        {[1.5, 2, 2.5, 3, 5, 6].map((b) => (
          <filter key={b} id={`b${b * 10}${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={b} />
          </filter>
        ))}
      </defs>
      <rect width="400" height="300" fill={`url(#bg${uid})`} />
      <g fill="none" stroke="#DCE6EA" strokeLinecap="round">
        {fibers.map((f, i) => (
          <path key={i} d={f.d} strokeWidth={f.w} strokeOpacity={f.o} />
        ))}
      </g>
      {cells.map((c, i) => (
        <g key={i} filter={c.blur ? `url(#b${c.blur * 10}${uid})` : undefined}>
          <ellipse cx={c.x} cy={c.y} rx={c.r} ry={c.r * 0.92} fill={`url(#cell${uid})`} />
          <ellipse cx={c.x - c.r * 0.3} cy={c.y - c.r * 0.45} rx={c.r * 0.35} ry={c.r * 0.12} fill="#fff" opacity="0.25" />
        </g>
      ))}
    </svg>
  );
}

/** Запуск бренда: три стеклянные карточки-этапа. */
function Brand({ uid }: { uid: string }) {
  const cards = [
    { x: 40, n: "01", t: "Айдентика" },
    { x: 150, n: "02", t: "Упаковка" },
    { x: 260, n: "03", t: "Ролик" },
  ];
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0C1638" />
          <stop offset="1" stopColor="#1E3378" />
        </linearGradient>
        <linearGradient id={`card${uid}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id={`glow${uid}`}>
          <stop offset="0" stopColor="#246BFD" stopOpacity="0.6" />
          <stop offset="1" stopColor="#246BFD" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#bg${uid})`} />
      <ellipse cx="200" cy="170" rx="210" ry="120" fill={`url(#glow${uid})`} />
      <g fontFamily="IBM Plex Mono, monospace">
        {cards.map((c, i) => (
          <g key={c.n} transform={`translate(${c.x} ${70 - i * 6}) skewY(-6)`}>
            <rect width="100" height="160" rx="12" fill={`url(#card${uid})`} stroke="#9DB8FF" strokeOpacity="0.55" />
            <text x="14" y="34" fill="#fff" fontSize="22" fontWeight="300">
              {c.n}
            </text>
            <text x="14" y="54" fill="#B9C9F5" fontSize="9" fontFamily="Onest, sans-serif">
              {c.t}
            </text>
            <circle cx="50" cy="108" r="22" fill="none" stroke="#8FB0FF" strokeOpacity="0.7" />
            {i === 0 && <circle cx="50" cy="108" r="8" fill="#246BFD" />}
            {i === 1 && <rect x="38" y="96" width="24" height="24" rx="3" fill="none" stroke="#fff" strokeWidth="1.5" />}
            {i === 2 && <path d="M44 98 l16 10 l-16 10 Z" fill="#20C7B7" />}
            <rect x="14" y="140" width="50" height="3" rx="1.5" fill="#fff" opacity="0.35" />
          </g>
        ))}
      </g>
      <g stroke="#7FA2FF" strokeOpacity="0.8" strokeWidth="1.2" fill="none">
        <path d="M142 150 h6 m-3 -3 l3 3 l-3 3" />
        <path d="M252 140 h6 m-3 -3 l3 3 l-3 3" />
      </g>
    </svg>
  );
}

/** Пэкшот: стеклянный куб в синем свете. */
function Packshot({ uid }: { uid: string }) {
  return (
    <svg {...svgProps}>
      <defs>
        <radialGradient id={`bg${uid}`} cx="55%" cy="35%" r="80%">
          <stop offset="0" stopColor="#2453D6" />
          <stop offset="0.5" stopColor="#0B1F63" />
          <stop offset="1" stopColor="#040A26" />
        </radialGradient>
        <linearGradient id={`top${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9CC0FF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#2E64F0" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`left${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A5BE8" stopOpacity="0.85" />
          <stop offset="1" stopColor="#0A1E6B" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`right${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1A3FB8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#06134A" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`floor${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B6CFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#3B6CFF" stopOpacity="0" />
        </linearGradient>
        <filter id={`glow${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="300" fill={`url(#bg${uid})`} />
      {/* пол */}
      <path d="M0 230 L400 200 L400 300 L0 300 Z" fill="#030820" opacity="0.6" />
      <path d="M110 232 L200 262 L310 222 L220 196 Z" fill={`url(#floor${uid})`} />
      {/* куб */}
      <g filter={`url(#glow${uid})`}>
        <path d="M110 120 L200 150 L200 262 L110 232 Z" fill={`url(#left${uid})`} />
        <path d="M200 150 L310 110 L310 222 L200 262 Z" fill={`url(#right${uid})`} />
        <path d="M110 120 L220 84 L310 110 L200 150 Z" fill={`url(#top${uid})`} />
        <g stroke="#CFE0FF" strokeOpacity="0.9" strokeWidth="1.2" fill="none">
          <path d="M110 120 L200 150 L310 110 M200 150 L200 262" />
        </g>
      </g>
      {/* сетка на гранях */}
      <g stroke="#BFD3FF" strokeOpacity="0.25" strokeWidth="0.7">
        {Array.from({ length: 6 }, (_, i) => {
          const t = (i + 1) / 7;
          return (
            <g key={i}>
              <line x1={200 + 110 * t} y1={150 - 40 * t} x2={200 + 110 * t} y2={262 - 40 * t} />
              <line x1={200} y1={150 + 112 * t} x2={310} y2={110 + 112 * t} />
            </g>
          );
        })}
      </g>
      {/* блик */}
      <path d="M128 124 L210 98 L230 104 L148 131 Z" fill="#fff" opacity="0.35" />
    </svg>
  );
}
