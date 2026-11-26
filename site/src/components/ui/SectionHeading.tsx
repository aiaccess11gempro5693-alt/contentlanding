import type { ReactNode } from "react";

/** Заголовок секции: моно-подпись с номером + крупный заголовок. */
export function SectionHeading({ index, label, title, aside }: { index: string; label: string; title: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-12">
      <div>
        <div className="label-mono mb-3">
          <span className="text-brand">{index}</span> — {label}
        </div>
        <h2 className="max-w-[720px] text-[30px] font-medium leading-[1.08] tracking-[-0.025em] text-ink sm:text-[40px] lg:text-[48px]">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
