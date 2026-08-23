import { cn } from "@/lib/utils";

export function Pill({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "brand" | "clay" | "outline";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5",
        "font-mono text-[11px] uppercase tracking-[0.13em] whitespace-nowrap",
        tone === "default" && "bg-surface text-ink-muted shadow-sm ring-1 ring-line-soft",
        tone === "brand" && "bg-brand-soft text-brand-deep",
        tone === "clay" && "bg-clay-soft text-clay",
        tone === "outline" && "text-ink-muted ring-1 ring-line",
        className,
      )}
    >
      {children}
    </span>
  );
}
