type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Discovery — a search that finds nothing */
export function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g {...base}>
        <circle cx="14" cy="14" r="8.5" />
        <path d="M20.2 20.2 27 27" />
        <path d="M11 14h6" opacity="0.45" />
      </g>
    </svg>
  );
}

/** Latency — a clock running out */
export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g {...base}>
        <circle cx="16" cy="17" r="11" />
        <path d="M16 11v6l4 3" />
        <path d="M12 3h8" />
      </g>
    </svg>
  );
}

/** Trust — a credential badge */
export function IconBadge({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g {...base}>
        <path d="M16 3l10 4v9c0 6.5-4.2 11.4-10 13-5.8-1.6-10-6.5-10-13V7z" />
        <path d="M11.5 16l3 3 6-6" />
      </g>
    </svg>
  );
}

/** Triage — a phone with a signal */
export function IconTriage({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g {...base}>
        <rect x="9" y="3" width="14" height="26" rx="3" />
        <path d="M14 6h4" />
        <path d="M13 15.5c1.4-2 4.6-2 6 0" />
        <path d="M11 12.5c2.6-3.4 7.4-3.4 10 0" />
        <circle cx="16" cy="19.5" r="1.2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Dispatch — a route pin */
export function IconRoute({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g {...base}>
        <path d="M22 13c0 5.5-6 13-6 13s-6-7.5-6-13a6 6 0 1112 0z" />
        <circle cx="16" cy="13" r="2.2" />
      </g>
    </svg>
  );
}

/** Close — a prescription document */
export function IconRx({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g {...base}>
        <path d="M7 4h13l5 5v19H7z" />
        <path d="M20 4v5h5" />
        <path d="M11 14h4.5a2.2 2.2 0 010 4.4H11V14zm0 4.4V23m4.5-.4L19 23" />
      </g>
    </svg>
  );
}

/** Wallet / earnings */
export function IconWallet({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g {...base}>
        <rect x="4" y="8" width="24" height="17" rx="3" />
        <path d="M4 13h24" />
        <circle cx="22.5" cy="19" r="1.4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Stethoscope — used as the wordmark glyph */
export function IconStethoscope({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g {...base}>
        <path d="M9 4v7a6 6 0 0012 0V4" />
        <path d="M7 4h4M19 4h4" />
        <path d="M15 17v3a7 7 0 0014 0v-2" />
        <circle cx="27" cy="15" r="2.6" />
      </g>
    </svg>
  );
}
