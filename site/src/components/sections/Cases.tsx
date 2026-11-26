import { cases } from "@/content";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CaseArt } from "@/components/art/CaseArt";

/** Витрина работ: процедурные «кадры» 3D-роликов (без внешних изображений). */
export function Cases() {
  return (
    <section id="works" className="section" aria-labelledby="works-title">
      <div className="container">
        <SectionHeading
          index="03"
          label="Кадры из роликов"
          title={<span id="works-title">{cases.title}</span>}
          aside={
            <a href="#contact" className="inline-flex items-center gap-2 text-[14px] text-brand hover:underline">
              {cases.more} <span aria-hidden>→</span>
            </a>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cases.items.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.07}>
              <article className="glass-card group h-full overflow-hidden rounded-[20px] p-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[14px]">
                  <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]">
                    <CaseArt kind={c.art} />
                  </div>
                  <span className="absolute left-3 top-3 rounded-md bg-black/30 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/85 backdrop-blur">
                    {c.meta}
                  </span>
                </div>
                <div className="px-3 pb-3 pt-4">
                  <h3 className="text-[16px] font-medium leading-snug">{c.title}</h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {c.tags.map((t) => (
                      <li key={t} className="rounded-full border border-ink/10 px-2.5 py-0.5 text-[11px] text-ink-mute">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
