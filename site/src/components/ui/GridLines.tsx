/** Тонкие вертикальные линии сетки (12 колонок, видно 6) — фирменная «калибровка». */
export function GridLines({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="container grid h-full grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`border-l border-ink/[0.05] ${i >= 4 ? "hidden lg:block" : ""} ${i === 5 ? "border-r" : ""}`} />
        ))}
      </div>
    </div>
  );
}
