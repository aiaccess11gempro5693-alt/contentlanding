import { formats } from "@/content";
import { Reveal } from "@/components/ui/Reveal";

/** Стена форматов — чипы. Первые пять (3D и моушн) выделены как главная экспертиза. */
export function Formats() {
  return (
    <section className="relative pb-16 lg:pb-24" aria-labelledby="formats-title">
      <div className="container">
        <h2 id="formats-title" className="mb-6 text-[26px] font-medium tracking-[-0.02em] sm:text-[32px]">
          {formats.title}
        </h2>
        <Reveal>
          <ul className="flex flex-wrap gap-2">
            {formats.items.map((f, i) => (
              <li
                key={f}
                className={`rounded-full px-4 py-2 text-[14px] transition-colors ${
                  i < 5
                    ? "border border-brand/30 bg-brand/[0.07] text-brand"
                    : "glass-card text-ink-soft hover:text-ink"
                }`}
              >
                {f}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
