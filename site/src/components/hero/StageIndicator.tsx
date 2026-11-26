import { motion } from "framer-motion";
import { hero } from "@/content";

/** Вертикальная шкала 01–04 слева внизу + подпись текущего состояния сцены. */
export function StageIndicator({ stage }: { stage: number }) {
  const current = hero.stages[stage];
  return (
    <div className="pointer-events-none absolute bottom-6 left-0 right-0 lg:bottom-10">
      <div className="container flex items-end justify-between gap-6">
        <div className="flex items-end gap-5">
          <ol className="flex flex-col gap-1.5 font-mono text-[11px] text-ink-mute" aria-hidden>
            {hero.stages.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2">
                <span
                  className={`block w-px transition-all duration-500 ${
                    i === stage ? "h-6 bg-brand" : "h-3 bg-ink/20"
                  }`}
                />
                <span className={i === stage ? "text-brand" : ""}>{s.id}</span>
              </li>
            ))}
          </ol>
          <div className="hidden pb-0.5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-ink-mute sm:block">
            {hero.scrollHint.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        </div>
        <div className="glass-card min-w-[200px] max-w-[260px] rounded-xl px-4 py-3" aria-live="polite">
          <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="font-mono text-[11px] text-brand">
                {current.id} / 04 · {current.title}
              </div>
              <div className="mt-1 text-[13px] leading-snug text-ink-soft">{current.text}</div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}
