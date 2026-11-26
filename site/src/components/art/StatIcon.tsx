/** Тонкие линейные иконки для блока цифр. */
export function StatIcon({ name }: { name: "clock" | "cube" | "calendar" | "chart" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const color = { clock: "text-brand", cube: "text-violet", calendar: "text-teal", chart: "text-brand" }[name];
  return (
    <span className={`flex h-10 w-10 items-center justify-center rounded-xl border border-current/20 bg-white/70 ${color}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" {...common} aria-hidden>
        {name === "clock" && (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
          </>
        )}
        {name === "cube" && (
          <>
            <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
            <path d="M4 7.5 12 12l8-4.5M12 12v9" />
          </>
        )}
        {name === "calendar" && (
          <>
            <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
            <path d="M3.5 9.5h17M8 3v4M16 3v4" />
            <path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" strokeWidth="2" />
          </>
        )}
        {name === "chart" && (
          <>
            <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
            <path d="m7 15 3.5-3.5 3 2.5L17 9" />
          </>
        )}
      </svg>
    </span>
  );
}
