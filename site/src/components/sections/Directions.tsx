import { directions } from "@/content";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DirectionArt } from "@/components/art/DirectionArt";

const tint: Record<string, string> = {
  visual: "from-[#E6EEFF]",
  motion: "from-[#E4ECFB]",
  interactive: "from-[#DDF5F2]",
  humans: "from-[#ECE6FF]",
};

/** Четыре направления — стеклянные карточки с небольшой иллюстрацией. */
export function Directions() {
  return (
    <section id="directions" className="section" aria-labelledby="directions-title">
      <div className="container">
        <SectionHeading
          index="01"
          label="Направления"
          title={<span id="directions-title">{directions.lead}</span>}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {directions.items.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.07}>
              <article
                className={`glass-card group relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-[22px] bg-gradient-to-b ${tint[d.id]} to-white/40 p-6 transition-transform duration-500 hover:-translate-y-1`}
              >
                <div className="font-mono text-[11px] text-ink-mute">0{i + 1}</div>
                <h3 className="mt-3 text-[24px] font-medium tracking-[-0.02em]">{d.title}</h3>
                <div className="mt-1 text-[13px] text-brand">{d.subtitle}</div>
                <p className="mt-3 max-w-[260px] text-[14px] leading-relaxed text-ink-soft">{d.text}</p>
                <div className="relative mt-auto h-[170px]">
                  <DirectionArt id={d.id} />
                </div>
                <span className="absolute bottom-5 left-6 flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white/70 text-ink transition-colors group-hover:border-brand group-hover:text-brand">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M2 8h11m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
