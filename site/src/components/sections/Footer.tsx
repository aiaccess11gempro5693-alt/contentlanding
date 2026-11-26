import { footer } from "@/content";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-ink/[0.06] bg-mist">
      <div className="container flex flex-col gap-4 py-8 text-[13px] text-ink-mute sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-ink">
          <Logo className="h-5 w-5" />
          {footer.signature}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {footer.links.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-ink">
              {l.label}
            </a>
          ))}
          <span className="font-mono">© {footer.year}</span>
        </div>
      </div>
    </footer>
  );
}
