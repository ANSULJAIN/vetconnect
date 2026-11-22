import { cn } from "@/lib/utils";

const LABEL: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  paid: "Waiting for vet",
  active: "Chat open",
  closed: "Closed",
  cancelled: "Cancelled",
  pending: "Under review",
  verified: "Verified",
  rejected: "Rejected",
  suspended: "Suspended",
};

const TONE: Record<string, string> = {
  awaiting_payment: "bg-paper-deep text-ink-muted",
  paid: "bg-clay-soft text-clay",
  active: "bg-brand-soft text-brand-deep",
  closed: "bg-paper-deep text-ink-muted",
  cancelled: "bg-paper-deep text-ink-faint",
  pending: "bg-clay-soft text-clay",
  verified: "bg-brand-soft text-brand-deep",
  rejected: "bg-paper-deep text-ink-muted",
  suspended: "bg-paper-deep text-ink-muted",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold tracking-wide uppercase",
        TONE[status] ?? "bg-paper-deep text-ink-muted",
        className,
      )}
    >
      {LABEL[status] ?? status}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: string | null }) {
  if (!urgency || urgency === "routine") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold tracking-wide uppercase",
        urgency === "emergency" ? "bg-clay text-white" : "bg-clay-soft text-clay",
      )}
    >
      {urgency === "emergency" ? "Emergency signs" : "See soon"}
    </span>
  );
}
