import { process } from "@/content";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const dotColor = ["bg-brand", "bg-brand", "bg-teal", "bg-violet", "bg-brand"];

/** Конвейер из пяти этапов: на десктопе — горизонтальная шкала, на мобильных — вертикальная. */
export function Process() {
  return (
    <section id="process" className="section" aria-labelledby="process-title">
      <div className="container">
        <SectionHeading index="02" label="Как мы работаем" title={<span id="process-title">{process.title}</span>} />
        <Reveal>
          <ol className="glass-card relative grid grid-cols-1 divide-y divide-ink/[0.06] rounded-[22px] p-2 lg:grid-cols-5 lg:divide-y-0">
            {/* линия-шкала */}
            <div className="absolute left-10 right-10 top-[74px] hidden h-px bg-gradient-to-r from-brand/40 via-teal/50 to-violet/40 lg:block" aria-hidden />
            {process.steps.map((s, i) => (
              <li key={s.id} className="relative flex gap-5 p-4 sm:p-5 lg:block lg:p-6">
                <div className="flex items-baseline gap-3 lg:mb-8">
                  <span className="font-mono text-[22px] font-light text-brand">{s.id}</span>
                  <span className="hidden text-[17px] font-medium lg:inline">{s.title}</span>
                </div>
                <span
                  className={`absolute right-5 top-[26px] h-[9px] w-[9px] rounded-full ring-4 ring-white lg:left-6 lg:right-auto lg:top-[70px] ${dotColor[i]}`}
                  aria-hidden
                />
                <div className="pr-6 lg:pr-0">
                  <div className="text-[17px] font-medium lg:hidden">{s.title}</div>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-soft lg:mt-0">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
