import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  href: string;
  variant?: "solid" | "ghost";
  className?: string;
};

export function Button({ children, href, variant = "solid", className }: ButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5",
        "text-[15px] font-medium transition-all duration-300",
        variant === "solid" &&
          "bg-ink text-paper hover:bg-brand-deep hover:shadow-lg hover:shadow-brand/15",
        variant === "ghost" && "text-ink ring-1 ring-line hover:bg-surface hover:ring-ink/25",
        className,
      )}
    >
      {children}
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
      >
        <path
          d="M2 8h11M9 4l4 4-4 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
