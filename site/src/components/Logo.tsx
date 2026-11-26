/** Знак «Катализ»: кластер точек, который собирается в центр. */
export function Logo({ className = "" }: { className?: string }) {
  const dots: [number, number, number, string][] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const r = i % 2 ? 11 : 7;
    dots.push([14 + Math.cos(a) * r, 14 + Math.sin(a) * r, i % 2 ? 1.1 : 1.5, i % 3 ? "#246BFD" : "#8D5CFF"]);
  }
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      {dots.map(([x, y, r, c], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={c} opacity={0.85} />
      ))}
      <circle cx="14" cy="14" r="3" fill="#246BFD" />
    </svg>
  );
}
