import { stats } from "@/content";
import { Reveal } from "@/components/ui/Reveal";
import { StatIcon } from "@/components/art/StatIcon";

/** Ряд цифр. Значения — ориентир, помечены соответствующей подписью. */
export function Stats() {
  return (
    <section className="relative pb-16 lg:pb-24" aria-label="Цифры">
      <div className="container">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {stats.items.map((s, i) => (
            <Reveal key={s.value} delay={i * 0.06}>
              <div className="glass-card relative h-full rounded-2xl p-4 sm:p-5 lg:p-7">
                <div className="flex items-start justify-between">
                  <StatIcon name={s.icon} />
                  <span className="hidden rounded-full border border-ink/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-mute sm:inline">
                    {stats.note}
                  </span>
                </div>
                <div className="mt-5 font-mono text-[36px] sm:text-[44px] font-normal leading-none tracking-[-0.04em] text-ink lg:mt-10 lg:text-[56px]">
                  {s.value}
                </div>
                <div className="mt-2 text-[15px] font-medium sm:text-[17px]">{s.label}</div>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-mute">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-ink-mute sm:hidden">* {stats.note.toLowerCase()} — цифры уточняются</p>
      </div>
    </section>
  );
}
