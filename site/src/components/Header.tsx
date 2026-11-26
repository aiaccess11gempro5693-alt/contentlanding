import { useEffect, useState } from "react";
import { brand, cta, nav } from "@/content";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";

/** Фиксированная шапка: становится «стеклянной» после начала прокрутки. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={`mx-auto flex h-14 max-w-[1360px] items-center justify-between rounded-2xl px-3 transition-all duration-500 sm:h-16 sm:px-5 ${
          scrolled ? "glass-card" : "border border-transparent"
        }`}
      >
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label={brand.name}>
          <Logo className="h-7 w-7 shrink-0" />
          <span className="text-[20px] font-medium tracking-[-0.02em] text-ink sm:text-[22px]">{brand.name}</span>
          <span className="hidden truncate pl-3 text-[13px] text-ink-mute xl:inline">{brand.tagline}</span>
        </a>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Основная навигация">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="text-[14px] text-ink/80 transition-colors hover:text-brand">
              {n.label}
            </a>
          ))}
        </nav>
        <Button href="#contact" size="sm">
          {cta.primary}
        </Button>
      </div>
    </header>
  );
}
