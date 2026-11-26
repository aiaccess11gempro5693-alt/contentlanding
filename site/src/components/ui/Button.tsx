import type { ReactNode } from "react";

type Props = {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
  type?: "button" | "submit";
  className?: string;
};

/** Основная кнопка студии: синяя «таблетка» со стрелкой или прозрачная вторичная. */
export function Button({ href, children, variant = "primary", size = "md", type = "button", className = "" }: Props) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
  const sizes = size === "sm" ? "h-10 px-4 text-[14px]" : "h-12 px-6 text-[15px]";
  const variants =
    variant === "primary"
      ? "bg-brand text-white shadow-button hover:bg-brand-dark hover:-translate-y-0.5"
      : "border border-ink/10 bg-white/60 text-ink backdrop-blur hover:border-brand/40 hover:text-brand";
  const cls = `${base} ${sizes} ${variants} ${className}`;
  const inner = (
    <>
      {children}
      {variant === "primary" && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5" aria-hidden>
          <path d="M2 8h11m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
  if (href)
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  return (
    <button type={type} className={cls}>
      {inner}
    </button>
  );
}
