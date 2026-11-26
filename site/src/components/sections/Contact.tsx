import { useState, type FormEvent } from "react";
import { brand, contact } from "@/content";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/** Контакты и форма. Отправка пока локальная (без сети) — подключите свой обработчик в onSubmit. */
export function Contact() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: отправка заявки (CRM, почта, бот)
    setSent(true);
    e.currentTarget.reset();
  };

  const field =
    "w-full rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-[15px] text-ink placeholder:text-ink-mute/80 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <Reveal>
          <div className="glass-card relative overflow-hidden rounded-[28px] p-6 sm:p-10 lg:p-14">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(36,107,253,0.18),transparent_65%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-32 left-1/3 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(32,199,183,0.14),transparent_65%)]"
              aria-hidden
            />
            <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <div className="label-mono mb-4">
                  <span className="text-brand">05</span> — Контакты
                </div>
                <h2 id="contact-title" className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
                  {contact.title}
                  <br />
                  <span className="text-brand">{contact.subtitle}</span>
                </h2>
                <p className="mt-6 max-w-[440px] text-[15px] leading-relaxed text-ink-soft">{contact.text}</p>
                <dl className="mt-8 grid gap-3 font-mono text-[13px]">
                  <div className="flex gap-4">
                    <dt className="w-16 text-ink-mute">почта</dt>
                    <dd>
                      <a href={`mailto:${brand.email}`} className="hover:text-brand">
                        {brand.email}
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="w-16 text-ink-mute">тел.</dt>
                    <dd>{brand.phone}</dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="w-16 text-ink-mute">город</dt>
                    <dd>{brand.city}</dd>
                  </div>
                </dl>
              </div>

              <form onSubmit={onSubmit} className="glass-card grid gap-3 rounded-2xl p-5 sm:p-6" noValidate={false}>
                <label className="grid gap-1.5">
                  <span className="label-mono">{contact.form.name}</span>
                  <input name="name" required autoComplete="name" className={field} />
                </label>
                <label className="grid gap-1.5">
                  <span className="label-mono">{contact.form.contact}</span>
                  <input name="contact" required autoComplete="email" className={field} />
                </label>
                <label className="grid gap-1.5">
                  <span className="label-mono">{contact.form.message}</span>
                  <textarea name="message" rows={4} className={`${field} resize-none`} />
                </label>
                <Button type="submit" className="mt-2 w-full">
                  {contact.form.submit}
                </Button>
                <p className="text-[12px] leading-relaxed text-ink-mute" role="status" aria-live="polite">
                  {sent ? <span className="text-teal">{contact.form.success}</span> : contact.form.privacy}
                </p>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
