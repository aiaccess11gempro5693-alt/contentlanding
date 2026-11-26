import { clients } from "@/content";
import { Reveal } from "@/components/ui/Reveal";

/** Клиенты — только текстом, без логотипов. */
export function Clients() {
  return (
    <section id="clients" className="relative pb-16 lg:pb-24" aria-labelledby="clients-title">
      <div className="container">
        <div className="label-mono mb-5">
          <span className="text-brand">04</span> — <span id="clients-title">{clients.title}</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {clients.featured.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.08}>
              <div className="glass-card flex h-full flex-col gap-3 rounded-[20px] p-6 sm:flex-row sm:items-center sm:gap-8 lg:p-8">
                <div className="text-[30px] font-medium tracking-[-0.03em] sm:min-w-[220px] lg:text-[36px]">{c.name}</div>
                <p className="text-[14px] leading-relaxed text-ink-soft">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {clients.others.map((o) => (
            <li key={o} className="rounded-full border border-dashed border-ink/15 px-4 py-2 font-mono text-[12px] text-ink-mute">
              {o}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
