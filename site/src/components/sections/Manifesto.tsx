import { manifesto } from "@/content";
import { Reveal } from "@/components/ui/Reveal";

/** Короткий манифест сразу после hero. */
export function Manifesto() {
  return (
    <section className="section pb-10 lg:pb-14" aria-labelledby="manifesto-title">
      <div className="container grid gap-6 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-4">
          <div className="glass-card h-full rounded-2xl p-6 lg:p-8">
            <div className="label-mono mb-6 text-brand">{manifesto.label}</div>
            <h2 id="manifesto-title" className="text-2xl font-medium tracking-[-0.02em]">
              {manifesto.title}
            </h2>
            <div className="mt-8 flex items-center gap-3" aria-hidden>
              <span className="h-px w-16 bg-brand" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-8">
          <p className="text-[26px] font-light leading-[1.22] tracking-[-0.02em] text-ink sm:text-[34px] lg:text-[44px]">
            {manifesto.text}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
